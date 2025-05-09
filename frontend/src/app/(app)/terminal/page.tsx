import { Heading } from '@/components/heading'
import { TerminalComponent } from '@/components/terminal'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Terminal',
}

export default function TerminalPage() {
  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      <Heading>Terminal</Heading>
      <TerminalComponent />
    </div>
  )
}