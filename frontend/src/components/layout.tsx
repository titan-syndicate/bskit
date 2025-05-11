import { Helmet } from 'react-helmet-async'
import { Outlet } from 'react-router-dom'
import { DefaultSidebar } from './sidebar'
import { Navbar, NavbarSection, NavbarSpacer, NavbarItem } from './navbar'
import { SidebarLayout } from './sidebar-layout'
import { Dropdown, DropdownButton } from './dropdown'
import { Avatar } from './avatar'
import { AccountDropdownMenu } from './account-dropdown-menu'

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
              <Dropdown>
                <DropdownButton as={NavbarItem}>
                  <Avatar src="/users/erica.jpg" square data-slot="avatar" />
                </DropdownButton>
                <AccountDropdownMenu anchor="bottom end" />
              </Dropdown>
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