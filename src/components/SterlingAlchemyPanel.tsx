import React, { useState } from 'react';
import { ArrowRight, PoundSterling, Search, Trash2 } from 'lucide-react';
import {
  RedLevel,
  SterlingEntry,
  formatSterling,
  morphPhraseToSterling,
  transmuteToSterling,
} from '../utils/engine';

interface SterlingAlchemyPanelProps {
  redLevel: RedLevel;
  poundMorph: boolean;
  ledger: SterlingEntry[];
  totalSterlingGbp: number;
  onTogglePoundMorph: () => void;
  onDepositTransmutation: (label: string, amountGbp: number, minutesSaved: number) => void;
  onClearLedger: () => void;
}

export const SterlingAlchemyPanel: React.FC<SterlingAlchemyPanelProps> = ({
  redLevel,
  poundMorph,
  ledger,
  totalSterlingGbp,
  onTogglePoundMorph,
  onDepositTransmutation,
  onClearLedger,
}) => {
  const [minutesReclaimed, setMinutesReclaimed] = useState<number>(30);
  const [hourlyRateGbp, setHourlyRateGbp] = useState<number>(36);
  const [impulseSkippedGbp, setImpulseSkippedGbp] = useState<number>(12);
  const [customNote, setCustomNote] = useState<string>(
    'Reclaimed deep-focus block & skipped impulse takeaway'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  const transmutation = transmuteToSterling(
    minutesReclaimed,
    hourlyRateGbp,
    impulseSkippedGbp,
    redLevel
  );

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transmutation.instantTotalGbp <= 0) return;
    const cleanLabel = customNote.trim() || 'Sterling Time & Habit Transmutation';
    onDepositTransmutation(cleanLabel, transmutation.instantTotalGbp, minutesReclaimed);
  };

  const filteredLedger = ledger.filter((entry) =>
    entry.label.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const isRed = redLevel > 0;

  return (
    <section
      id="section-sterling"
      aria-labelledby="heading-sterling-pillar"
      className={`rounded-xl border p-6 transition-colors duration-150 ${
        isRed
          ? 'bg-red-950/90 border-red-700 text-red-50'
          : 'bg-white border-stone-200 text-stone-900'
      }`}
    >
      {/* Top Header */}
      <div
        className={`flex flex-wrap items-center justify-between gap-4 border-b pb-4 mb-6 ${
          isRed ? 'border-red-800/80' : 'border-stone-200'
        }`}
      >
        <div>
          <p
            className={`text-xs font-mono tracking-tight ${
              isRed ? 'text-red-300' : 'text-red-700'
            }`}
          >
            02 · PILLAR TWO · BRITISH STERLING (£) TRANSMUTATION
          </p>
          <h2
            id="heading-sterling-pillar"
            className="text-xl font-bold tracking-tight mt-0.5 font-display"
          >
            {morphPhraseToSterling('2. Becomes £ (Sterling Alchemy Engine)', poundMorph)}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onTogglePoundMorph}
            aria-pressed={poundMorph}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              poundMorph
                ? 'bg-amber-400 text-stone-950 border-amber-300'
                : isRed
                ? 'bg-white text-red-950 border-white hover:bg-red-100'
                : 'bg-stone-100 text-stone-800 border-stone-300 hover:bg-stone-200'
            }`}
          >
            <PoundSterling className="w-3.5 h-3.5" />
            {poundMorph ? '£ Symbol Morph: ON (£££)' : 'Become £ (Morph UI Into £)'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 6 cols: Interactive £ Transmuter Calculator */}
        <form onSubmit={handleDeposit} className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-semibold ${isRed ? 'text-white' : 'text-stone-900'}`}>
              Convert Reclaimed Time &amp; Cut Friction Into £
            </h3>
            <span
              className={`text-xs font-mono tabular-nums ${
                isRed ? 'text-red-200' : 'text-red-700'
              }`}
            >
              Red Boost: {isRed ? 'ACTIVE' : '1.00x'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="input-minutes-reclaimed"
                className={`block text-xs mb-1 ${isRed ? 'text-red-200' : 'text-stone-600'}`}
              >
                Minutes Reclaimed
              </label>
              <input
                id="input-minutes-reclaimed"
                type="number"
                min="0"
                max="600"
                value={minutesReclaimed}
                onChange={(e) => setMinutesReclaimed(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono text-stone-900 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 tabular-nums"
              />
            </div>

            <div>
              <label
                htmlFor="input-hourly-rate"
                className={`block text-xs mb-1 ${isRed ? 'text-red-200' : 'text-stone-600'}`}
              >
                Your Time Value (£/hr)
              </label>
              <input
                id="input-hourly-rate"
                type="number"
                min="1"
                max="1000"
                value={hourlyRateGbp}
                onChange={(e) => setHourlyRateGbp(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono text-stone-900 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 tabular-nums"
              />
            </div>

            <div>
              <label
                htmlFor="input-impulse-skipped"
                className={`block text-xs mb-1 ${isRed ? 'text-red-200' : 'text-stone-600'}`}
              >
                Impulse Spend Cut (£)
              </label>
              <input
                id="input-impulse-skipped"
                type="number"
                min="0"
                max="5000"
                step="0.50"
                value={impulseSkippedGbp}
                onChange={(e) => setImpulseSkippedGbp(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono text-stone-900 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 tabular-nums"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="input-transmute-note"
              className={`block text-xs mb-1 ${isRed ? 'text-red-200' : 'text-stone-600'}`}
            >
              Sterling Ledger Description
            </label>
            <input
              id="input-transmute-note"
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full px-3 py-2 text-xs text-stone-900 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          {/* Live £ Transmutation Output Summary */}
          <div
            className={`p-4 rounded-lg border space-y-3 ${
              isRed ? 'bg-red-900/50 border-red-700/80' : 'bg-stone-50 border-stone-200'
            }`}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className={`text-xs ${isRed ? 'text-red-200' : 'text-stone-600'}`}>
                Immediate Sterling (£) Yield
              </span>
              <span
                className={`text-2xl font-mono font-bold tabular-nums whitespace-nowrap ${
                  isRed ? 'text-white' : 'text-red-700'
                }`}
              >
                {formatSterling(transmutation.instantTotalGbp, poundMorph)}
              </span>
            </div>

            <div
              className={`flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums ${
                isRed ? 'text-red-200/90' : 'text-stone-500'
              }`}
            >
              <span>Time: {formatSterling(transmutation.timeValueGbp)}</span>
              <span aria-hidden="true">·</span>
              <span>Saved: {formatSterling(transmutation.impulseSavedGbp)}</span>
              <span aria-hidden="true">·</span>
              <span>Red Bonus: +{formatSterling(transmutation.redBonusGbp)}</span>
            </div>

            <div
              className={`pt-3 border-t grid grid-cols-3 gap-2 text-left ${
                isRed ? 'border-red-800' : 'border-stone-200'
              }`}
            >
              <div>
                <span className={`text-xs block ${isRed ? 'text-red-200' : 'text-stone-500'}`}>
                  1-Yr Weekly (7%)
                </span>
                <span className="text-xs font-mono font-semibold tabular-nums">
                  {formatSterling(transmutation.oneYearCompoundGbp)}
                </span>
              </div>
              <div>
                <span className={`text-xs block ${isRed ? 'text-red-200' : 'text-stone-500'}`}>
                  5-Yr Compound
                </span>
                <span className="text-xs font-mono font-semibold tabular-nums">
                  {formatSterling(transmutation.fiveYearCompoundGbp)}
                </span>
              </div>
              <div>
                <span className={`text-xs block ${isRed ? 'text-red-200' : 'text-stone-500'}`}>
                  10-Yr Sterling
                </span>
                <span
                  className={`text-xs font-mono font-semibold tabular-nums ${
                    isRed ? 'text-amber-300' : 'text-red-700'
                  }`}
                >
                  {formatSterling(transmutation.tenYearCompoundGbp)}
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-500 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>
              Mint &amp; Deposit {formatSterling(transmutation.instantTotalGbp)} Into £ Ledger
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Right 6 cols: Live Sterling (£) Vault Ledger */}
        <div id="section-ledger" className="lg:col-span-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className={`text-sm font-semibold ${isRed ? 'text-white' : 'text-stone-900'}`}>
                Live Sterling (£) Vault Ledger
              </h3>
              <p
                className={`text-xs font-mono tabular-nums ${
                  isRed ? 'text-red-200' : 'text-stone-500'
                }`}
              >
                Cumulative Balance: {formatSterling(totalSterlingGbp, poundMorph)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  aria-label="Filter £ ledger entries"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter £ ledger..."
                  className="pl-8 pr-3 py-1.5 text-xs text-stone-900 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              {ledger.length > 0 && (
                <button
                  type="button"
                  onClick={onClearLedger}
                  aria-label="Reset £ ledger"
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isRed
                      ? 'border-red-700 text-red-200 hover:bg-red-900'
                      : 'border-stone-200 text-stone-600 hover:text-red-700 hover:bg-stone-50'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {filteredLedger.length === 0 ? (
            <div
              className={`p-8 text-center rounded-lg border border-dashed ${
                isRed
                  ? 'border-red-700 bg-red-900/30 text-red-100'
                  : 'border-stone-300 bg-stone-50 text-stone-700'
              }`}
            >
              <p className="text-sm font-medium mb-1">
                No Sterling (£) entries match the current view
              </p>
              <p className={`text-xs mb-3 ${isRed ? 'text-red-200' : 'text-stone-500'}`}>
                Complete a life-improving habit or click &ldquo;Mint &amp; Deposit&rdquo; to
                populate your £ vault.
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-1.5 text-xs font-medium bg-stone-900 text-white rounded-lg hover:bg-stone-800 cursor-pointer"
                >
                  Clear Search Filter
                </button>
              )}
            </div>
          ) : (
            <div
              className={`overflow-x-auto border rounded-lg ${
                isRed ? 'border-red-800/80' : 'border-stone-200'
              }`}
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr
                    className={`border-b text-xs ${
                      isRed
                        ? 'border-red-800 bg-red-900/60 text-red-200'
                        : 'border-stone-200 bg-stone-50 text-stone-500'
                    }`}
                  >
                    <th className="py-2.5 px-3 font-medium">Action / Transmutation</th>
                    <th className="py-2.5 px-3 font-medium whitespace-nowrap">Source</th>
                    <th className="py-2.5 px-3 font-medium text-right whitespace-nowrap">Time</th>
                    <th className="py-2.5 px-3 font-medium text-right whitespace-nowrap">
                      £ Value
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y text-xs ${
                    isRed ? 'divide-red-800/70' : 'divide-stone-200'
                  }`}
                >
                  {filteredLedger.map((entry) => (
                    <tr
                      key={entry.id}
                      className={`transition-colors ${
                        isRed ? 'hover:bg-red-900/40' : 'hover:bg-stone-50/90'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-medium">
                        {morphPhraseToSterling(entry.label, poundMorph)}
                      </td>
                      <td
                        className={`py-2.5 px-3 capitalize whitespace-nowrap ${
                          isRed ? 'text-red-200' : 'text-stone-500'
                        }`}
                      >
                        {entry.source}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-mono tabular-nums whitespace-nowrap ${
                          isRed ? 'text-red-200' : 'text-stone-600'
                        }`}
                      >
                        {entry.minutesSaved}m
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-mono font-semibold tabular-nums whitespace-nowrap ${
                          isRed ? 'text-amber-300' : 'text-red-700'
                        }`}
                      >
                        +{formatSterling(entry.amountGbp, poundMorph)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
