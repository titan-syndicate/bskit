import { Button } from '../components/button'
import { Heading } from '../components/heading'
import { Text } from '../components/text'
import { useState, useEffect } from 'react'
import { StartGitHubLogin } from '../../wailsjs/go/backend/App'
import { EventsOn } from '../../wailsjs/runtime/runtime'

interface UserCodeInfo {
  userCode: string
  verificationUri: string
  expiresIn: number
  interval: number
}

interface Repo {
  name: string
  description: string
  url: string
}

declare global {
  interface Window {
    go: {
      main: {
        App: {
          StartGitHubLogin: () => Promise<UserCodeInfo>
        }
      }
    }
  }
}

export default function Login() {
  const [userCode, setUserCode] = useState<string | null>(null)
  const [verificationUri, setVerificationUri] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [repos, setRepos] = useState<Repo[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    EventsOn('github:auth:started', () => {
      setIsLoading(true)
    })

    EventsOn('github:auth:success', (token) => {
      setIsLoading(false)
      fetchRepos(token.token)
    })

    EventsOn('github:auth:error', (error) => {
      setIsLoading(false)
      setError(error)
    })
  }, [])

  const fetchRepos = async (token: string) => {
    try {
      const response = await fetch('https://api.github.com/user/repos', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch repositories')
      }
      const data = await response.json()
      setRepos(data.map((repo: any) => ({
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
      })))
    } catch (err) {
      console.error('Error fetching repositories:', err)
      setError('Failed to fetch repositories. Please try again.')
    }
  }

  const handleGitHubLogin = async () => {
    try {
      const userCodeInfo = await StartGitHubLogin()
      setUserCode(userCodeInfo.userCode)
      setVerificationUri(userCodeInfo.verificationUri)
      setError(null)
    } catch (err) {
      console.error('Failed to start GitHub login:', err)
      setError('Failed to start GitHub login. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-8 p-8">
        <div className="text-center">
          <Heading>Welcome to BSKit</Heading>
          <Text className="mt-2 text-gray-600">
            Sign in with your GitHub account to get started
          </Text>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <Text className="text-sm text-red-700">{error}</Text>
          </div>
        )}

        {userCode && verificationUri ? (
          <div className="space-y-4">
            <div className="rounded-md bg-blue-50 p-4">
              <Text className="text-sm text-blue-700">
                1. Go to{' '}
                <a
                  href={verificationUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline"
                >
                  {verificationUri}
                </a>
              </Text>
            </div>
            <div className="rounded-md bg-blue-50 p-4">
              <Text className="text-sm text-blue-700">
                2. Enter code: <span className="font-mono font-bold">{userCode}</span>
              </Text>
            </div>
          </div>
        ) : (
          <Button
            onClick={handleGitHubLogin}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in with GitHub'}
          </Button>
        )}

        {repos.length > 0 && (
          <div className="mt-8">
            <Heading>Your Repositories</Heading>
            <ul className="mt-4 space-y-4">
              {repos.map((repo) => (
                <li key={repo.name} className="rounded-md bg-gray-50 p-4">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {repo.name}
                  </a>
                  <Text className="mt-1 text-sm text-gray-600">{repo.description}</Text>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}