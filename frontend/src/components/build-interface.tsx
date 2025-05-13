import { Button } from './button'
import { Heading } from './heading'
import { useEffect, useState } from 'react'
import { StartBuild } from '../../wailsjs/go/backend/App'
import { EventsOn } from '../../wailsjs/runtime'

interface BuildInterfaceProps {
  repoPath: string
  repoName: string
}

export function BuildInterface({ repoPath, repoName }: BuildInterfaceProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<'arm64' | 'amd64'>('arm64')
  const [buildLog, setBuildLog] = useState<string[]>([])
  const [isBuilding, setIsBuilding] = useState(false)

  useEffect(() => {
    // Subscribe to build log events
    const unsubscribe = EventsOn('build:log', (message: string) => {
      setBuildLog(prev => [...prev, message])
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const handleBuild = async () => {
    setIsBuilding(true)
    setBuildLog([])

    try {
      await StartBuild({
        selectedDirectory: repoPath,
        platform: selectedPlatform,
      })
    } catch (error) {
      console.error('Build failed:', error)
      setBuildLog(prev => [...prev, `Error: ${error instanceof Error ? error.message : 'Build failed'}`])
    } finally {
      setIsBuilding(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <Heading>Build {repoName}</Heading>
        <div className="flex items-center gap-4">
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value as 'arm64' | 'amd64')}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm/6 font-medium text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          >
            <option value="arm64">ARM64</option>
            <option value="amd64">AMD64</option>
          </select>
          <Button onClick={handleBuild} disabled={isBuilding}>
            {isBuilding ? 'Building...' : 'Build'}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="font-mono text-sm">
          {buildLog.length === 0 ? (
            <div className="text-zinc-500">Build output will appear here...</div>
          ) : (
            buildLog.map((line, index) => (
              <div key={index} className="whitespace-pre-wrap">
                {line}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}