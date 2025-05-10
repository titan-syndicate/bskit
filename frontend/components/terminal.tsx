'use client'

import { useEffect, useRef, useState } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import 'xterm/css/xterm.css'
// import { RunDaggerCommand } from '../../wailsjs/go/main/App'

declare global {
  interface Window {
    runtime: {
      EventsOn: (eventName: string, callback: (data: any) => void) => void
      EventsOff: (eventName: string) => void
    }
  }
}

export function TerminalComponent() {
  const terminalRef = useRef<HTMLDivElement>(null)
  const terminal = useRef<Terminal>()
  const fitAddon = useRef<FitAddon>()
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

  // Handle window resize
  useEffect(() => {
    if (!terminal.current || !fitAddon.current) return

    const handleResize = () => {
      fitAddon.current?.fit()
    }

    // Create a ResizeObserver to watch the terminal container
    const resizeObserver = new ResizeObserver(() => {
      handleResize()
    })

    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current)
    }

    // Also listen for window resize events
    window.addEventListener('resize', handleResize)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [isMounted, isRuntimeReady])

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
        convertEol: true,
      })

      // Add addons
      const fit = new FitAddon()
      term.loadAddon(fit)
      term.loadAddon(new WebLinksAddon())

      // Store addon reference
      fitAddon.current = fit

      // Open terminal
      term.open(terminalRef.current!)

      // Fit the terminal to its container
      fit.fit()

      // Store terminal instance
      terminal.current = term

      // Write welcome message
      term.writeln('\x1b[32mWelcome to the Dagger Terminal!\x1b[0m')

      // Listen for Dagger output
      window.runtime.EventsOn('dagger:output', (data: string) => {
        console.log('Received dagger:output event:', data)
        const term = terminal.current
        if (term) {
          term.writeln(data)
        }
      })

      window.runtime.EventsOn('dagger:error', (data: string) => {
        console.log('Received dagger:error event:', data)
        const term = terminal.current
        if (term) {
          term.writeln(`\x1b[31m${data}\x1b[0m`)
        }
      })

      window.runtime.EventsOn('dagger:done', (data: string) => {
        console.log('Received dagger:done event:', data)
        const term = terminal.current
        if (term) {
          term.writeln(`\x1b[32m${data}\x1b[0m`)
        }
      })

      // Start the test command
      // RunDaggerCommand("test").catch(error => {
      //   console.error('Error running command:', error)
      //   if (terminal.current) {
      //     terminal.current.writeln(`\x1b[31mError: ${error}\x1b[0m`)
      //   }
      // })

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

  if (!isMounted || !isRuntimeReady) {
    return <div className="h-full w-full px-[50px] bg-[#1a1a1a]" />
  }

  return (
    <div className="h-full w-full px-[50px] bg-[#1a1a1a]">
      <div ref={terminalRef} className="h-full w-full" />
    </div>
  )
}