interface StatProps {
  title: string
  value: string
  change?: string
}

export function Stat({ title, value, change }: StatProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</div>
      <div className="mt-2 flex items-baseline">
        <div className="text-2xl font-semibold text-zinc-900 dark:text-white">{value}</div>
        {change && (
          <div
            className={`ml-2 text-sm font-medium ${change.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
          >
            {change}
          </div>
        )}
      </div>
    </div>
  )
}