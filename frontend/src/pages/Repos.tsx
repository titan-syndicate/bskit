import { Button } from '../components/button'
import { Heading } from '../components/heading'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/table'
import { useAuth } from '../contexts/auth-context'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { GetRecentRepos } from '../../wailsjs/go/backend/App'

interface Repo {
  nameWithOwner: string
  url: string
  pushedAt: string
  defaultBranch: string
}

export default function Repos() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [repos, setRepos] = useState<Repo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    async function fetchRepos() {
      try {
        const repos = await GetRecentRepos()
        setRepos(repos)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch repositories')
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchRepos()
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <Heading>Repositories</Heading>
        <Button className="-my-0.5">Add Repository</Button>
      </div>
      <Table className="mt-8 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Repository</TableHeader>
            <TableHeader>Path</TableHeader>
            <TableHeader className="text-right">Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-zinc-500">
                Loading repositories...
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-red-500">
                {error}
              </TableCell>
            </TableRow>
          ) : repos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-zinc-500">
                No repositories found
              </TableCell>
            </TableRow>
          ) : (
            repos.map((repo) => (
              <TableRow key={repo.url}>
                <TableCell className="font-medium">{repo.nameWithOwner}</TableCell>
                <TableCell className="text-zinc-500">{repo.url}</TableCell>
                <TableCell className="text-right">
                  <Button color="light">
                    Clone
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  )
}