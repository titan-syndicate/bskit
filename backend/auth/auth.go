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
func (a *Auth) StartGitHubLogin() (*UserCodeInfo, error) {
	return GetUserCodeInfo()
}

// CompleteGitHubLogin completes the GitHub device flow authentication.
func (a *Auth) CompleteGitHubLogin() (*AccessToken, error) {
	return StartDeviceAuth()
}
