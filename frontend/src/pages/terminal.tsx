import { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { Heading } from '../components/heading'
import { Divider } from '../components/divider'
import 'xterm/css/xterm.css'

const mockLogs = [
  'kubectl get pods -n default',
  'NAME                     READY   STATUS    RESTARTS   AGE',
  'nginx-7b8748574d-2k4m9   1/1     Running   0          2d',
  'redis-5f4b8d6c7-9x2p3   1/1     Running   1          3d',
  'postgres-8c9d7e6f-5r4t3  1/1     Running   0          4d',
  '',
  'kubectl describe pod nginx-7b8748574d-2k4m9',
  'Name:         nginx-7b8748574d-2k4m9',
  'Namespace:    default',
  'Priority:     0',
  'Node:         worker-1/10.0.0.1',
  'Start Time:   Mon, 10 May 2024 10:00:00 +0000',
  'Labels:       app=nginx',
  'Status:       Running',
  'IP:           10.244.0.5',
  'Containers:',
  '  nginx:',
  '    Container ID:   docker://abc123...',
  '    Image:          nginx:1.21',
  '    State:          Running',
  '      Started:      Mon, 10 May 2024 10:00:05 +0000',
  '    Ready:          True',
  '    Restart Count:  0',
  '    Limits:',
  '      cpu:     500m',
  '      memory:  512Mi',
  '    Requests:',
  '      cpu:     200m',
  '      memory:  256Mi',
  '',
  'Events:',
  '  Type    Reason     Age   From               Message',
  '  ----    ------     ----  ----               -------',
  '  Normal  Scheduled  2d    default-scheduler  Successfully assigned default/nginx-7b8748574d-2k4m9 to worker-1',
  '  Normal  Pulled     2d    kubelet           Container image "nginx:1.21" already present on machine',
  '  Normal  Created    2d    kubelet           Created container nginx',
  '  Normal  Started    2d    kubelet           Started container nginx',
]

export default function TerminalPage() {
  const terminalRef = useRef<HTMLDivElement>(null)
  const terminalInstance = useRef<Terminal | null>(null)

  useEffect(() => {
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

    // Write initial content
    let currentIndex = 0
    const writeNextLine = () => {
      if (currentIndex < mockLogs.length) {
        term.writeln(mockLogs[currentIndex])
        currentIndex++
      }
    }

    // Write initial lines
    writeNextLine()
    writeNextLine()

    // Set up interval for writing more lines
    const interval = setInterval(() => {
      if (currentIndex < mockLogs.length) {
        writeNextLine()
      } else {
        clearInterval(interval)
      }
    }, 1000)

    // Cleanup
    return () => {
      clearInterval(interval)
      term.dispose()
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
      <div className="mt-6 h-[calc(100vh-12rem)] w-full overflow-hidden rounded-lg bg-zinc-950 p-4">
        <div ref={terminalRef} className="h-full w-full" />
      </div>
    </>
  )
}