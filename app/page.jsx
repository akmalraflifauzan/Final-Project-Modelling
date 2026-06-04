'use client';

import { useState } from 'react';
import { useSimulation } from '@/hooks/useSimulation';
import { computeR0, getPhase, PRESETS } from '@/lib/simulation';
import ControlSlider from '@/components/ControlSlider';
import MetricCard from '@/components/MetricCard';
import LineChart from '@/components/LineChart';
import PopulationCanvas from '@/components/PopulationCanvas';
import SensitivityPanel from '@/components/SensitivityPanel';
import MultiRunChart from '@/components/MultiRunChart';

const COLORS = { S: '#3B8BD4', I: '#E24B4A', R: '#639922', D: '#888780' };

const TABS = [
  { id: 'simulation', label: 'Simulation' },
  { id: 'population', label: 'Population' },
  { id: 'multirun', label: 'Multi-Run' },
  { id: 'sensitivity', label: 'Sensitivity' },
];

const PHASE_COLOR = {
  early: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  growing: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  peak: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  stable: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
};

const SPEED_LABELS = { 1: 'Slow', 2: 'Steady', 3: 'Normal', 4: 'Fast', 5: 'Turbo' };

export default function Home() {
  const [activeTab, setActiveTab] = useState('simulation');
  const { params, playState, state, history, speed, play, pause, reset, updateParams, applyPreset, updateSpeed } =
    useSimulation();

  const r0 = computeR0(params);
  const { phase, label: phaseLabel } = getPhase(history, state.day);
  const peakI = Math.max(...history.I);
  const total = state.S + state.I + state.R + state.D;

  const artRec =
    params.artCoverage < 0.3
      ? 'Increase ART coverage to slow down transmission.'
      : params.artCoverage < 0.7
      ? 'Moderate ART coverage. Consider increasing further.'
      : 'High ART coverage. Positive impact visible on effective parameters.';

  return (
    <main className="bg-gray-50 dark:bg-gray-950 min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            HIV Spread Simulation
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Stochastic SIRD Model with ART &amp; Prevention Effects
          </p>
        </div>

        {/* Preset Scenarios */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Preset Scenarios
          </span>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => applyPreset(preset.values)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={preset.desc}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 px-4 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Simulation */}
        <div style={{ display: activeTab === 'simulation' ? 'flex' : 'none' }} className="flex-col gap-4">
          {/* Sliders */}
          <div className="grid grid-cols-2 gap-3">
            <ControlSlider
              label="Beta (β) — Infection Rate"
              min={0.01}
              max={1.0}
              step={0.01}
              value={params.beta}
              format={(v) => v.toFixed(2)}
              onChange={(v) => updateParams('beta', v)}
            />
            <ControlSlider
              label="Gamma (γ) — Recovery Rate"
              min={0.001}
              max={0.5}
              step={0.001}
              value={params.gamma}
              format={(v) => v.toFixed(3)}
              onChange={(v) => updateParams('gamma', v)}
            />
            <ControlSlider
              label="Delta (δ) — Mortality Rate"
              min={0.0}
              max={0.1}
              step={0.001}
              value={params.delta}
              format={(v) => v.toFixed(3)}
              onChange={(v) => updateParams('delta', v)}
            />
            <ControlSlider
              label="Population Size (N)"
              min={100}
              max={5000}
              step={100}
              value={params.N}
              onChange={(v) => updateParams('N', v)}
            />
            <ControlSlider
              label="Initial Infected (I₀)"
              min={1}
              max={100}
              step={1}
              value={params.i0}
              onChange={(v) => updateParams('i0', v)}
            />
            <ControlSlider
              label="ART Coverage (%)"
              min={0}
              max={1}
              step={0.01}
              value={params.artCoverage}
              format={(v) => `${(v * 100).toFixed(0)}%`}
              onChange={(v) => updateParams('artCoverage', v)}
            />
            <ControlSlider
              label="Protection Rate (%)"
              min={0}
              max={1}
              step={0.01}
              value={params.protectionRate}
              format={(v) => `${(v * 100).toFixed(0)}%`}
              onChange={(v) => updateParams('protectionRate', v)}
            />
            <ControlSlider
              label="Testing Rate (%)"
              min={0}
              max={1}
              step={0.01}
              value={params.testingRate}
              format={(v) => `${(v * 100).toFixed(0)}%`}
              onChange={(v) => updateParams('testingRate', v)}
            />
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="Susceptible (S)" value={state.S} color={COLORS.S} total={total} />
            <MetricCard label="Infected (I)" value={state.I} color={COLORS.I} total={total} />
            <MetricCard label="Recovered (R)" value={state.R} color={COLORS.R} total={total} />
            <MetricCard label="Deceased (D)" value={state.D} color={COLORS.D} total={total} />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {playState === 'playing' ? (
              <button
                onClick={pause}
                className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors"
              >
                Pause
              </button>
            ) : (
              <button
                onClick={play}
                disabled={playState === 'done'}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
              >
                {playState === 'idle' ? 'Start' : playState === 'paused' ? 'Resume' : 'Done'}
              </button>
            )}
            <button
              onClick={reset}
              className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold rounded-lg transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Speed Slider */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Speed
              </span>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                {speed} — {SPEED_LABELS[speed]}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={speed}
              onChange={(e) => updateSpeed(parseInt(e.target.value))}
              className="w-full accent-gray-700 dark:accent-gray-300 h-2 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Slow</span>
              <span>Turbo</span>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
            <LineChart history={history} />
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-2 justify-center">
              {Object.entries(COLORS).map(([key, color]) => (
                <div key={key} className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color }} />
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {key === 'S' && 'Susceptible'}
                    {key === 'I' && 'Infected'}
                    {key === 'R' && 'Recovered'}
                    {key === 'D' && 'Deceased'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Insight Box */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                Simulation Insights
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PHASE_COLOR[phase]}`}>
                Phase: {phaseLabel}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">R₀:</span>{' '}
                <span className={r0 >= 1 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                  {r0.toFixed(2)}
                </span>
              </div>
              <div className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Day:</span> {state.day} / 365
              </div>
              <div className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Peak Cases:</span>{' '}
                {Math.round(peakI).toLocaleString('en-US')}
              </div>
              <div className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">ART:</span>{' '}
                {(params.artCoverage * 100).toFixed(0)}%
              </div>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{artRec}</p>
          </div>
        </div>

        {/* Tab: Population — always mounted, hidden with CSS */}
        <div style={{ display: activeTab === 'population' ? 'flex' : 'none' }} className="flex-col gap-4">
          <PopulationCanvas state={state} params={params} />
          <div className="flex flex-wrap gap-4 justify-center">
            {Object.entries(COLORS).map(([key]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xl">
                  {key === 'S' && '🤧'}
                  {key === 'I' && '🤢'}
                  {key === 'R' && '☺️'}
                  {key === 'D' && '💀'}
                </span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {key === 'S' && 'Susceptible (S)'}
                  {key === 'I' && 'Infected (I)'}
                  {key === 'R' && 'Recovered (R)'}
                  {key === 'D' && 'Deceased (D)'}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Showing {Math.min(400, params.N)} emojis representing the population proportionally.
            Press Start in the Simulation tab to watch the spread in real time.
          </p>
        </div>

        {/* Tab: Multi-Run — always mounted, hidden with CSS */}
        <div style={{ display: activeTab === 'multirun' ? 'flex' : 'none' }} className="flex-col gap-4">
          <MultiRunChart params={params} />
        </div>

        {/* Tab: Sensitivity */}
        {activeTab === 'sensitivity' && (
          <SensitivityPanel params={params} history={history} />
        )}
      </div>
    </main>
  );
}
