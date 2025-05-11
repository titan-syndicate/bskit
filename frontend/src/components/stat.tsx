import { Badge } from './badge'
import { Divider } from './divider'

interface StatProps {
  title: string
  value: string
  change: string
}

export function Stat({ title, value, change }: StatProps) {
  return (
    <div>
      <Divider />
      <div className="mt-6 text-lg/6 font-medium text-zinc-950 dark:text-white sm:text-sm/6">{title}</div>
      <div className="mt-3 text-3xl/8 font-semibold text-zinc-950 dark:text-white sm:text-2xl/8">{value}</div>
      <div className="mt-3 text-sm/6 sm:text-xs/6">
        <Badge color={change.startsWith('+') ? 'lime' : 'pink'}>{change}</Badge>{' '}
        <span className="text-zinc-500 dark:text-zinc-400">from last week</span>
      </div>
    </div>
  )
}