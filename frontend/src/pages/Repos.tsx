import { Button } from '../components/button'
import { Heading } from '../components/heading'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/table'
// import { useAuth } from '../contexts/auth-context'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ListClonedRepos, DeleteRepo } from '../../wailsjs/go/backend/App'
import { Link } from '../components/link'
import { Modal } from '../components/modal'; // Corrected import for Modal component

export default function Repos() {
  // Fake authentication to allow viewing the repos
  const isAuthenticated = true; // Temporarily set to true to bypass authentication checks
  const navigate = useNavigate()
  const [clonedRepos, setClonedRepos] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    repoPath: '',
    repoName: '',
  });

  useEffect(() => {
    // if (!isAuthenticated) {
    //   navigate('/login')
    // }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    async function fetchClonedRepos() {
      try {
        const repos = await ListClonedRepos()
        setClonedRepos(repos || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch cloned repositories')
      } finally {
        setIsLoading(false)
      }
    }

    // if (isAuthenticated) {
    fetchClonedRepos()
    // }
  }, [isAuthenticated])

  // Re-add the testDeleteRepo function to debug why the path isn't being passed correctly
  // useEffect(() => {
  //   async function testDeleteRepo() {
  //     try {
  //       const repos = await ListClonedRepos();
  //       if (repos.length === 0) {
  //         console.log("No repositories available to test DeleteRepo.");
  //         return;
  //       }

  //       const testPath = repos[0]; // Use the first repository path
  //       console.log(`Testing DeleteRepo with path: ${testPath}`);
  //       const response = await DeleteRepo(testPath);
  //       console.log("DeleteRepo response:", response);
  //     } catch (err) {
  //       console.error("DeleteRepo test failed:", err);
  //     }
  //   }

  //   testDeleteRepo();
  // }, []);

  if (!isAuthenticated) {
    return null
  }

  const openDeleteConfirmation = (repoPath: string, repoName: string) => {
    setDeleteConfirmation({ isOpen: true, repoPath, repoName });
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({ isOpen: false, repoPath: '', repoName: '' });
  };

  const confirmDelete = async () => {
    const { repoPath } = deleteConfirmation; // Removed unused repoName variable
    closeDeleteConfirmation();

    try {
      console.log(`Calling DeleteRepo for repoPath: ${repoPath}`);
      await DeleteRepo(repoPath);
      console.log(`DeleteRepo successful for repoPath: ${repoPath}`);

      setClonedRepos((prev) => {
        const updatedRepos = prev.filter((path) => path !== repoPath);
        console.log(`Updated clonedRepos state:`, updatedRepos);
        return updatedRepos;
      });
    } catch (err) {
      console.error('Failed to delete the repository:', err);
      alert('Failed to delete the repository. Please try again.');
    }
  };

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
                  <TableCell className="font-medium">{repoName}</TableCell>
                  <TableCell className="text-zinc-500">{repoPath}</TableCell>
                  <TableCell className="text-right">
                    <Link to={`/repos/${repoName}`}>
                      <Button color="light">Open</Button>
                    </Link>
                    <Button
                      color="red"
                      onClick={() => openDeleteConfirmation(repoPath, repoName)}
                      className="ml-2"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      {deleteConfirmation.isOpen && (
        <Modal isOpen={deleteConfirmation.isOpen} onClose={closeDeleteConfirmation}>
          <p>Are you sure you want to delete the repository {deleteConfirmation.repoName}?</p>
          <div className="flex justify-end gap-2">
            <Button onClick={closeDeleteConfirmation}>Cancel</Button>
            <Button color="red" onClick={confirmDelete}>Delete</Button>
          </div>
        </Modal>
      )}
    </>
  )
}