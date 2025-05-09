'use client'

import { useEffect, useRef, useState } from 'react'
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
  const terminal = useRef<any>()
  const [command, setCommand] = useState('')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!terminalRef.current || !isClient) return

    // Dynamically import xterm and its addons
    Promise.all([
      import('xterm'),
      import('xterm-addon-fit'),
      import('xterm-addon-web-links')
    ]).then(([xterm, { FitAddon }, { WebLinksAddon }]) => {
      // Initialize terminal
      const term = new xterm.Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        theme: {
          background: '#1a1a1a',
          foreground: '#f0f0f0',
        },
      })

      // Add addons
      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)
      term.loadAddon(new WebLinksAddon())

      // Open terminal
      term.open(terminalRef.current!)
      fitAddon.fit()

      // Store terminal instance
      terminal.current = term

      // Listen for Dagger output
      window.runtime.EventsOn('dagger:output', (data: string) => {
        if (terminal.current) {
          terminal.current.write(data)
        }
      })

      window.runtime.EventsOn('dagger:error', (data: string) => {
        if (terminal.current) {
          terminal.current.writeln(`\x1b[31mError: ${data}\x1b[0m`)
        }
      })

      window.runtime.EventsOn('dagger:done', (data: string) => {
        if (terminal.current) {
          terminal.current.writeln(`\x1b[32m${data}\x1b[0m`)
        }
      })
    })

    // Cleanup
    return () => {
      window.runtime.EventsOff('dagger:output')
      window.runtime.EventsOff('dagger:error')
      window.runtime.EventsOff('dagger:done')
      if (terminal.current) {
        terminal.current.dispose()
      }
    }
  }, [isClient])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (command.trim()) {
      try {
        await window.runtime.RunDaggerCommand(command)
        setCommand('')
      } catch (error) {
        if (terminal.current) {
          terminal.current.writeln(`\x1b[31mError: ${error}\x1b[0m`)
        }
      }
    }
  }

  if (!isClient) {
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