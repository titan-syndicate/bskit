import { Button } from '../../components/button'
import { Heading } from '../../components/heading'
import { Link } from '../../components/link'
import { useAuth } from '../../contexts/auth-context'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ChevronLeftIcon } from '@heroicons/react/24/solid'
import { Tab } from '@headlessui/react'
import clsx from 'clsx'
import { BuildInterface } from '../../components/build-interface'
import { ListClonedRepos } from '../../../wailsjs/go/backend/App'

function classNames(...classes: string[]) {
  return clsx(...classes)
}

export default function RepoDetails() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const [repoName, setRepoName] = useState<string>('')
  const [repoPath, setRepoPath] = useState<string>('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    async function fetchRepoPath() {
      if (id) {
        try {
          const repos = await ListClonedRepos()
          const repo = repos.find((repo: string) => repo.split('/').pop() === id)
          if (repo) {
            setRepoPath(repo)
            setRepoName(id)
          }
        } catch (err) {
          console.error('Failed to fetch repo path:', err)
        }
      }
    }

    fetchRepoPath()
  }, [id])

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <div className="max-lg:hidden">
        <Link to="/repos" className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          Repositories
        </Link>
      </div>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Heading>{repoName}</Heading>
        </div>
        <div className="flex gap-4">
          <Button outline>Edit</Button>
          <Button>Open</Button>
        </div>
      </div>

      <div className="mt-8">
        <Tab.Group>
          <Tab.List className="flex space-x-1 border-b border-zinc-200 dark:border-zinc-800">
            <Tab
              className={({ selected }) =>
                classNames(
                  'px-4 py-2 text-sm font-medium leading-5',
                  'focus:outline-none',
                  selected
                    ? 'border-b-2 border-zinc-900 text-zinc-900 dark:border-white dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
                )
              }
            >
              Details
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'px-4 py-2 text-sm font-medium leading-5',
                  'focus:outline-none',
                  selected
                    ? 'border-b-2 border-zinc-900 text-zinc-900 dark:border-white dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
                )
              }
            >
              CI/CD
            </Tab>
          </Tab.List>
          <Tab.Panels className="mt-4">
            <Tab.Panel>
              <div className="space-y-4">
                {/* Details content will go here */}
                <p className="text-zinc-500">Repository details coming soon...</p>
              </div>
            </Tab.Panel>
            <Tab.Panel>
              {repoPath ? (
                <BuildInterface repoPath={repoPath} repoName={repoName} />
              ) : (
                <p className="text-zinc-500">Loading repository information...</p>
              )}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </>
  )
}