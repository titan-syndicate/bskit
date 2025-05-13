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
	// 1) Prep the host socket
	socket := r.client.Host().UnixSocket("/var/run/docker.sock")

	// 2) In a docker CLI container, save your local image into /tmp/image.tar
	tarFile := r.client.
		Container().
		From("docker:23.0.1-cli").
		WithUnixSocket("/var/run/docker.sock", socket).
		WithExec([]string{
			"docker", "image", "save", "-o", "/tmp/image.tar", imageName,
		}).
		File("/tmp/image.tar")

	// 3) Import that tarball as a real Container in Dagger
	ctr := r.client.
		Container().
		Import(tarFile).
		WithUnixSocket("/var/run/docker.sock", socket).
		WithExposedPort(3000)

	// 4) Kick it off (Sync or Stdout will block until exit, but logs stream via WithLogOutput)
	if _, err := ctr.Sync(r.ctx); err != nil {
		return fmt.Errorf("failed to start container: %w", err)
	}

	// 5) Meanwhile your dagger.Connect was set up with WithLogOutput(&r.logBuf),
	//    so all `docker run` output is flowing into r.logBuf in real time.
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
