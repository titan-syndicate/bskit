import { Button } from '../components/button'
import { Heading } from '../components/heading'
import { Text } from '../components/text'
import { useState, useEffect } from 'react'
import { StartGitHubLogin } from '../../wailsjs/go/backend/App'
import { EventsOn, BrowserOpenURL } from '../../wailsjs/runtime/runtime'
import { ClipboardIcon, CheckIcon } from '@heroicons/react/16/solid'
import LoginConfirmation from './LoginConfirmation'

interface UserCodeInfo {
  userCode: string
  verificationUri: string
  expiresIn: number
  interval: number
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
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    EventsOn('github:auth:started', () => {
      console.log('GitHub auth started')
      setIsLoading(true)
    })

    EventsOn('github:auth:success', () => {
      console.log('GitHub auth success')
      setIsLoading(false)
      setIsLoggedIn(true)
    })

    EventsOn('github:auth:error', (error) => {
      console.log('GitHub auth error:', error)
      setIsLoading(false)
      setError(error)
    })
    console.log('Subscribed to events')
  }, [])

  const handleGitHubLogin = async () => {
    try {
      setIsLoading(true)
      setIsLoading(true)
      const userCodeInfo = await StartGitHubLogin()
      setUserCode(userCodeInfo.userCode)
      setVerificationUri(userCodeInfo.verificationUri)
      setError(null)
    } catch (err) {
      console.error('Failed to start GitHub login:', err)
      setError('Failed to start GitHub login. Please try again.')
      setIsLoading(false)
    }
  }

  const handleOpenGitHub = () => {
    if (verificationUri) {
      BrowserOpenURL(verificationUri)
    }
  }

  const handleCopyCode = () => {
    if (userCode) {
      navigator.clipboard.writeText(userCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoggedIn) {
    return <LoginConfirmation />
  }

  return (
    <div className="flex min-h-screen items-start justify-center pt-32">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Heading className="text-3xl/8 font-semibold text-zinc-950 dark:text-white">Welcome to Build System Kit</Heading>
          <Text className="mt-2 text-lg/6 text-zinc-600 dark:text-zinc-400">
            Sign in with your GitHub account to get started
          </Text>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-50/50 dark:bg-red-500/5 p-4">
            <Text className="text-sm text-red-700 dark:text-red-400">{error}</Text>
          </div>
        )}

        <div className="space-y-4">
          {userCode && verificationUri && (
            <div className="space-y-4">
              <div className="relative block w-full appearance-none rounded-lg border border-zinc-950/10 bg-white px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] dark:border-white/10 dark:bg-white/5">
                <Text className="text-sm text-zinc-700 dark:text-zinc-300">
                  1. <button
                    onClick={handleCopyCode}
                    className="ml-2 text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    {copied ? (
                      <>
                        <CheckIcon className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <ClipboardIcon className="w-4 h-4" />
                        Copy this code: <span className="font-mono font-bold">{userCode}</span>
                      </>
                    )}
                  </button>
                </Text>
              </div>
              <div className="relative block w-full appearance-none rounded-lg border border-zinc-950/10 bg-white px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] dark:border-white/10 dark:bg-white/5">
                <Text className="text-sm text-zinc-700 dark:text-zinc-300">
                  2. Go to{' '}
                  <button
                    onClick={handleOpenGitHub}
                    className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {verificationUri}
                  </button>
                </Text>
              </div>
              {isLoading && (
                <div className="rounded-lg border border-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-500/5 p-4">
                  <Text className="text-sm text-yellow-700 dark:text-yellow-400">
                    Waiting for authorization... {isLoading ? '⏳' : ''}
                  </Text>
                </div>
              )}
            </div>
          )}

          <Button
            onClick={handleGitHubLogin}
            className="w-full bg-[#24292F] hover:bg-[#24292F]/90 text-white flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            {isLoading ? 'Signing in...' : 'Sign in with GitHub'}
          </Button>
        </div>
      </div>
    </div>
  )
}