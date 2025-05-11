package pack

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"

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

func (p *PackBuilder) Build(sourcePath string) error {
	// Validate path exists
	if _, err := os.Stat(sourcePath); os.IsNotExist(err) {
		return fmt.Errorf("path does not exist: %s", sourcePath)
	}

	// Get absolute path of source directory
	absPath, err := filepath.Abs(sourcePath)
	if err != nil {
		return fmt.Errorf("failed to get absolute path: %v", err)
	}

	// Pull the pack image if not available
	imageName := "buildpacksio/pack:latest"
	_, _, err = p.dockerClient.ImageInspectWithRaw(p.ctx, imageName)
	if err != nil {
		runtime.EventsEmit(p.ctx, "terminal:log", "Pulling pack CLI image...")
		out, err := p.dockerClient.ImagePull(p.ctx, imageName, image.PullOptions{})
		if err != nil {
			return fmt.Errorf("failed to pull image: %v", err)
		}
		defer out.Close()
		stdcopy.StdCopy(os.Stdout, os.Stderr, out)
	}

	// Prepare command arguments
	buildArgs := []string{"build", "test-app"}
	buildArgs = append(buildArgs, "--path", "/workspace")
	buildArgs = append(buildArgs, "--builder", "paketobuildpacks/builder-jammy-base")
	buildArgs = append(buildArgs, "--creation-time", "now")

	// Create container config
	config := &container.Config{
		Image: imageName,
		Cmd:   buildArgs,
		User:  "root", // Run as root to ensure access to Docker socket
	}

	// Create host config with volume mount
	hostConfig := &container.HostConfig{
		Binds: []string{
			fmt.Sprintf("%s:/workspace", absPath),
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
		// Stream logs to both stdout/stderr and emit them to the frontend
		_, err := stdcopy.StdCopy(os.Stdout, os.Stderr, logs)
		if err != nil {
			runtime.EventsEmit(p.ctx, "terminal:log", fmt.Sprintf("Error reading logs: %v", err))
			return
		}
	}()

	// Wait for container completion
	select {
	case err := <-errCh:
		if err != nil {
			return fmt.Errorf("error waiting for container: %v", err)
		}
	case <-statusCh:
		// Container completed successfully
	}

	// Remove the container
	if err := p.dockerClient.ContainerRemove(p.ctx, resp.ID, container.RemoveOptions{}); err != nil {
		log.Printf("Warning: Failed to remove container: %v", err)
	}

	return nil
}
