'use client';

import { computeR0, effectiveParams } from '@/lib/simulation';

const BAR_PARAMS = [
  { key: 'beta', label: 'Beta (β)', max: 1.0 },
  { key: 'gamma', label: 'Gamma (γ)', max: 0.5 },
  { key: 'delta', label: 'Delta (δ)', max: 0.1 },
  { key: 'artCoverage', label: 'ART Coverage', max: 1.0 },
];

function HBar({ label, value, max, color }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
        <span>{label}</span>
        <span className="font-semibold">{value.toFixed(3)}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
        <div
          className="h-4 rounded-full transition-all duration-150"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

const BAR_COLORS = ['#3B8BD4', '#639922', '#888780', '#E24B4A'];

export default function SensitivityPanel({ params, history }) {
  const r0 = computeR0(params);
  const { betaEff, gammaEff } = effectiveParams(params);

  const peakI = Math.max(...history.I);
  const peakDay = history.I.indexOf(peakI);

  const isControlled = r0 < 1;

  return (
    <div className="flex flex-col gap-4">
      {/* R0 Banner */}
      <div
        className={`rounded-lg p-4 ${isControlled ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Basic Reproduction Number (R₀)
          </span>
          <span
            className={`text-2xl font-bold ${isControlled ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}
          >
            {r0.toFixed(2)}
          </span>
        </div>
        <p className="text-xs mt-1 text-gray-600 dark:text-gray-300">
          {isControlled
            ? 'Outbreak controlled — each infected individual transmits to less than 1 person. The disease will naturally disappear.'
            : 'Outbreak spreading — each infected individual transmits to more than 1 person. Intervention is needed to stop transmission.'}
        </p>
      </div>

      {/* Bar Charts */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          Parameter Values
        </h3>
        {BAR_PARAMS.map((p, i) => (
          <HBar
            key={p.key}
            label={p.label}
            value={params[p.key]}
            max={p.max}
            color={BAR_COLORS[i]}
          />
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Peak Infections
          </p>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">
            {Math.round(peakI).toLocaleString('en-US')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">on day {peakDay}</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Effective Beta
          </p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {betaEff.toFixed(4)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Effective gamma: {gammaEff.toFixed(4)}</p>
        </div>
      </div>
    </div>
  );
}
