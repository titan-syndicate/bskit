import { Button } from '../components/button'
import { Heading } from '../components/heading'
import { Text } from '../components/text'
import { useState } from 'react'
import { StartGitHubLogin, CompleteGitHubLogin } from '../../wailsjs/go/backend/App'

interface UserCodeInfo {
  userCode: string
  verificationUri: string
  expiresIn: number
  interval: number
}

interface AccessToken {
  token: string
  type: string
  scope: string
}

declare global {
  interface Window {
    go: {
      main: {
        App: {
          StartGitHubLogin: () => Promise<UserCodeInfo>
          CompleteGitHubLogin: () => Promise<AccessToken>
        }
      }
    }
  }
}

export default function Login() {
  const [userCode, setUserCode] = useState<string | null>(null)
  const [verificationUri, setVerificationUri] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGitHubLogin = async () => {
    try {
      const userCodeInfo = await StartGitHubLogin()
      setUserCode(userCodeInfo.userCode)
      setVerificationUri(userCodeInfo.verificationUri)
      setError(null)

      // Poll for the token
      const token = await CompleteGitHubLogin()
      console.log('Got token:', token)
      // Handle successful login
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
          >
            Sign in with GitHub
          </Button>
        )}
      </div>
    </div>
  )
}