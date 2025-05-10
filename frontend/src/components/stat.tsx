interface StatProps {
  title: string;
  value: string;
  change: string;
}

export function Stat({ title, value, change }: StatProps) {
  const isPositive = change.startsWith('+');

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <dt className="text-sm font-medium text-gray-500">{title}</dt>
      <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
        <div className="flex items-baseline text-2xl font-semibold text-gray-900">
          {value}
        </div>
        <div
          className={`inline-flex items-baseline rounded-full px-2.5 py-0.5 text-sm font-medium ${isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
        >
          {change}
        </div>
      </dd>
    </div>
  );
}