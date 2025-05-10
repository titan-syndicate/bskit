import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface TableProps {
  children: ReactNode;
  className?: string;
}

interface TableRowProps {
  children: ReactNode;
  href?: string;
  title?: string;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className={`overflow-hidden rounded-lg border border-gray-200 ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return <thead className="bg-gray-50">{children}</thead>;
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-gray-200 bg-white">{children}</tbody>;
}

export function TableRow({ children, href, title, className = '' }: TableRowProps) {
  const content = (
    <tr className={`hover:bg-gray-50 ${className}`}>
      {children}
    </tr>
  );

  if (href) {
    return (
      <Link to={href} title={title} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

export function TableHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <td className={`whitespace-nowrap px-6 py-4 text-sm text-gray-900 ${className}`}>
      {children}
    </td>
  );
}