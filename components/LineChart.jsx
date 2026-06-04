'use client';

import { useRef, useEffect } from 'react';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip } from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

const COLORS = {
  S: '#3B8BD4',
  I: '#E24B4A',
  R: '#639922',
  D: '#888780',
};

export default function LineChart({ history }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const labels = history.S.map((_, i) => i);

    const data = {
      labels,
      datasets: [
        {
          label: 'S',
          data: history.S,
          borderColor: COLORS.S,
          backgroundColor: COLORS.S + '22',
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0.3,
        },
        {
          label: 'I',
          data: history.I,
          borderColor: COLORS.I,
          backgroundColor: COLORS.I + '22',
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0.3,
        },
        {
          label: 'R',
          data: history.R,
          borderColor: COLORS.R,
          backgroundColor: COLORS.R + '22',
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0.3,
        },
        {
          label: 'D',
          data: history.D,
          borderColor: COLORS.D,
          backgroundColor: COLORS.D + '22',
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0.3,
        },
      ],
    };

    if (chartRef.current) {
      chartRef.current.data.labels = labels;
      chartRef.current.data.datasets.forEach((ds, i) => {
        ds.data = data.datasets[i].data;
      });
      chartRef.current.update('none');
      return;
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data,
      options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
        scales: {
          x: {
            title: { display: true, text: 'Day' },
            ticks: { maxTicksLimit: 10 },
          },
          y: {
            title: { display: true, text: 'Individuals' },
            beginAtZero: true,
          },
        },
      },
    });
  }, [history]);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative h-52">
      <canvas ref={canvasRef} />
    </div>
  );
}
