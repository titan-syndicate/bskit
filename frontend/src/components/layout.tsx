import { Helmet } from 'react-helmet-async'
import { Outlet } from 'react-router-dom'
import { DefaultSidebar } from './sidebar'
import { Navbar, NavbarSection, NavbarSpacer } from './navbar'
import { SidebarLayout } from './sidebar-layout'
import { UserCircleIcon } from '@heroicons/react/24/solid'

interface LayoutProps {
  title?: string
  description?: string
}

export function Layout({ title = 'BSKit', description = 'Event management platform' }: LayoutProps) {
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>
      <SidebarLayout
        navbar={
          <Navbar>
            <NavbarSpacer />
            <NavbarSection>
              <div className="flex items-center gap-4">
                {/* Add user menu here if needed */}
              </div>
            </NavbarSection>
          </Navbar>
        }
        sidebar={<DefaultSidebar />}
      >
        <Outlet />
      </SidebarLayout>
    </>
  )
}