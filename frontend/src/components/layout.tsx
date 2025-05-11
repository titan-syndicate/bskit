import { Helmet } from 'react-helmet-async'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { UserNavbar } from './navbar'

interface LayoutProps {
  title?: string
  description?: string
}

export function Layout({ title = 'BSKit', description = 'Event management platform' }: LayoutProps) {
  return (
    <div className="flex h-screen">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <UserNavbar />
        <main className="flex-1 overflow-y-auto bg-white px-4 py-8 dark:bg-zinc-900 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}