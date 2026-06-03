'use client';

import { useState } from 'react';
import { useSimulation } from '@/hooks/useSimulation';
import { computeR0, getPhase } from '@/lib/simulation';
import ControlSlider from '@/components/ControlSlider';
import MetricCard from '@/components/MetricCard';
import LineChart from '@/components/LineChart';
import PopulationCanvas from '@/components/PopulationCanvas';
import SensitivityPanel from '@/components/SensitivityPanel';

const COLORS = { S: '#3B8BD4', I: '#E24B4A', R: '#639922', D: '#888780' };

const TABS = [
  { id: 'simulasi', label: 'Simulasi' },
  { id: 'populasi', label: 'Populasi' },
  { id: 'sensitivitas', label: 'Sensitivitas' },
];

const PHASE_COLOR = {
  early: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  growing: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  peak: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  stable: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('simulasi');
  const { params, playState, state, history, play, pause, reset, updateParams } = useSimulation();

  const r0 = computeR0(params);
  const { phase, label: phaseLabel } = getPhase(history, state.day);
  const peakI = Math.max(...history.I);
  const total = state.S + state.I + state.R + state.D;

  const artRec =
    params.artCoverage < 0.3
      ? 'Tingkatkan cakupan ART untuk memperlambat penyebaran.'
      : params.artCoverage < 0.7
      ? 'Cakupan ART moderat. Pertimbangkan peningkatan lebih lanjut.'
      : 'Cakupan ART tinggi. Dampak positif terlihat pada parameter efektif.';

  return (
    <main className="bg-gray-50 dark:bg-gray-950 min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Simulasi Penyebaran HIV
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Model SIRD Stokastik dengan Efek ART
          </p>
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

        {/* Tab: Simulasi */}
        {activeTab === 'simulasi' && (
          <div className="flex flex-col gap-4">
            {/* Sliders */}
            <div className="grid grid-cols-2 gap-3">
              <ControlSlider
                label="Beta (β) — Laju Infeksi"
                min={0.01}
                max={1.0}
                step={0.01}
                value={params.beta}
                format={(v) => v.toFixed(2)}
                onChange={(v) => updateParams('beta', v)}
              />
              <ControlSlider
                label="Gamma (γ) — Laju Pemulihan"
                min={0.001}
                max={0.5}
                step={0.001}
                value={params.gamma}
                format={(v) => v.toFixed(3)}
                onChange={(v) => updateParams('gamma', v)}
              />
              <ControlSlider
                label="Delta (δ) — Laju Kematian"
                min={0.0}
                max={0.1}
                step={0.001}
                value={params.delta}
                format={(v) => v.toFixed(3)}
                onChange={(v) => updateParams('delta', v)}
              />
              <ControlSlider
                label="Ukuran Populasi (N)"
                min={100}
                max={5000}
                step={100}
                value={params.N}
                onChange={(v) => updateParams('N', v)}
              />
              <ControlSlider
                label="Infeksi Awal (I₀)"
                min={1}
                max={100}
                step={1}
                value={params.i0}
                onChange={(v) => updateParams('i0', v)}
              />
              <ControlSlider
                label="Cakupan ART (%)"
                min={0}
                max={1}
                step={0.01}
                value={params.artCoverage}
                format={(v) => `${(v * 100).toFixed(0)}%`}
                onChange={(v) => updateParams('artCoverage', v)}
              />
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 gap-3">
              <MetricCard label="Rentan (S)" value={state.S} color={COLORS.S} total={total} />
              <MetricCard label="Terinfeksi (I)" value={state.I} color={COLORS.I} total={total} />
              <MetricCard label="Pulih (R)" value={state.R} color={COLORS.R} total={total} />
              <MetricCard label="Meninggal (D)" value={state.D} color={COLORS.D} total={total} />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              {playState === 'playing' ? (
                <button
                  onClick={pause}
                  className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Jeda
                </button>
              ) : (
                <button
                  onClick={play}
                  disabled={playState === 'done'}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
                >
                  {playState === 'idle' ? 'Mulai' : playState === 'paused' ? 'Lanjut' : 'Selesai'}
                </button>
              )}
              <button
                onClick={reset}
                className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold rounded-lg transition-colors"
              >
                Reset
              </button>
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
                      {key === 'S' && 'Rentan'}
                      {key === 'I' && 'Terinfeksi'}
                      {key === 'R' && 'Pulih'}
                      {key === 'D' && 'Meninggal'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Insight Box */}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                  Wawasan Simulasi
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PHASE_COLOR[phase]}`}>
                  Fase: {phaseLabel}
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
                  <span className="font-medium">Hari:</span> {state.day} / 365
                </div>
                <div className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Puncak Kasus:</span>{' '}
                  {Math.round(peakI).toLocaleString('id-ID')}
                </div>
                <div className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">ART:</span>{' '}
                  {(params.artCoverage * 100).toFixed(0)}%
                </div>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{artRec}</p>
            </div>
          </div>
        )}

        {/* Tab: Populasi */}
        {activeTab === 'populasi' && (
          <div className="flex flex-col gap-4">
            <PopulationCanvas state={state} />
            <div className="flex flex-wrap gap-4 justify-center">
              {Object.entries(COLORS).map(([key, color]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full inline-block" style={{ backgroundColor: color }} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {key === 'S' && 'Rentan (S)'}
                    {key === 'I' && 'Terinfeksi (I)'}
                    {key === 'R' && 'Pulih (R)'}
                    {key === 'D' && 'Meninggal (D)'}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Menampilkan {Math.min(400, params.N)} titik yang mewakili populasi secara proporsional.
              Jalankan simulasi di tab Simulasi untuk melihat perubahan dinamis.
            </p>
          </div>
        )}

        {/* Tab: Sensitivitas */}
        {activeTab === 'sensitivitas' && (
          <SensitivityPanel params={params} history={history} />
        )}
      </div>
    </main>
  );
}
