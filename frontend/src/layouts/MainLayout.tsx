import { Outlet } from 'react-router-dom'
import { DefaultSidebar } from '@/components/sidebar'
import { UserNavbar } from '@/components/navbar'
import { SidebarLayout } from '@/components/sidebar-layout'

export default function MainLayout() {
  return (
    <SidebarLayout
      navbar={<UserNavbar />}
      sidebar={<DefaultSidebar />}
    >
      <Outlet />
    </SidebarLayout>
  )
}