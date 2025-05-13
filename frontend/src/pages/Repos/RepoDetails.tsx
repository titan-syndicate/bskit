import { Button } from '../../components/button'
import { Heading } from '../../components/heading'
import { Link } from '../../components/link'
import { useAuth } from '../../contexts/auth-context'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ChevronLeftIcon } from '@heroicons/react/24/solid'

export default function RepoDetails() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const [repoName, setRepoName] = useState<string>('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (id) {
      // For now, just use the ID as the name
      setRepoName(id)
    }
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
    </>
  )
}