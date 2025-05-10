import { ReactNode } from 'react';

interface SidebarLayoutProps {
  navbar: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
}

export function SidebarLayout({ navbar, sidebar, children }: SidebarLayoutProps) {
  return (
    <div className="flex h-screen">
      <div className="flex-none">
        {sidebar}
      </div>
      <div className="flex flex-1 flex-col">
        {navbar}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}