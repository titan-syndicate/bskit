'use client'

import { useEffect, useRef, useState } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import 'xterm/css/xterm.css'

declare global {
  interface Window {
    runtime: {
      EventsOn: (eventName: string, callback: (data: any) => void) => void
      EventsOff: (eventName: string) => void
      RunDaggerCommand: (command: string) => Promise<void>
    }
  }
}

export function TerminalComponent() {
  const terminalRef = useRef<HTMLDivElement>(null)
  const terminal = useRef<Terminal>()
  const [command, setCommand] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const [isRuntimeReady, setIsRuntimeReady] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Wait for runtime to be available
  useEffect(() => {
    if (!isMounted) return

    const checkRuntime = () => {
      if (window.runtime) {
        console.log('Runtime is ready')
        setIsRuntimeReady(true)
      } else {
        console.log('Waiting for runtime...')
        setTimeout(checkRuntime, 100)
      }
    }

    checkRuntime()
  }, [isMounted])

  useEffect(() => {
    if (!terminalRef.current || !isMounted || !isRuntimeReady) return

    console.log('Initializing terminal...')

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      // Initialize terminal
      const term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        theme: {
          background: '#1a1a1a',
          foreground: '#f0f0f0',
        },
        rows: 24,
        cols: 80,
      })

      // Add addons
      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)
      term.loadAddon(new WebLinksAddon())

      // Open terminal
      term.open(terminalRef.current!)

      // Small delay before fitting
      setTimeout(() => {
        fitAddon.fit()
      }, 0)

      // Store terminal instance
      terminal.current = term

      // Write welcome message
      term.writeln('\x1b[32mWelcome to the Dagger Terminal!\x1b[0m')
      term.writeln('Type a command below and press Enter to execute it.')
      term.writeln('')

      // Test write
      term.writeln('\x1b[33mTesting terminal output...\x1b[0m')

      // Listen for Dagger output
      window.runtime.EventsOn('dagger:output', (data: string) => {
        console.log('Received dagger:output event:', data)
        if (terminal.current) {
          terminal.current.write(data)
        }
      })

      window.runtime.EventsOn('dagger:error', (data: string) => {
        console.log('Received dagger:error event:', data)
        if (terminal.current) {
          terminal.current.writeln(`\x1b[31mError: ${data}\x1b[0m`)
        }
      })

      window.runtime.EventsOn('dagger:done', (data: string) => {
        console.log('Received dagger:done event:', data)
        if (terminal.current) {
          terminal.current.writeln(`\x1b[32m${data}\x1b[0m`)
        }
      })

      console.log('Terminal initialized and event listeners set up')
    }, 100)

    // Cleanup
    return () => {
      console.log('Cleaning up terminal...')
      if (window.runtime) {
        window.runtime.EventsOff('dagger:output')
        window.runtime.EventsOff('dagger:error')
        window.runtime.EventsOff('dagger:done')
      }
      if (terminal.current) {
        terminal.current.dispose()
      }
      clearTimeout(timer)
    }
  }, [isMounted, isRuntimeReady])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (command.trim() && window.runtime) {
      try {
        console.log('Submitting command:', command)
        if (terminal.current) {
          terminal.current.writeln(`\x1b[33m$ ${command}\x1b[0m`)
        }
        await window.runtime.RunDaggerCommand(command)
        setCommand('')
      } catch (error) {
        console.error('Error running command:', error)
        if (terminal.current) {
          terminal.current.writeln(`\x1b[31mError: ${error}\x1b[0m`)
        }
      }
    }
  }

  if (!isMounted || !isRuntimeReady) {
    return <div className="h-[500px] w-full rounded-lg bg-[#1a1a1a] p-4" />
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="h-[500px] w-full rounded-lg bg-[#1a1a1a] p-4">
        <div ref={terminalRef} className="h-full w-full" />
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Enter Dagger command..."
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-400"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Run
        </button>
      </form>
    </div>
  )
}