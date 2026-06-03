'use client';

import { useRef, useEffect, useCallback } from 'react';

const EMOJIS = { S: '🤧', I: '🤢', R: '☺️', D: '💀' };
const MAX_DOTS = 400;

function initDots(count) {
  return Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - 0.5) * 0.008,
    vy: (Math.random() - 0.5) * 0.008,
    status: 'S',
  }));
}

export default function PopulationCanvas({ state, params }) {
  const canvasRef = useRef(null);
  const dotsRef = useRef(initDots(MAX_DOTS));
  const rafRef = useRef(null);
  const stateRef = useRef(state);
  const paramsRef = useRef(params);

  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { paramsRef.current = params; }, [params]);

  const syncDots = useCallback(() => {
    const { S, I, R, D } = stateRef.current;
    const total = S + I + R + D || 1;
    const dots = dotsRef.current;
    const n = dots.length;

    const sCount = Math.round((S / total) * n);
    const iCount = Math.round((I / total) * n);
    const rCount = Math.round((R / total) * n);

    let idx = 0;
    for (let i = 0; i < sCount && idx < n; i++, idx++) dots[idx].status = 'S';
    for (let i = 0; i < iCount && idx < n; i++, idx++) dots[idx].status = 'I';
    for (let i = 0; i < rCount && idx < n; i++, idx++) dots[idx].status = 'R';
    while (idx < n) { dots[idx].status = 'D'; idx++; }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      syncDots();

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#f9fafb';
      ctx.fillRect(0, 0, w, h);

      ctx.font = '14px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const dots = dotsRef.current;
      for (const dot of dots) {
        dot.x += dot.vx;
        dot.y += dot.vy;
        if (dot.x < 0 || dot.x > 1) dot.vx *= -1;
        if (dot.y < 0 || dot.y > 1) dot.vy *= -1;
        dot.x = Math.max(0, Math.min(1, dot.x));
        dot.y = Math.max(0, Math.min(1, dot.y));
        ctx.fillText(EMOJIS[dot.status], dot.x * w, dot.y * h);
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [syncDots]);

  return (
    <canvas
      ref={canvasRef}
      width={560}
      height={400}
      className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
    />
  );
}
