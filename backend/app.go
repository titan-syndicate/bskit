package main

import (
	"context"
	"embed"
	"fmt"
	"log"

	"bskit/backend/terminal"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	app := NewApp()

	err := wails.Run(&options.App{
		Title:            "BSKit",
		Width:            1024,
		Height:           768,
		Assets:           assets,
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 59, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		log.Fatal(err)
	}
}

type App struct {
	ctx       context.Context
	readyChan chan struct{}
	eventCtx  context.Context
}

func NewApp() *App {
	return &App{
		readyChan: make(chan struct{}),
	}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.eventCtx = ctx

	fmt.Printf("Setting up event listeners...\n")

	// Set up event listener for when frontend connects
	runtime.EventsOn(a.eventCtx, "terminal:ready", func(data ...interface{}) {
		fmt.Printf("Received terminal:ready event\n")
		close(a.readyChan)
	})

	// Try EventsOnce instead of EventsOn
	runtime.EventsOnce(a.eventCtx, "terminal:log", func(data ...interface{}) {
		fmt.Printf("Backend received terminal:log event with data: %v\n", data)
		// Re-register the listener since EventsOnce only fires once
		runtime.EventsOnce(a.eventCtx, "terminal:log", func(data ...interface{}) {
			fmt.Printf("Backend received terminal:log event with data: %v\n", data)
		})
	})

	fmt.Printf("Event listeners set up complete\n")
}

// StartTerminalLogs starts streaming terminal logs to the frontend
func (a *App) StartTerminalLogs() {
	logChan := terminal.GenerateLogs()

	go func() {
		// Wait for frontend to be ready
		<-a.readyChan
		fmt.Printf("Frontend is ready, starting to emit logs\n")

		// Now start emitting logs
		for log := range logChan {
			runtime.EventsEmit(a.ctx, "terminal:log", log)
		}
	}()
}
