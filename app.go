package main

import (
	"context"
	"fmt"
	"log"
	"strings"

	"dagger.io/dagger"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	log.Println("Creating new app instance")
	return &App{}
}

// startup is called at application startup
func (a *App) startup(ctx context.Context) {
	log.Println("Starting up application...")
	// Perform your setup here
	a.ctx = ctx
	log.Println("Startup completed successfully")
}

// domReady is called after front-end resources have been loaded
func (a App) domReady(ctx context.Context) {
	log.Println("DOM ready")
	// Add your action here
}

// beforeClose is called when the application is about to quit,
// either by clicking the window close button or calling runtime.Quit.
// Returning true will cause the application to continue, false will continue shutdown as normal.
func (a *App) beforeClose(ctx context.Context) (prevent bool) {
	log.Println("Application closing...")
	return false
}

// shutdown is called at application termination
func (a *App) shutdown(ctx context.Context) {
	log.Println("Application shutting down...")
	// Perform your teardown here
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// RunDaggerCommand executes a Dagger command using the SDK
func (a *App) RunDaggerCommand(command string) error {
	// Create a new Dagger client
	ctx := context.Background()
	client, err := dagger.Connect(ctx)
	if err != nil {
		runtime.EventsEmit(a.ctx, "dagger:error", "Failed to connect to Dagger: "+err.Error())
		return err
	}
	defer client.Close()

	// Create a simple container that logs output
	runtime.EventsEmit(a.ctx, "dagger:output", "Starting test container...")

	// Use a simple alpine container that will print some output
	container := client.Container().
		From("alpine:latest").
		WithExec([]string{"sh", "-c", `
			echo "Starting test sequence..."
			sleep 1
			echo "Step 1: Hello from the container"
			sleep 1
			echo "Step 2: Testing stdout capture"
			sleep 1
			echo "Step 3: Almost done"
			sleep 1
			echo "Step 4: Test complete"
		`})

	// Get both stdout and stderr
	stdout, err := container.Stdout(ctx)
	if err != nil {
		runtime.EventsEmit(a.ctx, "dagger:error", "Failed to get stdout: "+err.Error())
		return err
	}
	stderr, err := container.Stderr(ctx)
	if err != nil {
		runtime.EventsEmit(a.ctx, "dagger:error", "Failed to get stderr: "+err.Error())
		return err
	}

	// Process stdout to ensure proper line breaks
	lines := strings.Split(stdout, "\n")
	for _, line := range lines {
		// Trim any carriage returns and whitespace
		line = strings.TrimSpace(line)
		if line != "" {
			runtime.EventsEmit(a.ctx, "dagger:output", line)
		}
	}

	// Process stderr similarly
	errorLines := strings.Split(stderr, "\n")
	for _, line := range errorLines {
		line = strings.TrimSpace(line)
		if line != "" {
			runtime.EventsEmit(a.ctx, "dagger:error", line)
		}
	}

	runtime.EventsEmit(a.ctx, "dagger:done", "Test completed successfully")
	return nil
}
