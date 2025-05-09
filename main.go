package main

import (
	"embed"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
)

//go:embed all:frontend/dist
var assets embed.FS

//go:embed build/appicon.png
var icon []byte

func main() {
	// Immediate console output for debugging
	fmt.Println("Starting application...")

	// Get user's home directory
	homeDir, err := os.UserHomeDir()
	if err != nil {
		fmt.Printf("Error getting home directory: %v\n", err)
		os.Exit(1)
	}

	// Create logs directory in user's home
	logDir := filepath.Join(homeDir, "Library", "Logs", "bskit")
	if err := os.MkdirAll(logDir, 0755); err != nil {
		fmt.Printf("Error creating log directory: %v\n", err)
		os.Exit(1)
	}

	// Set up logging to a file in the user's home directory
	logPath := filepath.Join(logDir, "app.log")
	fmt.Printf("Log file will be created at: %s\n", logPath)

	logFile, err := os.OpenFile(logPath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		fmt.Printf("Failed to open log file: %v\n", err)
		os.Exit(1)
	}
	defer logFile.Close()

	// Set up multi-writer to log to both file and stdout
	log.SetOutput(logFile)
	log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)

	fmt.Println("Logging initialized successfully")

	// Create an instance of the app structure
	app := NewApp()
	fmt.Println("App instance created")

	// Create application with options
	err = wails.Run(&options.App{
		Title:            "bskit",
		Width:            2056,
		Height:           768,
		Assets:           assets,
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		fmt.Printf("Fatal error starting application: %v\n", err)
		log.Fatal("Error starting application:", err)
	}
}
