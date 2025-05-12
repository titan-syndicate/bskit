package backend

import (
	"context"
	"fmt"
	"log"
	"path/filepath"

	"bskit/backend/auth"
	"bskit/backend/pack"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx         context.Context
	readyChan   chan struct{}
	eventCtx    context.Context
	packBuilder *pack.PackBuilder
	Auth        *auth.Auth
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		readyChan: make(chan struct{}),
	}
}

// Startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
	a.eventCtx = ctx

	fmt.Printf("Setting up event listeners...\n")

	// Initialize pack builder
	var err error
	a.packBuilder, err = pack.NewPackBuilder(ctx)
	if err != nil {
		log.Printf("Failed to initialize pack builder: %v", err)
		return
	}

	// Set up event listener for when frontend connects
	runtime.EventsOn(a.eventCtx, "build:ready", func(data ...interface{}) {
		fmt.Printf("Received build:ready event\n")
		select {
		case <-a.readyChan:
			// Channel already closed, do nothing
		default:
			close(a.readyChan)
		}
	})

	fmt.Printf("Event listeners set up complete\n")

	a.Auth = auth.NewAuth(ctx)
}

// StartBuild starts the build process using pack CLI
func (a *App) StartBuild() {
	// Get the absolute path to the test-app directory
	absPath, err := filepath.Abs("test-app")
	if err != nil {
		runtime.EventsEmit(a.ctx, "build:log", fmt.Sprintf("Error: failed to get absolute path: %v", err))
		return
	}

	// Start the build process
	if err := a.packBuilder.Build(absPath); err != nil {
		runtime.EventsEmit(a.ctx, "build:log", fmt.Sprintf("Error: build failed: %v", err))
	}
}

// StartGitHubLogin starts the GitHub device flow authentication
func (a *App) StartGitHubLogin() (*auth.UserCodeInfo, error) {
	return a.Auth.StartGitHubLogin()
}

// CompleteGitHubLogin completes the GitHub device flow authentication
func (a *App) CompleteGitHubLogin() (*auth.AccessToken, error) {
	return a.Auth.CompleteGitHubLogin()
}
