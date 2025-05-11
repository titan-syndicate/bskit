import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/sidebar'
import { UserNavbar } from '@/components/navbar'

export default function MainLayout() {
  return (
    <div className="flex h-screen">
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