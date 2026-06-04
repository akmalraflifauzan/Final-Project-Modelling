'use client';

import { useState, useMemo } from 'react';
import { useRef, useEffect } from 'react';
import { computeR0, effectiveParams, parameterSweep } from '@/lib/simulation';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip } from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

const SWEEP_OPTIONS = [
  { key: 'beta', label: 'Beta (β)', min: 0.01, max: 1.0 },
  { key: 'gamma', label: 'Gamma (γ)', min: 0.001, max: 0.5 },
  { key: 'delta', label: 'Delta (δ)', min: 0.0, max: 0.1 },
  { key: 'artCoverage', label: 'ART Coverage', min: 0, max: 1.0 },
  { key: 'protectionRate', label: 'Protection Rate', min: 0, max: 1.0 },
  { key: 'testingRate', label: 'Testing Rate', min: 0, max: 1.0 },
];

function SweepChart({ data, paramLabel }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;

    const labels = data.map((d) => d.value.toFixed(2));
    const chartData = {
      labels,
      datasets: [
        {
          label: 'R₀',
          data: data.map((d) => d.r0),
          borderColor: '#E24B4A',
          backgroundColor: '#E24B4A22',
          borderWidth: 2,
          pointRadius: 2,
          yAxisID: 'y',
          tension: 0.3,
        },
        {
          label: 'Peak Infected',
          data: data.map((d) => d.peakI),
          borderColor: '#3B8BD4',
          backgroundColor: '#3B8BD422',
          borderWidth: 2,
          pointRadius: 2,
          yAxisID: 'y1',
          tension: 0.3,
        },
      ],
    };

    if (chartRef.current) {
      chartRef.current.data = chartData;
      chartRef.current.update('none');
      return;
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: chartData,
      options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: true, position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          x: { title: { display: true, text: paramLabel } },
          y: {
            type: 'linear',
            position: 'left',
            title: { display: true, text: 'R₀' },
            beginAtZero: true,
          },
          y1: {
            type: 'linear',
            position: 'right',
            title: { display: true, text: 'Peak Infected' },
            beginAtZero: true,
            grid: { drawOnChartArea: false },
          },
        },
      },
    });
  }, [data, paramLabel]);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative h-56">
      <canvas ref={canvasRef} />
    </div>
  );
}

export default function SensitivityPanel({ params, history }) {
  const [sweepKey, setSweepKey] = useState('beta');
  const r0 = computeR0(params);
  const { betaEff, gammaEff } = effectiveParams(params);

  const peakI = Math.max(...history.I);
  const peakDay = history.I.indexOf(peakI);
  const isControlled = r0 < 1;

  const selectedOption = SWEEP_OPTIONS.find((o) => o.key === sweepKey);

  const sweepData = useMemo(() => {
    if (!selectedOption) return [];
    return parameterSweep(params, sweepKey, selectedOption.min, selectedOption.max, 25);
  }, [params, sweepKey, selectedOption]);

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
            ? 'Outbreak controlled — each infected individual transmits to fewer than 1 person. The disease will die out naturally.'
            : 'Outbreak spreading — each infected individual transmits to more than 1 person. Intervention is needed to stop the spread.'}
        </p>
      </div>

      {/* Parameter Sweep */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Parameter Sweep
          </h3>
          <select
            value={sweepKey}
            onChange={(e) => setSweepKey(e.target.value)}
            className="text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-700 dark:text-gray-200"
          >
            {SWEEP_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Sweeping <strong>{selectedOption?.label}</strong> from {selectedOption?.min} to {selectedOption?.max} while holding other parameters constant.
        </p>
        <SweepChart data={sweepData} paramLabel={selectedOption?.label ?? ''} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Peak Infection
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
