import { ReactNode } from 'react';

interface NavbarProps {
  children?: ReactNode;
}

export function Navbar({ children }: NavbarProps) {
  return (
    <nav className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold">Wails App</h1>
      </div>
      {children}
    </nav>
  );
}