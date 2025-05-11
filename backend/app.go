package main

import (
	"context"
	"embed"
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
	ctx context.Context
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// StartTerminalLogs starts streaming terminal logs to the frontend
func (a *App) StartTerminalLogs() {
	logChan := terminal.GenerateLogs()

	go func() {
		for log := range logChan {
			runtime.EventsEmit(a.ctx, "terminal:log", log)
		}
	}()
}
