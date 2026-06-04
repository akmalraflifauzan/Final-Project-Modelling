'use client';

import { useRef, useState, useCallback } from 'react';
import {
  DEFAULT_PARAMS,
  initState,
  initHistory,
  appendHistory,
  stochasticStep,
} from '@/lib/simulation';

const MAX_DAY = 365;

const SPEED_DELAY = { 1: 120, 2: 60, 3: 20, 4: 5, 5: 0 };

export function useSimulation() {
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [playState, setPlayState] = useState('idle');
  const [state, setState] = useState(() => initState(DEFAULT_PARAMS));
  const [history, setHistory] = useState(() => initHistory(initState(DEFAULT_PARAMS)));
  const [speed, setSpeed] = useState(3);

  const stateRef = useRef(initState(DEFAULT_PARAMS));
  const historyRef = useRef(initHistory(initState(DEFAULT_PARAMS)));
  const paramsRef = useRef(DEFAULT_PARAMS);
  const playStateRef = useRef('idle');
  const speedRef = useRef(3);
  const rafRef = useRef(null);
  const timeoutRef = useRef(null);

  const syncState = useCallback(() => {
    setState({ ...stateRef.current });
    setHistory({ ...historyRef.current });
  }, []);

  const step = useCallback(() => {
    if (playStateRef.current !== 'playing') return;

    if (stateRef.current.day >= MAX_DAY || stateRef.current.I === 0) {
      playStateRef.current = 'done';
      setPlayState('done');
      syncState();
      return;
    }

    const next = stochasticStep(stateRef.current, paramsRef.current);
    historyRef.current = appendHistory(historyRef.current, next);
    stateRef.current = next;
    syncState();

    const delay = SPEED_DELAY[speedRef.current] ?? 20;
    if (delay === 0) {
      rafRef.current = requestAnimationFrame(step);
    } else {
      timeoutRef.current = setTimeout(() => {
        rafRef.current = requestAnimationFrame(step);
      }, delay);
    }
  }, [syncState]);

  const play = useCallback(() => {
    if (playStateRef.current === 'done') return;
    playStateRef.current = 'playing';
    setPlayState('playing');
    rafRef.current = requestAnimationFrame(step);
  }, [step]);

  const pause = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    playStateRef.current = 'paused';
    setPlayState('paused');
  }, []);

  const reset = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
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

  const applyPreset = useCallback((presetValues) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    paramsRef.current = presetValues;
    setParams(presetValues);
    const newState = initState(presetValues);
    const newHistory = initHistory(newState);
    stateRef.current = newState;
    historyRef.current = newHistory;
    playStateRef.current = 'idle';
    setPlayState('idle');
    setState(newState);
    setHistory(newHistory);
  }, []);

  const updateSpeed = useCallback((val) => {
    speedRef.current = val;
    setSpeed(val);
  }, []);

  return { params, playState, state, history, speed, play, pause, reset, updateParams, applyPreset, updateSpeed };
}
