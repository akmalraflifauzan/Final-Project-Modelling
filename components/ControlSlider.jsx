export default function ControlSlider({ label, min, max, step, value, format, onChange }) {
  const display = format ? format(value) : value;

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {label}
        </span>
        <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-gray-700 dark:accent-gray-300 h-2 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{format ? format(min) : min}</span>
        <span>{format ? format(max) : max}</span>
      </div>
    </div>
  );
}
