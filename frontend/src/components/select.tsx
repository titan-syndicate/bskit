import { forwardRef } from 'react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ className, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={`rounded-lg border-0 bg-zinc-100 px-3 py-1.5 text-sm/6 font-medium text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-inset focus:ring-zinc-400 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 dark:focus:ring-zinc-600 ${className}`}
      {...props}
    />
  )
})
