package auth

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/cli/oauth/device"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

const (
	githubClientID = "Ov23li0AfjoGWqBjdoqe"
)

// StartDeviceAuth starts the GitHub device flow authentication.
func (a *Auth) StartDeviceAuth() (*UserCodeInfo, error) {
	userCodeInfo, err := GetUserCodeInfo()
	if err != nil {
		return nil, err
	}

	// Spawn a goroutine to poll for the token
	go func() {
		log.Println("Starting GitHub device flow polling...")
		runtime.EventsEmit(a.ctx, "github:auth:started", nil)

		// Create a context with a 2-minute timeout
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
		defer cancel()

		// Create a new HTTP client for polling
		httpClient := &http.Client{Timeout: 10 * time.Second}

		// Poll for the token
		log.Println("Waiting for user authorization...")
		token, err := pollForToken(ctx, httpClient, userCodeInfo)

		if err != nil {
			log.Printf("Error during device flow: %v", err)
			runtime.EventsEmit(a.ctx, "github:auth:error", err.Error())
			return
		}

		log.Println("Successfully obtained GitHub token")
		// Convert the token to our AccessToken type
		accessToken := &AccessToken{
			Token: token.Token,
			Type:  token.Type,
			Scope: token.Scope,
		}

		runtime.EventsEmit(a.ctx, "github:auth:success", accessToken)
	}()

	return userCodeInfo, nil
}

// GetUserCodeInfo requests a user code and verification URI from GitHub.
func GetUserCodeInfo() (*UserCodeInfo, error) {
	log.Println("Requesting device code from GitHub...")
	httpClient := &http.Client{Timeout: 10 * time.Second}
	code, err := device.RequestCode(httpClient, "https://github.com/login/device/code", githubClientID, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to request device code: %w", err)
	}

	log.Printf("Got user code: %s", code.UserCode)
	log.Printf("Got device code: %s", code.DeviceCode)
	return &UserCodeInfo{
		DeviceCode:      code.DeviceCode,
		UserCode:        code.UserCode,
		VerificationURI: code.VerificationURI,
		ExpiresIn:       code.ExpiresIn,
		Interval:        code.Interval,
	}, nil
}

// pollForToken waits for the user to authorize the device and returns the access token.
func pollForToken(ctx context.Context, httpClient *http.Client, userCodeInfo *UserCodeInfo) (*AccessToken, error) {
	// Create a device code from the user code info
	code := &device.CodeResponse{
		DeviceCode:      userCodeInfo.DeviceCode,
		UserCode:        userCodeInfo.UserCode,
		VerificationURI: userCodeInfo.VerificationURI,
		ExpiresIn:       userCodeInfo.ExpiresIn,
		Interval:        userCodeInfo.Interval,
	}

	token, err := device.Wait(ctx, httpClient, "https://github.com/login/oauth/access_token", device.WaitOptions{
		ClientID:   githubClientID,
		DeviceCode: code,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to wait for device authorization: %w", err)
	}

	return &AccessToken{
		Token: token.Token,
		Type:  token.Type,
		Scope: token.Scope,
	}, nil
}
