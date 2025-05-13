import { useEffect, useRef, useState } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { Heading } from '../components/heading'
import { Divider } from '../components/divider'
import { EventsOn, EventsEmit } from '../../wailsjs/runtime/runtime' // Corrected import
import { Button } from '../components/button'
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

export default function BuildPage() {
  const terminalRef = useRef<HTMLDivElement>(null)
  const terminalInstance = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const [isBuilding, setIsBuilding] = useState(false)
  const [selectedDirectory, setSelectedDirectory] = useState<string | null>(null)
  const [platform, setPlatform] = useState<'arm64' | 'amd64'>('arm64');

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
        // Add more colors for syntax highlighting
        black: '#000000',
        red: '#ef4444',    // red-500
        green: '#22c55e',  // green-500
        yellow: '#eab308', // yellow-500
        blue: '#3b82f6',   // blue-500
        magenta: '#d946ef', // fuchsia-500
        cyan: '#06b6d4',   // cyan-500
        white: '#f8fafc',  // slate-50
        brightBlack: '#475569',   // slate-600
        brightRed: '#f87171',     // red-400
        brightGreen: '#4ade80',   // green-400
        brightYellow: '#facc15',  // yellow-400
        brightBlue: '#60a5fa',    // blue-400
        brightMagenta: '#e879f9', // fuchsia-400
        brightCyan: '#22d3ee',    // cyan-400
        brightWhite: '#f1f5f9',   // slate-100
      },
      // Terminal configuration
      scrollback: 10000,
      convertEol: true,
      disableStdin: true,
      allowProposedApi: true,
      cols: 200, // Increased width to prevent wrapping
      // Enable proper handling of control characters
      allowTransparency: true,
      cursorStyle: 'block',
      drawBoldTextInBrightColors: true,
      // Enable proper handling of ANSI escape sequences
      windowsMode: false,
      // Disable line wrapping to prevent formatting issues
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

    // Set up event listener for logs
    const unsubscribe = EventsOn("build:log", (log: string) => {
      term.writeln(log)
    })

    // Notify backend that we're ready
    EventsEmit("build:ready")

    // Handle window resize
    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit()
      }
    }

    // Add resize observer to handle container size changes
    const resizeObserver = new ResizeObserver(handleResize)
    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current)
    }

    // Cleanup
    return () => {
      unsubscribe()
      term.dispose()
      document.head.removeChild(styleSheet)
      resizeObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    const unsubscribe = EventsOn('directory:selected', (selectedDirectory: string) => {
      if (selectedDirectory) {
        setSelectedDirectory(selectedDirectory);
        terminalInstance.current?.writeln(`\r\n\x1b[1;34mSelected directory: ${selectedDirectory}\x1b[0m\r\n`);
      } else {
        terminalInstance.current?.writeln('\r\n\x1b[1;31mNo directory selected.\x1b[0m\r\n');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleTogglePlatform = () => {
    setPlatform((prevPlatform) => (prevPlatform === 'arm64' ? 'amd64' : 'arm64'));
  };

  const handleBuild = async () => {
    if (isBuilding) return;

    setIsBuilding(true);
    const term = terminalInstance.current;
    if (term) {
      term.writeln(`\r\n\x1b[1;34mStarting build process for platform: ${platform}...\x1b[0m\r\n`);
    }

    try {
      if (selectedDirectory) {
        await EventsEmit('build:start', { selectedDirectory, platform });
      } else {
        term?.writeln('\r\n\x1b[1;31mError: No directory selected.\x1b[0m\r\n');
      }
    } catch (error) {
      if (term) {
        term.writeln(`\r\n\x1b[1;31mBuild failed: ${error}\x1b[0m\r\n`);
      }
    } finally {
      setIsBuilding(false);
    }
  };

  const handleSelectDirectory = async () => {
    EventsEmit('directory:select');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-sm:w-full sm:flex-1">
          <Heading>Build</Heading>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSelectDirectory}
            className="mr-2"
          >
            Select Directory
          </Button>
          <div className="inline-flex items-center gap-2">
            <label
              htmlFor="platformToggle"
              className="text-slate-600 text-sm cursor-pointer"
            >
              arm64
            </label>
            <div className="relative inline-block w-11 h-5">
              <input
                id="platformToggle"
                type="checkbox"
                className="peer appearance-none w-11 h-5 bg-slate-100 rounded-full checked:bg-slate-800 cursor-pointer transition-colors duration-300"
                checked={platform === 'amd64'}
                onChange={handleTogglePlatform}
              />
              <label
                htmlFor="platformToggle"
                className="absolute top-0 left-0 w-5 h-5 bg-white rounded-full border border-slate-300 shadow-sm transition-transform duration-300 peer-checked:translate-x-6 peer-checked:border-slate-800 cursor-pointer"
              ></label>
            </div>
            <label
              htmlFor="platformToggle"
              className="text-slate-600 text-sm cursor-pointer"
            >
              amd64
            </label>
          </div>
          <Button
            onClick={handleBuild}
            disabled={isBuilding}
            className={isBuilding ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {isBuilding ? 'Building...' : 'Start Build'}
          </Button>
        </div>
      </div>
      <div className="mt-4">
        <Divider />
      </div>
      <div className="mt-6 flex-1 w-full rounded-lg bg-zinc-950 p-4 min-h-0 h-full">
        <div ref={terminalRef} className="h-full w-full" />
      </div>
    </div>
  )
}