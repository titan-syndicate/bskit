package auth

import (
	"context"
	"fmt"
	"net/http"

	"github.com/cli/oauth/device"
)

const (
	githubClientID = "Ov23li0AfjoGWqBjdoqe"
)

// StartDeviceAuth kicks off GitHub's Device Flow.
// It blocks until the user completes auth (polling under the hood).
func StartDeviceAuth() (*AccessToken, error) {
	httpClient := http.DefaultClient
	scopes := []string{"read:user"}

	code, err := device.RequestCode(httpClient, "https://github.com/login/device/code", githubClientID, scopes)
	if err != nil {
		return nil, fmt.Errorf("device flow failed: %w", err)
	}

	accessToken, err := device.Wait(context.Background(), httpClient, "https://github.com/login/oauth/access_token", device.WaitOptions{
		ClientID:   githubClientID,
		DeviceCode: code,
	})
	if err != nil {
		return nil, fmt.Errorf("device flow failed: %w", err)
	}

	return convertAccessToken(accessToken), nil
}

// GetUserCodeInfo returns the user code and verification URL for GitHub device flow
func GetUserCodeInfo() (*UserCodeInfo, error) {
	httpClient := http.DefaultClient
	scopes := []string{"read:user"}

	code, err := device.RequestCode(httpClient, "https://github.com/login/device/code", githubClientID, scopes)
	if err != nil {
		return nil, fmt.Errorf("failed to get user code info: %w", err)
	}

	return convertUserCodeInfo(code), nil
}
