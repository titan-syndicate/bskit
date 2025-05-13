import { Button } from '../components/button'
import { Heading } from '../components/heading'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/table'
import { useAuth } from '../contexts/auth-context'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ListClonedRepos } from '../../wailsjs/go/backend/App'
import { Link } from '../components/link'

export default function Repos() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [clonedRepos, setClonedRepos] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    async function fetchClonedRepos() {
      try {
        const repos = await ListClonedRepos()
        setClonedRepos(repos)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch cloned repositories')
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchClonedRepos()
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <Heading>Repositories</Heading>
        <Button className="-my-0.5" onClick={() => navigate('/repos/add')}>
          Add Repository
        </Button>
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
          ) : clonedRepos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-zinc-500">
                No repositories cloned yet. Click "Add Repository" to get started.
              </TableCell>
            </TableRow>
          ) : (
            clonedRepos.map((repoPath) => {
              const repoName = repoPath.split('/').pop() || ''
              return (
                <TableRow key={repoPath}>
                  <TableCell className="font-medium">
                    <Link to={`/repos/${repoName}`}>{repoName}</Link>
                  </TableCell>
                  <TableCell className="text-zinc-500">{repoPath}</TableCell>
                  <TableCell className="text-right">
                    <Button color="light">
                      Open
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </>
  )
}