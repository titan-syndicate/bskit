package pack

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/image"
	"github.com/docker/docker/client"
	"github.com/docker/docker/pkg/stdcopy"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type PackBuilder struct {
	dockerClient *client.Client
	ctx          context.Context
}

func NewPackBuilder(ctx context.Context) (*PackBuilder, error) {
	dockerClient, err := client.NewClientWithOpts(
		client.FromEnv,
		client.WithVersion("1.48"),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create docker client: %v", err)
	}

	return &PackBuilder{
		dockerClient: dockerClient,
		ctx:          ctx,
	}, nil
}

func (p *PackBuilder) Build(selectedDirectory string) error {
	// Validate selected directory exists
	if _, err := os.Stat(selectedDirectory); os.IsNotExist(err) {
		return fmt.Errorf("selected directory does not exist: %s", selectedDirectory)
	}

	// Use selected directory for Docker mount
	absSelectedPath, err := filepath.Abs(selectedDirectory)
	if err != nil {
		return fmt.Errorf("failed to get absolute path: %v", err)
	}

	// Pull the pack image if not available
	imageName := "buildpacksio/pack:latest"
	_, err = p.dockerClient.ImageInspect(p.ctx, imageName)
	if err != nil {
		if !strings.Contains(err.Error(), "No such image") {
			return fmt.Errorf("failed to inspect image: %v", err)
		}

		runtime.EventsEmit(p.ctx, "build:log", "Pulling pack CLI image...")
		out, err := p.dockerClient.ImagePull(p.ctx, imageName, image.PullOptions{})
		if err != nil {
			return fmt.Errorf("failed to pull image: %v", err)
		}
		defer out.Close()

		// Process the JSON stream output
		decoder := json.NewDecoder(out)
		for {
			var pullOutput struct {
				Status string `json:"status"`
				ID     string `json:"id"`
			}
			if err := decoder.Decode(&pullOutput); err != nil {
				if err == io.EOF {
					break
				}
				return fmt.Errorf("failed to decode pull output: %v", err)
			}
			if pullOutput.Status != "" {
				runtime.EventsEmit(p.ctx, "build:log", pullOutput.Status)
			}
		}

		// Verify the image was pulled successfully
		if _, err := p.dockerClient.ImageInspect(p.ctx, imageName); err != nil {
			return fmt.Errorf("image pull completed but image not found: %v", err)
		}
	}

	// Prepare command arguments
	buildArgs := []string{"build", "test-app"}
	buildArgs = append(buildArgs, "--path", "/workspace")
	buildArgs = append(buildArgs, "--builder", "paketobuildpacks/builder-jammy-base")
	buildArgs = append(buildArgs, "--creation-time", "now")
	buildArgs = append(buildArgs, "--platform", "linux/arm64")

	// Create container config
	config := &container.Config{
		Image: imageName,
		Cmd:   buildArgs,
		User:  "root", // Run as root to ensure access to Docker socket
	}

	// Create host config with volume mount
	hostConfig := &container.HostConfig{
		Binds: []string{
			fmt.Sprintf("%s:/workspace", absSelectedPath),
			"/var/run/docker.sock:/var/run/docker.sock",
		},
		// Ensure the container has access to the Docker socket
		SecurityOpt: []string{"label:disable"},
	}

	// Create the container
	resp, err := p.dockerClient.ContainerCreate(p.ctx, config, hostConfig, nil, nil, "")
	if err != nil {
		return fmt.Errorf("failed to create container: %v", err)
	}

	// Start the container
	if err := p.dockerClient.ContainerStart(p.ctx, resp.ID, container.StartOptions{}); err != nil {
		return fmt.Errorf("failed to start container: %v", err)
	}

	// Set up a channel to receive container logs
	logs, err := p.dockerClient.ContainerLogs(p.ctx, resp.ID, container.LogsOptions{
		ShowStdout: true,
		ShowStderr: true,
		Follow:     true,
	})
	if err != nil {
		return fmt.Errorf("failed to get container logs: %v", err)
	}
	defer logs.Close()

	// Set up a channel to receive container completion
	statusCh, errCh := p.dockerClient.ContainerWait(p.ctx, resp.ID, container.WaitConditionNotRunning)

	// Stream logs in a goroutine
	go func() {
		// Use stdcopy to properly handle Docker log format
		_, err = stdcopy.StdCopy(
			&logWriter{ctx: p.ctx, prefix: ""},
			&logWriter{ctx: p.ctx, prefix: ""},
			logs,
		)
		if err != nil {
			runtime.EventsEmit(p.ctx, "build:log", fmt.Sprintf("Error reading logs: %v", err))
		}
	}()

	// Wait for container completion
	select {
	case err := <-errCh:
		if err != nil {
			return fmt.Errorf("error waiting for container: %v", err)
		}
	case status := <-statusCh:
		// Container completed successfully
		if status.StatusCode != 0 {
			return fmt.Errorf("build failed with exit code %d", status.StatusCode)
		}
	}

	// Remove the container
	if err := p.dockerClient.ContainerRemove(p.ctx, resp.ID, container.RemoveOptions{}); err != nil {
		log.Printf("Warning: Failed to remove container: %v", err)
	}

	// Add completion message
	runtime.EventsEmit(p.ctx, "build:log", "\n\x1b[1;32m✓ Build completed successfully!\x1b[0m")
	runtime.EventsEmit(p.ctx, "build:log", "\nTo run the application, use:")
	runtime.EventsEmit(p.ctx, "build:log", "\n\x1b[1;34m$ docker run -p 3000:3000 test-app\x1b[0m")
	runtime.EventsEmit(p.ctx, "build:log", "\nThe application will be available at http://localhost:3000")

	return nil
}

// logWriter implements io.Writer to handle Docker log output
type logWriter struct {
	ctx    context.Context
	prefix string
	buffer []byte
}

func (w *logWriter) Write(p []byte) (n int, err error) {
	// Append to buffer
	w.buffer = append(w.buffer, p...)

	// Process complete lines
	for {
		// Find the next newline
		i := bytes.IndexByte(w.buffer, '\n')
		if i == -1 {
			// No complete line found, keep the data in buffer
			break
		}

		// Extract the line (excluding the newline)
		line := w.buffer[:i]
		// Remove the processed line and newline from buffer
		w.buffer = w.buffer[i+1:]

		// Skip empty lines
		if len(line) == 0 {
			continue
		}

		// Emit the log line to the frontend
		runtime.EventsEmit(w.ctx, "build:log", string(line))
	}

	return len(p), nil
}
