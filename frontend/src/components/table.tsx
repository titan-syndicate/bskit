'use client'

import type React from 'react'
import { Link } from './link'

// const TableContext = createContext<{ bleed: boolean; dense: boolean; grid: boolean; striped: boolean }>({
//   bleed: false,
//   dense: false,
//   grid: false,
//   striped: false,
// })

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  className?: string
}

export function Table({ className, ...props }: TableProps) {
  return (
    <div className="relative">
      <div className="overflow-x-auto">
        <table
          className={`w-full border-separate border-spacing-0 text-sm/6 text-zinc-600 dark:text-zinc-400 ${className}`}
          {...props}
        />
      </div>
    </div>
  )
}

export function TableHead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={`border-b border-zinc-200 dark:border-zinc-800 ${className}`} {...props} />
  )
}

export function TableHeader({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`border-b border-zinc-200 px-4 py-3.5 text-left font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-200 ${className}`}
      {...props}
    />
  )
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={className} {...props} />
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  href?: string
  title?: string
}

export function TableRow({ className, href, title, ...props }: TableRowProps) {
  const baseProps = {
    title,
    className: `group relative border-b border-zinc-100 last:border-0 dark:border-zinc-800/50 ${className}`
  }

  if (href) {
    return <Link to={href} {...baseProps} />
  }

  return <tr {...baseProps} {...props} />
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`px-4 py-4 first:pl-0 last:pr-0 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800/50 ${className}`}
      {...props}
    />
  )
}
