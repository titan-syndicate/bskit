import { Button } from './button'
import { Heading } from './heading'
import { useEffect, useRef, useState } from 'react'
import { StartBuild } from '../../wailsjs/go/backend/App'
import { EventsOn, EventsEmit, BrowserOpenURL } from '../../wailsjs/runtime'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { Dropdown, DropdownButton, DropdownMenu, DropdownItem } from './dropdown'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import 'xterm/css/xterm.css'

interface BuildInterfaceProps {
  repoPath: string
  repoName: string
}

export function BuildInterface({ repoPath, repoName }: BuildInterfaceProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<'arm64' | 'amd64'>('arm64')
  const [isBuilding, setIsBuilding] = useState(false)
  const [buildComplete, setBuildComplete] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [appUrl, setAppUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)
  const terminalInstance = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)

  useEffect(() => {
    if (!terminalRef.current) return

    // Initialize terminal
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#09090b',
        foreground: '#ffffff',
        black: '#000000',
        red: '#ef4444',
        green: '#22c55e',
        yellow: '#eab308',
        blue: '#3b82f6',
        magenta: '#d946ef',
        cyan: '#06b6d4',
        white: '#f8fafc',
        brightBlack: '#475569',
        brightRed: '#f87171',
        brightGreen: '#4ade80',
        brightYellow: '#facc15',
        brightBlue: '#60a5fa',
        brightMagenta: '#e879f9',
        brightCyan: '#22d3ee',
        brightWhite: '#f1f5f9',
      },
      scrollback: 10000,
      convertEol: true,
      disableStdin: true,
      allowProposedApi: true,
      cols: 200,
      allowTransparency: true,
      cursorStyle: 'block',
      drawBoldTextInBrightColors: true,
      windowsMode: false,
      scrollOnUserInput: false,
    })

    // Add addons
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.loadAddon(new WebLinksAddon())

    // Store references
    terminalInstance.current = term
    fitAddonRef.current = fitAddon

    // Open terminal
    term.open(terminalRef.current)
    fitAddon.fit()

    // Handle window resize
    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit()
      }
    }

    // Add resize observer
    const resizeObserver = new ResizeObserver(handleResize)
    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current)
    }

    // Cleanup
    return () => {
      term.dispose()
      resizeObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    const unsubscribe = EventsOn('build:log', (message: string) => {
      terminalInstance.current?.writeln(message)
      // Check for build completion message
      if (message.includes('✓ Build completed successfully!')) {
        setBuildComplete(true)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const handleBuild = async () => {
    setIsBuilding(true)
    setBuildComplete(false)
    const term = terminalInstance.current
    if (term) {
      term.writeln(`\r\n\x1b[1;34mStarting build process for platform: ${selectedPlatform}...\x1b[0m\r\n`)
    }

    try {
      await StartBuild({
        selectedDirectory: repoPath,
        platform: selectedPlatform,
      })
    } catch (error) {
      if (term) {
        term.writeln(`\r\n\x1b[1;31mBuild failed: ${error}\x1b[0m\r\n`)
      }
    } finally {
      setIsBuilding(false)
    }
  }

  const handleRun = async () => {
    if (isRunning) {
      BrowserOpenURL(appUrl || 'http://localhost:3000')
      return
    }
    setIsLoading(true)
    try {
      await EventsEmit('run:start', { imageName: repoName })
      setIsRunning(true)
      setAppUrl('http://localhost:3000')
    } catch (error) {
      console.error('Run failed:', error)
      terminalInstance.current?.writeln(`Run failed: ${error}\r\n`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <Heading>Build {repoName}</Heading>
          {buildComplete && (
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircleIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Build Complete</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Dropdown>
            <DropdownButton>
              {selectedPlatform === 'arm64' ? 'ARM64' : 'AMD64'}
            </DropdownButton>
            <DropdownMenu>
              <DropdownItem onClick={() => setSelectedPlatform('arm64')}>
                ARM64
              </DropdownItem>
              <DropdownItem onClick={() => setSelectedPlatform('amd64')}>
                AMD64
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Button onClick={handleBuild} disabled={isBuilding}>
            {isBuilding ? 'Building...' : 'Build'}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div ref={terminalRef} className="h-[400px] w-full" />
      </div>

      {buildComplete && (
        <div className="flex items-center justify-end gap-4">
          <button
            onClick={handleRun}
            disabled={isLoading}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${isRunning
              ? 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Running...
              </>
            ) : isRunning ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                Open App
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                Run
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}