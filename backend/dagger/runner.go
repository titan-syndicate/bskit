package dagger

import (
	"bytes"
	"context"
	"fmt"

	"dagger.io/dagger"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type Runner struct {
	client *dagger.Client
	ctx    context.Context
	logBuf *bytes.Buffer
}

func NewRunner(ctx context.Context) (*Runner, error) {
	logBuf := &bytes.Buffer{}

	client, err := dagger.Connect(ctx,
		dagger.WithLogOutput(logBuf),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to dagger: %w", err)
	}

	return &Runner{
		client: client,
		ctx:    ctx,
		logBuf: logBuf,
	}, nil
}

func (r *Runner) RunContainer(imageName string) error {
	// Get the container from the image
	container := r.client.Container().From(imageName)

	// Get Docker socket
	dockerSocket := r.client.Host().UnixSocket("/var/run/docker.sock")

	// Configure container with Docker socket and exposed port
	container = container.
		WithUnixSocket("/var/run/docker.sock", dockerSocket).
		WithExposedPort(3000)

	// Start the container
	_, err := container.Sync(r.ctx)
	if err != nil {
		return fmt.Errorf("failed to start container: %w", err)
	}

	// Stream logs to the frontend
	go func() {
		for {
			select {
			case <-r.ctx.Done():
				return
			default:
				if r.logBuf.Len() > 0 {
					runtime.EventsEmit(r.ctx, "build:log", r.logBuf.String())
					r.logBuf.Reset()
				}
			}
		}
	}()

	return nil
}

func (r *Runner) Close() error {
	return r.client.Close()
}
