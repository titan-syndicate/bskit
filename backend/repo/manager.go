package repo

import (
	"fmt"
	"os"
	"path/filepath"
	"sync"

	"github.com/go-git/go-git/v5"
)

type RepoManager struct {
	baseDir  string
	reposDir string
	mu       sync.RWMutex
}

type RepoStatus struct {
	IsCloned bool   `json:"isCloned"`
	Path     string `json:"path"`
}

func NewRepoManager() (*RepoManager, error) {
	execPath, err := os.Executable()
	if err != nil {
		return nil, fmt.Errorf("failed to get executable path: %w", err)
	}

	baseDir := filepath.Dir(execPath)
	reposDir := filepath.Join(baseDir, "repos")

	if err := os.MkdirAll(reposDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create repos directory: %w", err)
	}

	return &RepoManager{
		baseDir:  baseDir,
		reposDir: reposDir,
	}, nil
}

// CloneRepo clones a repository and returns its local path
func (m *RepoManager) CloneRepo(url string) (string, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	// Extract repo name from URL
	repoName := filepath.Base(url)
	if repoName == "" {
		return "", fmt.Errorf("invalid repository URL")
	}

	// Create repo directory
	repoPath := filepath.Join(m.reposDir, repoName)
	if err := os.MkdirAll(repoPath, 0755); err != nil {
		return "", fmt.Errorf("failed to create repo directory: %w", err)
	}

	// Clone the repository
	_, err := git.PlainClone(repoPath, false, &git.CloneOptions{
		URL:      url,
		Progress: os.Stdout,
	})
	if err != nil {
		// Clean up the directory if clone fails
		os.RemoveAll(repoPath)
		return "", fmt.Errorf("failed to clone repository: %w", err)
	}

	return repoPath, nil
}

// GetRepoStatus checks if a repository is already cloned
func (m *RepoManager) GetRepoStatus(url string) (*RepoStatus, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	repoName := filepath.Base(url)
	if repoName == "" {
		return nil, fmt.Errorf("invalid repository URL")
	}

	repoPath := filepath.Join(m.reposDir, repoName)

	// Check if directory exists and is a git repository
	_, err := git.PlainOpen(repoPath)
	if err != nil {
		if err == git.ErrRepositoryNotExists {
			return &RepoStatus{
				IsCloned: false,
				Path:     repoPath,
			}, nil
		}
		return nil, fmt.Errorf("failed to check repository status: %w", err)
	}

	return &RepoStatus{
		IsCloned: true,
		Path:     repoPath,
	}, nil
}

// ListClonedRepos returns a list of all cloned repositories
func (m *RepoManager) ListClonedRepos() ([]string, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	entries, err := os.ReadDir(m.reposDir)
	if err != nil {
		return nil, fmt.Errorf("failed to read repos directory: %w", err)
	}

	var repos []string
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		repoPath := filepath.Join(m.reposDir, entry.Name())
		_, err := git.PlainOpen(repoPath)
		if err == nil {
			repos = append(repos, repoPath)
		}
	}

	return repos, nil
}

// Add detailed logging around the os.RemoveAll call to debug deletion issues
func DeleteRepo(repoPath string) error {
	fmt.Printf("DeleteRepo called with path: %s\n", repoPath) // Log the input path

	// Check if the path exists before attempting to delete
	if _, err := os.Stat(repoPath); os.IsNotExist(err) {
		fmt.Printf("Error: Repository path does not exist: %s\n", repoPath)
		return fmt.Errorf("repository path does not exist: %s", repoPath)
	}

	// Attempt to delete the repository
	fmt.Printf("Attempting to delete repository at path: %s\n", repoPath)
	err := os.RemoveAll(repoPath)
	if err != nil {
		fmt.Printf("Error deleting repository at path: %s, error: %v\n", repoPath, err) // Log the error
		return fmt.Errorf("failed to delete repository at %s: %w", repoPath, err)
	}

	// Confirm deletion
	if _, err := os.Stat(repoPath); os.IsNotExist(err) {
		fmt.Printf("Successfully deleted repository at path: %s\n", repoPath) // Log successful deletion
	} else {
		fmt.Printf("Failed to delete repository at path: %s, it still exists\n", repoPath)
	}

	return nil
}
