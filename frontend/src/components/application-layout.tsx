import { ReactNode } from 'react';
import { SidebarLayout } from './sidebar-layout';
import { Navbar, NavbarSection, NavbarItem, NavbarLabel } from './navbar';
import { Sidebar, SidebarHeader, SidebarBody, SidebarSection, SidebarItem, SidebarLabel } from './sidebar';
import { Dropdown, DropdownButton, DropdownMenu, DropdownItem, DropdownLabel, DropdownDivider } from './dropdown';
import { Avatar } from './avatar';
import {
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Cog8ToothIcon,
  LightBulbIcon,
  PlusIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from '@heroicons/react/16/solid';
import {
  Cog6ToothIcon,
  HomeIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  Square2StackIcon,
  TicketIcon,
} from '@heroicons/react/20/solid';

interface ApplicationLayoutProps {
  children: ReactNode;
}

export function ApplicationLayout({ children }: ApplicationLayoutProps) {
  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSection>
            <NavbarItem current>
              <HomeIcon data-slot="icon" />
              <NavbarLabel>Home</NavbarLabel>
            </NavbarItem>
            <NavbarItem>
              <Cog6ToothIcon data-slot="icon" />
              <NavbarLabel>Settings</NavbarLabel>
            </NavbarItem>
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <Dropdown>
              <DropdownButton as={SidebarItem}>
                <img src="/appicon.png" alt="App Icon" className="w-10 h-10" />
                <SidebarLabel>Bskit</SidebarLabel>
                <ChevronDownIcon className="w-5 h-5" />
              </DropdownButton>
              <DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
                <DropdownItem to="/settings">
                  <Cog8ToothIcon className="w-5 h-5" />
                  <DropdownLabel>Settings</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem to="#">
                  <img src="/appicon.png" alt="App Icon" className="w-8 h-8" />
                  <DropdownLabel>Catalyst</DropdownLabel>
                </DropdownItem>
                <DropdownItem to="#">
                  <Avatar initials="BE" className="bg-purple-500 text-white w-8 h-8" />
                  <DropdownLabel>Big Events</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem to="#">
                  <PlusIcon className="w-5 h-5" />
                  <DropdownLabel>New team&hellip;</DropdownLabel>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </SidebarHeader>
          <SidebarBody>
            <SidebarSection>
              <SidebarItem to="/" current>
                <HomeIcon data-slot="icon" />
                <SidebarLabel>Home</SidebarLabel>
              </SidebarItem>
              <SidebarItem to="/settings">
                <Cog6ToothIcon data-slot="icon" />
                <SidebarLabel>Settings</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarBody>
        </Sidebar>
      }
    >
      {children}
    </SidebarLayout>
  );
}