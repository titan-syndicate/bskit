import { Link as RouterLink } from 'react-router-dom'

interface LinkProps extends React.ComponentPropsWithoutRef<typeof RouterLink> {
  className?: string
}

export function Link({ className, ...props }: LinkProps) {
  return (
    <RouterLink
      className={`text-sm/6 font-medium text-zinc-900 hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300 ${className}`}
      {...props}
    />
  )
}
