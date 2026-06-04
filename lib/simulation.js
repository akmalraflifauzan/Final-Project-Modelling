export const DEFAULT_PARAMS = {
  beta: 0.3,
  gamma: 0.05,
  delta: 0.01,
  N: 1000,
  i0: 10,
  artCoverage: 0.0,
  protectionRate: 0.0,
  testingRate: 0.0,
};

export const PRESETS = {
  none: {
    label: 'No Intervention',
    desc: 'No protection, testing, or treatment.',
    values: { beta: 0.4, gamma: 0.03, delta: 0.015, N: 1000, i0: 10, artCoverage: 0, protectionRate: 0, testingRate: 0 },
  },
  moderate: {
    label: 'Moderate',
    desc: '50% ART, 40% protection (condom/PrEP), 30% testing.',
    values: { beta: 0.3, gamma: 0.05, delta: 0.01, N: 1000, i0: 10, artCoverage: 0.5, protectionRate: 0.4, testingRate: 0.3 },
  },
  full: {
    label: 'Full Intervention',
    desc: 'High ART, protection, and routine testing — UNAIDS 95-95-95 target.',
    values: { beta: 0.3, gamma: 0.05, delta: 0.01, N: 1000, i0: 10, artCoverage: 0.9, protectionRate: 0.8, testingRate: 0.7 },
  },
};

export function effectiveParams(params) {
  const { beta, gamma, delta, N, i0, artCoverage, protectionRate = 0, testingRate = 0 } = params;
  const betaEff = beta * (1 - protectionRate * 0.85) * (1 - artCoverage * 0.7);
  const gammaEff = gamma * (1 + artCoverage * 2.5) * (1 + testingRate * 1.5);
  return { betaEff, gammaEff, delta, N, i0, artCoverage, protectionRate, testingRate };
}

export function computeR0(params) {
  const { betaEff, gammaEff, delta } = effectiveParams(params);
  return betaEff / (gammaEff + delta);
}

export function gaussRand() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export function stochasticStep(state, params) {
  const { S, I, R, D, day } = state;
  const { betaEff, gammaEff, delta, N } = effectiveParams(params);

  const infRate = betaEff * S * I / N;
  const recRate = gammaEff * I;
  const deaRate = delta * I;

  const newInf = Math.round(infRate + Math.sqrt(Math.max(infRate, 0)) * gaussRand());
  const newRec = Math.round(recRate + Math.sqrt(Math.max(recRate, 0)) * gaussRand());
  const newDea = Math.round(deaRate + Math.sqrt(Math.max(deaRate, 0)) * gaussRand());

  const clampedInf = Math.max(0, Math.min(newInf, S, I >= 0 ? S : 0));
  const clampedRec = Math.max(0, Math.min(newRec, I));
  const clampedDea = Math.max(0, Math.min(newDea, Math.max(0, I - clampedRec)));

  const newS = Math.max(0, S - clampedInf);
  const newI = Math.max(0, I + clampedInf - clampedRec - clampedDea);
  const newR = Math.max(0, R + clampedRec);
  const newD = Math.max(0, D + clampedDea);

  return { S: newS, I: newI, R: newR, D: newD, day: day + 1 };
}

export function initState(params) {
  return { S: params.N - params.i0, I: params.i0, R: 0, D: 0, day: 0 };
}

export function initHistory(state) {
  return {
    S: [state.S],
    I: [state.I],
    R: [state.R],
    D: [state.D],
  };
}

export function appendHistory(history, state) {
  return {
    S: [...history.S, state.S],
    I: [...history.I, state.I],
    R: [...history.R, state.R],
    D: [...history.D, state.D],
  };
}

export function getPhase(history, day) {
  const len = history.I.length;
  if (len < 2) return { phase: 'early', label: 'Early' };

  const recent = history.I.slice(-5);
  const prev = history.I.slice(-10, -5);
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const prevAvg = prev.length ? prev.reduce((a, b) => a + b, 0) / prev.length : recentAvg;
  const maxI = Math.max(...history.I);
  const currentI = history.I[len - 1];

  if (day < 30) return { phase: 'early', label: 'Early' };
  if (recentAvg > prevAvg * 1.02) return { phase: 'growing', label: 'Growing' };
  if (currentI >= maxI * 0.95) return { phase: 'peak', label: 'Peak' };
  return { phase: 'stable', label: 'Stable' };
}

export function runFullSimulation(params, maxDay = 365) {
  let state = initState(params);
  let history = initHistory(state);
  for (let d = 0; d < maxDay; d++) {
    if (state.I === 0) break;
    state = stochasticStep(state, params);
    history = appendHistory(history, state);
  }
  return history;
}

export function runMultipleSimulations(params, nRuns = 10, maxDay = 365) {
  const runs = [];
  for (let r = 0; r < nRuns; r++) {
    runs.push(runFullSimulation(params, maxDay));
  }

  const maxLen = Math.max(...runs.map((h) => h.I.length));
  const stats = { mean: [], lower: [], upper: [] };

  for (let d = 0; d < maxLen; d++) {
    const values = runs.map((h) => (d < h.I.length ? h.I[d] : 0));
    values.sort((a, b) => a - b);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const p10 = values[Math.floor(values.length * 0.1)] ?? 0;
    const p90 = values[Math.ceil(values.length * 0.9) - 1] ?? 0;
    stats.mean.push(mean);
    stats.lower.push(p10);
    stats.upper.push(p90);
  }

  return { runs, stats, nRuns };
}

export function parameterSweep(params, sweepKey, sweepMin, sweepMax, steps = 20) {
  const results = [];
  for (let i = 0; i <= steps; i++) {
    const val = sweepMin + (sweepMax - sweepMin) * (i / steps);
    const swept = { ...params, [sweepKey]: val };
    const r0 = computeR0(swept);
    const history = runFullSimulation(swept, 365);
    const peakI = Math.max(...history.I);
    const totalInfected = swept.N - history.S[history.S.length - 1];
    results.push({ value: val, r0, peakI, totalInfected });
  }
  return results;
}
