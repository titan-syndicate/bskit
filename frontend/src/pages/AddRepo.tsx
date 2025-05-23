import { Button } from '../components/button';
import { Heading } from '../components/heading';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/table';
import { useAuth } from '../contexts/auth-context';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { GetRecentRepos, CloneRepo, GetRepoStatus } from '../../wailsjs/go/backend/App';
import { Modal } from '../components/modal';

interface Repo {
  nameWithOwner: string
  url: string
  pushedAt: string
  defaultBranch: string
}

interface RepoStatus {
  isCloned: boolean
  path: string
}

export default function AddRepo() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [repos, setRepos] = useState<Repo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cloningRepos, setCloningRepos] = useState<Record<string, boolean>>({})
  const [repoStatuses, setRepoStatuses] = useState<Record<string, RepoStatus>>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [githubUrl, setGithubUrl] = useState('')

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

        // Check status for each repo
        const statuses: Record<string, RepoStatus> = {}
        for (const repo of repos) {
          try {
            const status = await GetRepoStatus(repo.url)
            statuses[repo.url] = status
          } catch (err) {
            console.error(`Failed to get status for ${repo.url}:`, err)
          }
        }
        setRepoStatuses(statuses)
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

  const handleClone = async (repo: Repo) => {
    try {
      setCloningRepos(prev => ({ ...prev, [repo.url]: true }))
      const path = await CloneRepo(repo.url)
      console.log('Cloning repository at path:', path);
      setRepoStatuses(prev => ({
        ...prev,
        [repo.url]: { isCloned: true, path }
      }))
      // Navigate back to repos list after successful clone
      navigate('/repos')
    } catch (err) {
      console.error('Failed to clone repository:', err)
      setError(`Failed to clone ${repo.nameWithOwner}`)
    } finally {
      setCloningRepos(prev => ({ ...prev, [repo.url]: false }))
    }
  }

  const handleCloneUrl = async (url: string) => {
    console.log('Received GitHub URL in handleCloneUrl:', url); // Log the received URL

    if (!url) {
      setError('Please enter a valid GitHub URL');
      return;
    }

    try {
      setCloningRepos(prev => ({ ...prev, [url]: true }));
      const path = await CloneRepo(url);
      setRepoStatuses(prev => ({
        ...prev,
        [url]: { isCloned: true, path },
      }));
      setRepos(prev => [
        ...prev,
        { nameWithOwner: url, url: url, pushedAt: '', defaultBranch: '' },
      ]);
      setIsModalOpen(false);
      setGithubUrl('');
    } catch (err) {
      console.error('Failed to clone repository:', err);
      setError(`Failed to clone ${url}`);
    } finally {
      setCloningRepos(prev => ({ ...prev, [url]: false }));
    }
  };

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <Heading>Add Repository</Heading>
        <div className="flex gap-2">
          <Button className="-my-0.5" onClick={() => navigate('/repos')}>
            Back to Repositories
          </Button>
          <Button
            className="-my-0.5"
            onClick={() => {
              console.log('Clone URL button clicked'); // Log when the button is clicked
              setIsModalOpen(true);
              console.log('isModalOpen state after click:', isModalOpen); // Log the state value
            }}
          >
            Clone URL
          </Button>
        </div>
      </div>
      <Table className="mt-8 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Repository</TableHeader>
            <TableHeader>URL</TableHeader>
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
            repos.map((repo: Repo) => (
              <TableRow key={repo.url}>
                <TableCell className="font-medium">{repo.nameWithOwner}</TableCell>
                <TableCell className="text-zinc-500">
                  <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {repo.url}
                  </a>
                </TableCell>
                <TableCell className="text-right">
                  {repoStatuses[repo.url]?.isCloned ? (
                    <span className="text-green-500">Cloned</span>
                  ) : (
                    <Button
                      color="light"
                      onClick={() => handleClone(repo)}
                      disabled={cloningRepos[repo.url]}
                    >
                      {cloningRepos[repo.url] ? 'Cloning...' : 'Clone'}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Modal for Clone URL */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div>
            <h2 className="text-lg font-medium">Clone Repository</h2>
            <input
              type="text"
              placeholder="Enter GitHub URL"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full mt-2 p-2 border rounded"
            />
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button
                color="blue"
                onClick={() => handleCloneUrl(githubUrl)}
                disabled={cloningRepos[githubUrl]}
              >
                {cloningRepos[githubUrl] ? 'Cloning...' : 'Clone'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}