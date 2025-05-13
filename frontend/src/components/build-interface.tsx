import { Button } from './button'
import { Heading } from './heading'
import { useEffect, useRef, useState } from 'react'
import { StartBuild } from '../../wailsjs/go/backend/App'
import { EventsOn, EventsEmit } from '../../wailsjs/runtime'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { Dropdown, DropdownButton, DropdownMenu, DropdownItem } from './dropdown'
import { CheckCircleIcon, PlayIcon } from '@heroicons/react/24/solid'
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
    if (!buildComplete) return

    setIsRunning(true)
    terminalInstance.current?.writeln('\r\nStarting container...\r\n')

    try {
      await EventsEmit('run:start', { imageName: repoName })
    } catch (error) {
      console.error('Run failed:', error)
      terminalInstance.current?.writeln(`Run failed: ${error}\r\n`)
    } finally {
      setIsRunning(false)
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
            disabled={isRunning}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlayIcon className="h-5 w-5 mr-2" />
            {isRunning ? 'Running...' : 'Run'}
          </button>
        </div>
      )}
    </div>
  )
}