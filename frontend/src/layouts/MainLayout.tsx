import { Outlet } from 'react-router-dom'
import { DefaultSidebar } from '@/components/sidebar'
import { Navbar, NavbarSpacer, NavbarSection, NavbarItem } from '@/components/navbar'
import { SidebarLayout } from '@/components/sidebar-layout'
import { Dropdown, DropdownButton } from '@/components/dropdown'
import { Avatar } from '@/components/avatar'
import { AccountDropdownMenu } from '@/components/account-dropdown-menu'

export default function MainLayout() {
  return (
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
  )
}