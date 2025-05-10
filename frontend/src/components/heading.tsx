import { ReactNode } from 'react';

interface HeadingProps {
  children: ReactNode;
  className?: string;
}

export function Heading({ children, className = '' }: HeadingProps) {
  return (
    <h1 className={`text-2xl font-semibold text-gray-900 ${className}`}>
      {children}
    </h1>
  );
}

export function Subheading({ children, className = '' }: HeadingProps) {
  return (
    <h2 className={`text-lg font-medium text-gray-900 ${className}`}>
      {children}
    </h2>
  );
}