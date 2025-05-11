import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface SidebarProps {
  children?: ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-1">
            <Link to="/" className="flex items-center rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
              Home
            </Link>
            <Link to="/settings" className="flex items-center rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
              Settings
            </Link>
          </nav>
        </div>
        {children}
      </div>
    </aside>
  );
}