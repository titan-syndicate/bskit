package auth

import (
	"context"
	"fmt"
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
		runtime.EventsEmit(a.ctx, "github:auth:started", nil)

		// Create a new HTTP client for polling
		httpClient := &http.Client{Timeout: 10 * time.Second}

		// Poll for the token
		token, err := device.Wait(context.Background(), httpClient, "https://github.com/login/oauth/access_token", device.WaitOptions{
			ClientID: githubClientID,
		})

		if err != nil {
			runtime.EventsEmit(a.ctx, "github:auth:error", err.Error())
			return
		}

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
	httpClient := &http.Client{Timeout: 10 * time.Second}
	code, err := device.RequestCode(httpClient, "https://github.com/login/device/code", githubClientID, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to request device code: %w", err)
	}

	return &UserCodeInfo{
		UserCode:        code.UserCode,
		VerificationURI: code.VerificationURI,
		ExpiresIn:       code.ExpiresIn,
		Interval:        code.Interval,
	}, nil
}

// StartDeviceAuth waits for the user to authorize the device and returns the access token.
func StartDeviceAuth() (*AccessToken, error) {
	httpClient := &http.Client{Timeout: 10 * time.Second}
	token, err := device.Wait(context.Background(), httpClient, "https://github.com/login/oauth/access_token", device.WaitOptions{
		ClientID: githubClientID,
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
