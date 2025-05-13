package auth

import (
	"context"
)

// Auth encapsulates the GitHub OAuth functionality.
type Auth struct {
	ctx         context.Context
	accessToken *AccessToken
}

// NewAuth creates a new Auth instance.
func NewAuth(ctx context.Context) *Auth {
	return &Auth{ctx: ctx}
}

// GetAccessToken returns the current access token if available
func (a *Auth) GetAccessToken() *AccessToken {
	return a.accessToken
}

// StartGitHubLogin starts the GitHub device flow authentication.
// It returns the device code and verification URI, and starts polling for the token in the background.
// The token will be emitted as an event when available.
func (a *Auth) StartGitHubLogin() (*UserCodeInfo, error) {
	return a.StartDeviceAuth()
}
