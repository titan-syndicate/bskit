import { ReactNode } from 'react';

interface StatProps {
  title: string;
  value: string;
  change: string;
}

export function Stat({ title, value, change }: StatProps) {
  return (
    <div>
      <div className="mt-6 text-lg/6 font-medium sm:text-sm/6">{title}</div>
      <div className="mt-3 text-3xl/8 font-semibold sm:text-2xl/8">{value}</div>
      <div className="mt-3 text-sm/6 sm:text-xs/6">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${change.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
          {change}
        </span>{' '}
        <span className="text-zinc-500">from last week</span>
      </div>
    </div>
  );
}