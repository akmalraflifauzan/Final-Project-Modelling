export default function MetricCard({ label, value, color, total }) {
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span
          className="inline-block w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {Math.round(value).toLocaleString('id-ID')}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{pct}% dari populasi</p>
    </div>
  );
}
