package backend

import (
	"context"
	"fmt"
	"log"
	"path/filepath"

	"bskit/backend/auth"
	"bskit/backend/pack"
	"bskit/backend/repo"

	"github.com/sqweek/dialog"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// TODO: refactor to use an interface based approach
// App struct
type App struct {
	ctx         context.Context
	readyChan   chan struct{}
	eventCtx    context.Context
	packBuilder *pack.PackBuilder
	Auth        *auth.Auth
	repo        *repo.RepoManager
}

// NewApp creates a new App application struct
func NewApp() *App {
	repoManager, err := repo.NewRepoManager()
	if err != nil {
		log.Printf("Failed to initialize repo manager: %v", err)
		return nil
	}
	return &App{
		readyChan: make(chan struct{}),
		repo:      repoManager,
	}
}

// Startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
	a.eventCtx = ctx

	fmt.Printf("Setting up event listeners...\n")

	// Initialize auth with the correct context
	a.Auth = auth.NewAuth(ctx)

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

	// Add event listener for build:start
	runtime.EventsOn(a.eventCtx, "build:start", func(data ...interface{}) {
		if len(data) > 0 {
			if buildData, ok := data[0].(map[string]interface{}); ok {
				a.StartBuild(buildData)
			} else {
				runtime.EventsEmit(a.ctx, "build:log", "Error: Invalid build data received.")
			}
		} else {
			runtime.EventsEmit(a.ctx, "build:log", "Error: No build data received.")
		}
	})

	// Add event listener for directory selection
	runtime.EventsOn(a.eventCtx, "directory:select", func(data ...interface{}) {
		selectedDirectory := a.SelectDirectory()
		runtime.EventsEmit(a.ctx, "directory:selected", selectedDirectory)
	})

	fmt.Printf("Event listeners set up complete\n")
}

// StartBuild starts the build process using pack CLI
func (a *App) StartBuild(data map[string]interface{}) {
	selectedDirectory, ok := data["selectedDirectory"].(string)
	if !ok || selectedDirectory == "" {
		runtime.EventsEmit(a.ctx, "build:log", "Error: No directory selected.")
		return
	}

	platform, ok := data["platform"].(string)
	if !ok || (platform != "arm64" && platform != "amd64") {
		runtime.EventsEmit(a.ctx, "build:log", "Error: Invalid platform selected.")
		return
	}

	// Validate the selected directory
	absPath, err := filepath.Abs(selectedDirectory)
	if err != nil {
		runtime.EventsEmit(a.ctx, "build:log", fmt.Sprintf("Error: failed to get absolute path: %v", err))
		return
	}

	// Start the build process
	if err := a.packBuilder.Build(absPath, platform); err != nil {
		runtime.EventsEmit(a.ctx, "build:log", fmt.Sprintf("Error: build failed: %v", err))
	}
}

// SelectDirectory opens a directory selection dialog and returns the selected path
func (a *App) SelectDirectory() string {
	selectedDirectory, err := dialog.Directory().Title("Select Directory").Browse()
	if err != nil {
		log.Printf("Error selecting directory: %v", err)
		return ""
	}
	return selectedDirectory
}

// StartGitHubLogin starts the GitHub device flow authentication
func (a *App) StartGitHubLogin() (*auth.UserCodeInfo, error) {
	return a.Auth.StartGitHubLogin()
}

// GetRecentRepos returns the user's recent repositories
func (a *App) GetRecentRepos() ([]auth.Repo, error) {
	return a.Auth.GetRecentRepos()
}

// CloneRepo clones a GitHub repository
func (a *App) CloneRepo(url string) (string, error) {
	return a.repo.CloneRepo(url)
}

// GetRepoStatus checks if a repository is already cloned
func (a *App) GetRepoStatus(url string) (*repo.RepoStatus, error) {
	return a.repo.GetRepoStatus(url)
}

// ListClonedRepos returns a list of all cloned repositories
func (a *App) ListClonedRepos() ([]string, error) {
	return a.repo.ListClonedRepos()
}
