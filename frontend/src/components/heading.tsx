import clsx from 'clsx'

interface HeadingProps {
  children: React.ReactNode
  className?: string
}

export function Heading({ children, className }: HeadingProps) {
  return <h1 className={`text-2xl font-semibold text-zinc-900 dark:text-white ${className}`}>{children}</h1>
}

export function Subheading({ children, className }: HeadingProps) {
  return <h2 className={`text-lg font-medium text-zinc-900 dark:text-white ${className}`}>{children}</h2>
}
