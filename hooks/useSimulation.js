'use client';

import { useRef, useState, useCallback } from 'react';
import {
  DEFAULT_PARAMS,
  initState,
  initHistory,
  appendHistory,
  stochasticStep,
} from '@/lib/simulation';

const STEPS_PER_FRAME = 3;
const MAX_DAY = 365;

export function useSimulation() {
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [playState, setPlayState] = useState('idle');
  const [state, setState] = useState(() => initState(DEFAULT_PARAMS));
  const [history, setHistory] = useState(() => initHistory(initState(DEFAULT_PARAMS)));

  const stateRef = useRef(initState(DEFAULT_PARAMS));
  const historyRef = useRef(initHistory(initState(DEFAULT_PARAMS)));
  const paramsRef = useRef(DEFAULT_PARAMS);
  const playStateRef = useRef('idle');
  const rafRef = useRef(null);

  const syncState = useCallback(() => {
    setState({ ...stateRef.current });
    setHistory({ ...historyRef.current });
  }, []);

  const loop = useCallback(() => {
    if (playStateRef.current !== 'playing') return;

    for (let i = 0; i < STEPS_PER_FRAME; i++) {
      if (stateRef.current.day >= MAX_DAY || stateRef.current.I === 0) {
        playStateRef.current = 'done';
        setPlayState('done');
        syncState();
        return;
      }
      const next = stochasticStep(stateRef.current, paramsRef.current);
      historyRef.current = appendHistory(historyRef.current, next);
      stateRef.current = next;
    }

    syncState();
    rafRef.current = requestAnimationFrame(loop);
  }, [syncState]);

  const play = useCallback(() => {
    if (playStateRef.current === 'done') return;
    playStateRef.current = 'playing';
    setPlayState('playing');
    rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const pause = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    playStateRef.current = 'paused';
    setPlayState('paused');
  }, []);

  const reset = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const newState = initState(paramsRef.current);
    const newHistory = initHistory(newState);
    stateRef.current = newState;
    historyRef.current = newHistory;
    playStateRef.current = 'idle';
    setPlayState('idle');
    setState(newState);
    setHistory(newHistory);
  }, []);

  const updateParams = useCallback((key, value) => {
    const updated = { ...paramsRef.current, [key]: value };
    paramsRef.current = updated;
    setParams(updated);
    if (playStateRef.current === 'idle') {
      const newState = initState(updated);
      const newHistory = initHistory(newState);
      stateRef.current = newState;
      historyRef.current = newHistory;
      setState(newState);
      setHistory(newHistory);
    }
  }, []);

  return { params, playState, state, history, play, pause, reset, updateParams };
}
