import { ReactNode } from 'react';
import { SidebarLayout } from './sidebar-layout';
import { Navbar } from './navbar';
import { Sidebar } from './sidebar';

interface ApplicationLayoutProps {
  children: ReactNode;
}

export function ApplicationLayout({ children }: ApplicationLayoutProps) {
  return (
    <SidebarLayout
      navbar={<Navbar />}
      sidebar={<Sidebar />}
    >
      {children}
    </SidebarLayout>
  );
}