package auth

import (
	"context"
)

// Auth encapsulates the GitHub OAuth functionality.
type Auth struct {
	ctx context.Context
}

// NewAuth creates a new Auth instance.
func NewAuth(ctx context.Context) *Auth {
	return &Auth{ctx: ctx}
}

// StartGitHubLogin starts the GitHub device flow authentication.
// It returns the device code and verification URI, and starts polling for the token in the background.
// The token will be emitted as an event when available.
func (a *Auth) StartGitHubLogin() (*UserCodeInfo, error) {
	return a.StartDeviceAuth()
}
