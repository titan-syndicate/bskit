import { Heading } from '../components/heading'
import { Text } from '../components/text'
import { Button } from '../components/button'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { useNavigate } from 'react-router-dom'

export default function LoginConfirmation() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-start justify-center pt-32">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <Heading className="mt-6 text-3xl/8 font-semibold text-zinc-950 dark:text-white">
            Successfully Signed In
          </Heading>
          <Text className="mt-2 text-lg/6 text-zinc-600 dark:text-zinc-400">
            You're now ready to start using Build System Kit
          </Text>
        </div>

        <div className="space-y-4">
          <Button
            className="w-full bg-[#24292F] hover:bg-[#24292F]/90 text-white"
            onClick={() => navigate('/repos')}
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  )
}