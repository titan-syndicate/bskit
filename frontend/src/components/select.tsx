import { ChangeEvent } from 'react';

interface SelectProps {
  name: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  className?: string;
}

export function Select({ name, value, onChange, children, className = '' }: SelectProps) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
    >
      {children}
    </select>
  );
}