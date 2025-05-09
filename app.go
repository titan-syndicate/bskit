package main

import (
	"context"
	"fmt"
	"log"

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
		runtime.EventsEmit(a.ctx, "dagger:error", fmt.Sprintf("Failed to connect to Dagger: %v", err))
		return err
	}
	defer client.Close()

	// Create a container from the alpine image
	container := client.Container().From("alpine:latest")

	// Execute the command
	output, err := container.WithExec([]string{"sh", "-c", command}).Stdout(ctx)
	if err != nil {
		runtime.EventsEmit(a.ctx, "dagger:error", fmt.Sprintf("Command failed: %v", err))
		return err
	}

	// Send the output to the frontend
	runtime.EventsEmit(a.ctx, "dagger:output", output)
	runtime.EventsEmit(a.ctx, "dagger:done", "Command completed")
	return nil
}
