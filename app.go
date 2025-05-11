package main

import (
	"context"
	"fmt"

	"bskit/backend/terminal"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// StartTerminalLogs starts emitting terminal logs
func (a *App) StartTerminalLogs() {
	// Get the log channel from the terminal package
	logChan := terminal.GenerateLogs()

	// Start a goroutine to forward logs to the frontend
	go func() {
		for log := range logChan {
			// Emit the log event
			runtime.EventsEmit(a.ctx, "terminal:log", log)
		}
	}()
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
