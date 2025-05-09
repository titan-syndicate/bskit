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
		runtime.EventsEmit(a.ctx, "dagger:error", "\r\nFailed to connect to Dagger: "+err.Error()+"\r\n")
		return err
	}
	defer client.Close()

	// Create kind config file
	runtime.EventsEmit(a.ctx, "dagger:output", "\r\nCreating kind config...\r\n")
	kindConfig := `kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  extraPortMappings:
  - containerPort: 80
    hostPort: 8080
    protocol: TCP`

	// Create a container with kind installed
	runtime.EventsEmit(a.ctx, "dagger:output", "\r\nSetting up kind container...\r\n")
	kind := client.Container().
		From("golang:1.21").
		WithExec([]string{"sh", "-c", "go install sigs.k8s.io/kind@latest"}).
		WithNewFile("/kind-config.yaml", kindConfig).
		WithExec([]string{"kind", "create", "cluster", "--config", "/kind-config.yaml", "--name", "dagger-test"})

	// Get kind cluster creation output
	runtime.EventsEmit(a.ctx, "dagger:output", "\r\nCreating Kubernetes cluster...\r\n")
	kindOutput, err := kind.Stdout(ctx)
	if err != nil {
		runtime.EventsEmit(a.ctx, "dagger:error", "\r\nFailed to create kind cluster: "+err.Error()+"\r\n")
		return err
	}
	runtime.EventsEmit(a.ctx, "dagger:output", "\r\n"+kindOutput+"\r\n")

	// Create kubectl container to interact with the cluster
	runtime.EventsEmit(a.ctx, "dagger:output", "\r\nSetting up kubectl...\r\n")
	kubectl := client.Container().
		From("bitnami/kubectl:latest").
		WithFile("/root/.kube/config", kind.File("/root/.kube/config")).
		WithExec([]string{"kubectl", "get", "nodes"})

	// Get node status
	runtime.EventsEmit(a.ctx, "dagger:output", "\r\nChecking cluster status...\r\n")
	nodeStatus, err := kubectl.Stdout(ctx)
	if err != nil {
		runtime.EventsEmit(a.ctx, "dagger:error", "\r\nFailed to get node status: "+err.Error()+"\r\n")
		return err
	}
	runtime.EventsEmit(a.ctx, "dagger:output", "\r\n"+nodeStatus+"\r\n")

	// Deploy nginx
	runtime.EventsEmit(a.ctx, "dagger:output", "\r\nDeploying nginx...\r\n")
	deploy := kubectl.
		WithExec([]string{"kubectl", "create", "deployment", "nginx", "--image=nginx:latest"})

	deployOutput, err := deploy.Stdout(ctx)
	if err != nil {
		runtime.EventsEmit(a.ctx, "dagger:error", "\r\nFailed to deploy nginx: "+err.Error()+"\r\n")
		return err
	}
	runtime.EventsEmit(a.ctx, "dagger:output", "\r\n"+deployOutput+"\r\n")

	// Expose the deployment
	runtime.EventsEmit(a.ctx, "dagger:output", "\r\nExposing nginx service...\r\n")
	expose := kubectl.
		WithExec([]string{"kubectl", "expose", "deployment", "nginx", "--port=80", "--type=NodePort"})

	exposeOutput, err := expose.Stdout(ctx)
	if err != nil {
		runtime.EventsEmit(a.ctx, "dagger:error", "\r\nFailed to expose nginx: "+err.Error()+"\r\n")
		return err
	}
	runtime.EventsEmit(a.ctx, "dagger:output", "\r\n"+exposeOutput+"\r\n")

	// Get service details
	runtime.EventsEmit(a.ctx, "dagger:output", "\r\nGetting service details...\r\n")
	serviceInfo := kubectl.
		WithExec([]string{"kubectl", "get", "svc", "nginx"})

	serviceOutput, err := serviceInfo.Stdout(ctx)
	if err != nil {
		runtime.EventsEmit(a.ctx, "dagger:error", "\r\nFailed to get service info: "+err.Error()+"\r\n")
		return err
	}
	runtime.EventsEmit(a.ctx, "dagger:output", "\r\n"+serviceOutput+"\r\n")

	runtime.EventsEmit(a.ctx, "dagger:done", "\r\nKubernetes cluster setup and nginx deployment completed successfully\r\n")
	return nil
}
