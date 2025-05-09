package main

import (
	"context"
	"fmt"
	"log"

	"dagger.io/dagger"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// TerminalWriter implements io.Writer to emit events to the terminal
type TerminalWriter struct {
	ctx context.Context
}

func (w *TerminalWriter) Write(p []byte) (n int, err error) {
	// Convert the bytes to a string and emit it as an event
	line := string(p)
	runtime.EventsEmit(w.ctx, "dagger:output", line)
	return len(p), nil
}

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
	// Create a custom writer that emits events to the terminal
	terminalWriter := &TerminalWriter{ctx: a.ctx}

	// Create a new Dagger client with log streaming to our custom writer
	ctx := context.Background()
	client, err := dagger.Connect(ctx, dagger.WithLogOutput(terminalWriter))
	if err != nil {
		runtime.EventsEmit(a.ctx, "dagger:error", "Failed to connect to Dagger: "+err.Error())
		return err
	}
	defer client.Close()

	// Use a simple alpine container that will print some output
	container := client.Container().
		From("alpine:latest").
		WithExec([]string{"sh", "-c", `
			echo "Starting test sequence..."
			sleep 1
			echo "Step 1: Hello from the container"
			sleep 10
			echo "Step 2: Testing stdout capture"
			sleep 5
			echo "Step 3: Almost done"
			sleep 8
			echo "Step 4: Test complete"
		`})

	// Wait for the command to complete
	exitCode, err := container.ExitCode(ctx)
	if err != nil {
		runtime.EventsEmit(a.ctx, "dagger:error", "Failed to execute container: "+err.Error())
		return err
	}

	if exitCode != 0 {
		runtime.EventsEmit(a.ctx, "dagger:error", fmt.Sprintf("Command exited with code %d", exitCode))
		return fmt.Errorf("command exited with code %d", exitCode)
	}

	runtime.EventsEmit(a.ctx, "dagger:done", "Test completed successfully")
	return nil
}
