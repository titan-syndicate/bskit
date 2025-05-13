package auth

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/cli/oauth/device"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

const (
	githubClientID = "Ov23li0AfjoGWqBjdoqe"
	githubAPIURL   = "https://api.github.com"
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

		// Store the token in memory
		a.accessToken = accessToken

		// Fetch user info
		userInfo, err := a.fetchUserInfo(token.Token)
		if err != nil {
			log.Printf("Error fetching user info: %v", err)
			runtime.EventsEmit(a.ctx, "github:auth:error", err.Error())
			return
		}

		// Emit success event with user info
		runtime.EventsEmit(a.ctx, "github:auth:success", userInfo)
	}()

	return userCodeInfo, nil
}

// fetchUserInfo fetches the user's information from GitHub API
func (a *Auth) fetchUserInfo(token string) (*UserInfo, error) {
	// Fetch basic user info
	req, err := http.NewRequest("GET", fmt.Sprintf("%s/user", githubAPIURL), nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	req.Header.Set("Accept", "application/vnd.github.v3+json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch user info: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch user info: status code %d", resp.StatusCode)
	}

	// Read the raw response body for logging
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}
	log.Printf("GitHub API Response (user): %s", string(body))

	// Create a new reader from the body for decoding
	var userInfo UserInfo
	if err := json.NewDecoder(bytes.NewReader(body)).Decode(&userInfo); err != nil {
		return nil, fmt.Errorf("failed to decode user info: %w", err)
	}

	// Fetch user emails
	emailReq, err := http.NewRequest("GET", fmt.Sprintf("%s/user/emails", githubAPIURL), nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create email request: %w", err)
	}

	emailReq.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	emailReq.Header.Set("Accept", "application/vnd.github.v3+json")

	emailResp, err := client.Do(emailReq)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch user emails: %w", err)
	}
	defer emailResp.Body.Close()

	if emailResp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch user emails: status code %d", emailResp.StatusCode)
	}

	// Read the raw email response body for logging
	emailBody, err := io.ReadAll(emailResp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read email response body: %w", err)
	}
	log.Printf("GitHub API Response (emails): %s", string(emailBody))

	// Parse email addresses
	var emails []struct {
		Email    string `json:"email"`
		Primary  bool   `json:"primary"`
		Verified bool   `json:"verified"`
	}
	if err := json.NewDecoder(bytes.NewReader(emailBody)).Decode(&emails); err != nil {
		return nil, fmt.Errorf("failed to decode email info: %w", err)
	}

	// Find primary email
	for _, email := range emails {
		if email.Primary && email.Verified {
			userInfo.Email = email.Email
			break
		}
	}

	log.Printf("Final UserInfo: %+v", userInfo)
	return &userInfo, nil
}

// GetUserCodeInfo requests a user code and verification URI from GitHub.
func GetUserCodeInfo() (*UserCodeInfo, error) {
	log.Println("Requesting device code from GitHub...")
	httpClient := &http.Client{Timeout: 10 * time.Second}
	code, err := device.RequestCode(httpClient, "https://github.com/login/device/code", githubClientID, []string{
		"read:user",  // For basic profile info
		"user:email", // For email access
	})
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

// GetRecentRepos fetches the user's recent repositories using GraphQL
func (a *Auth) GetRecentRepos() ([]Repo, error) {
	if a.accessToken == nil {
		return nil, fmt.Errorf("not authenticated")
	}

	query := `
	query {
		viewer {
			repositoriesContributedTo(
				first: 10,
				contributionTypes: [COMMIT],
				orderBy: { field: PUSHED_AT, direction: DESC }
			) {
				nodes {
					nameWithOwner
					url
					pushedAt
					defaultBranchRef {
						name
					}
				}
			}
		}
	}`

	// Log the query we're about to send
	log.Printf("Sending GraphQL query: %s", query)

	// Create request body
	requestBody := map[string]interface{}{
		"query": query,
	}
	jsonBody, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request body: %w", err)
	}

	req, err := http.NewRequest("POST", "https://api.github.com/graphql", bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", a.accessToken.Token))
	req.Header.Set("Content-Type", "application/json")

	// Log request details
	log.Printf("Making request to GitHub GraphQL API with headers: %v", req.Header)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch repos: %w", err)
	}
	defer resp.Body.Close()

	// Read and log the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}
	log.Printf("GitHub API Response Status: %d", resp.StatusCode)
	log.Printf("GitHub API Response Body: %s", string(body))

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch repos: status code %d, body: %s", resp.StatusCode, string(body))
	}

	var result struct {
		Data struct {
			Viewer struct {
				RepositoriesContributedTo struct {
					Nodes []Repo `json:"nodes"`
				} `json:"repositoriesContributedTo"`
			} `json:"viewer"`
		} `json:"data"`
		Errors []struct {
			Message string `json:"message"`
		} `json:"errors,omitempty"`
	}

	if err := json.NewDecoder(bytes.NewReader(body)).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	// Log any GraphQL errors
	if len(result.Errors) > 0 {
		for _, err := range result.Errors {
			log.Printf("GraphQL Error: %s", err.Message)
		}
		return nil, fmt.Errorf("graphql errors: %v", result.Errors)
	}

	// Log successful response
	log.Printf("Successfully fetched %d repositories", len(result.Data.Viewer.RepositoriesContributedTo.Nodes))

	return result.Data.Viewer.RepositoriesContributedTo.Nodes, nil
}

// Repo represents a GitHub repository
type Repo struct {
	NameWithOwner string    `json:"nameWithOwner"`
	URL           string    `json:"url"`
	PushedAt      time.Time `json:"pushedAt"`
	DefaultBranch string    `json:"defaultBranch"`
}
