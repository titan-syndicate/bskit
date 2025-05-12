package auth

import (
	"github.com/cli/oauth/api"
	"github.com/cli/oauth/device"
)

// UserCodeInfo represents the information needed for GitHub device flow
type UserCodeInfo struct {
	DeviceCode      string `json:"deviceCode"`
	UserCode        string `json:"userCode"`
	VerificationURI string `json:"verificationUri"`
	ExpiresIn       int    `json:"expiresIn"`
	Interval        int    `json:"interval"`
}

// AccessToken represents a GitHub OAuth access token
type AccessToken struct {
	Token string `json:"token"`
	Type  string `json:"type"`
	Scope string `json:"scope"`
}

// Convert from GitHub OAuth API types to our types
func convertUserCodeInfo(info *device.CodeResponse) *UserCodeInfo {
	return &UserCodeInfo{
		UserCode:        info.UserCode,
		VerificationURI: info.VerificationURI,
		ExpiresIn:       info.ExpiresIn,
		Interval:        info.Interval,
	}
}

func convertAccessToken(token *api.AccessToken) *AccessToken {
	return &AccessToken{
		Token: token.Token,
		Type:  token.Type,
		Scope: token.Scope,
	}
}
