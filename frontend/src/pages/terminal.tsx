import { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { Heading } from '../components/heading'
import { Divider } from '../components/divider'
import { EventsOn } from 'wailsjs/runtime/runtime'
import { StartTerminalLogs } from 'wailsjs/go/main/App'
import 'xterm/css/xterm.css'

// Custom scrollbar styles
const scrollbarStyles = `
  .xterm-viewport::-webkit-scrollbar {
    width: 8px;
  }

  .xterm-viewport::-webkit-scrollbar-track {
    background: transparent;
  }

  .xterm-viewport::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }

  .xterm-viewport::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  /* Add styles for Firefox */
  .xterm-viewport {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  }
`

interface TerminalLog {
  content: string
  timestamp: string
}

export default function TerminalPage() {
  const terminalRef = useRef<HTMLDivElement>(null)
  const terminalInstance = useRef<Terminal | null>(null)

  useEffect(() => {
    // Add scrollbar styles
    const styleSheet = document.createElement('style')
    styleSheet.textContent = scrollbarStyles
    document.head.appendChild(styleSheet)

    if (!terminalRef.current) return

    // Initialize terminal
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#09090b', // zinc-950
        foreground: '#ffffff',
      },
    })

    // Add addons
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.loadAddon(new WebLinksAddon())

    // Open terminal
    term.open(terminalRef.current)
    fitAddon.fit()

    // Store terminal instance
    terminalInstance.current = term

    // Start receiving logs from backend
    StartTerminalLogs()

    // Set up event listener for logs
    const unsubscribe = EventsOn("terminal:log", (log: TerminalLog) => {
      term.writeln(log.content)
    })

    // Cleanup
    return () => {
      unsubscribe()
      term.dispose()
      document.head.removeChild(styleSheet)
    }
  }, [])

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-sm:w-full sm:flex-1">
          <Heading>Terminal</Heading>
        </div>
      </div>
      <div className="mt-4">
        <Divider />
      </div>
      <div className="mt-6 h-[calc(100vh-12rem)] w-full rounded-lg bg-zinc-950 p-4">
        <div ref={terminalRef} className="h-full w-full" />
      </div>
    </>
  )
}