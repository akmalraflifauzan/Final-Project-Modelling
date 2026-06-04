'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { runMultipleSimulations } from '@/lib/simulation';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

export default function MultiRunChart({ params }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      const res = runMultipleSimulations(params, 10, 365);
      setResult(res);
      setLoading(false);
    }, 50);
  }, [params]);

  useEffect(() => {
    if (!canvasRef.current || !result) return;

    const { runs, stats } = result;
    const labels = stats.mean.map((_, i) => i);

    const datasets = [
      {
        label: '90th Percentile',
        data: stats.upper,
        borderColor: 'transparent',
        backgroundColor: '#E24B4A18',
        pointRadius: 0,
        fill: '+1',
        tension: 0.3,
        order: 10,
      },
      {
        label: '10th Percentile',
        data: stats.lower,
        borderColor: 'transparent',
        backgroundColor: '#E24B4A18',
        pointRadius: 0,
        fill: false,
        tension: 0.3,
        order: 10,
      },
      {
        label: 'Mean (n=10)',
        data: stats.mean,
        borderColor: '#E24B4A',
        backgroundColor: '#E24B4A22',
        borderWidth: 2.5,
        pointRadius: 0,
        fill: false,
        tension: 0.3,
        order: 1,
      },
      ...runs.map((h, i) => ({
        label: i === 0 ? 'Individual runs' : '',
        data: h.I,
        borderColor: '#E24B4A33',
        backgroundColor: 'transparent',
        borderWidth: 0.8,
        pointRadius: 0,
        fill: false,
        tension: 0.3,
        order: 5,
      })),
    ];

    const chartData = { labels, datasets };

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
          legend: {
            display: true,
            position: 'top',
            labels: {
              boxWidth: 12,
              font: { size: 11 },
              filter: (item) => item.text !== '',
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            filter: (item) => ['Mean (n=10)', '90th Percentile', '10th Percentile'].includes(item.dataset.label),
          },
        },
        scales: {
          x: { title: { display: true, text: 'Day' }, ticks: { maxTicksLimit: 10 } },
          y: { title: { display: true, text: 'Infected (I)' }, beginAtZero: true },
        },
      },
    });
  }, [result]);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);

  const peakMean = result ? Math.round(Math.max(...result.stats.mean)) : 0;
  const variance = result
    ? Math.round(
        result.stats.upper.reduce((max, v, i) => Math.max(max, v - result.stats.lower[i]), 0)
      )
    : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Stochastic Variance (10 Runs)
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Same parameters, different outcomes — demonstrating stochastic uncertainty.
          </p>
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {loading ? 'Running...' : result ? 'Run Again' : 'Run 10x'}
        </button>
      </div>

      {result && (
        <>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
            <div className="relative h-56">
              <canvas ref={canvasRef} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Mean Peak Infected
              </p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {peakMean.toLocaleString('en-US')}
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Max Spread (P90−P10)
              </p>
              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                {variance.toLocaleString('en-US')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">stochastic variance</p>
            </div>
          </div>
        </>
      )}

      {!result && (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 flex items-center justify-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Click "Run 10x" to simulate 10 independent runs with current parameters.
          </p>
        </div>
      )}
    </div>
  );
}
