/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  ActionCategory,
  INITIAL_LIFE_ACTIONS,
  INITIAL_STERLING_LEDGER,
  LifeAction,
  PublishEditionKey,
  RedLevel,
  SHARED_APP_BASE_URL,
  SterlingEntry,
  buildPublishedUrls,
  calculateLifeBettermentMetrics,
  formatSterling,
  getRedPalette,
  morphPhraseToSterling,
  nextRedLevel,
  parseUrlPublishState,
} from './utils/engine';
import { RedReactorCard } from './components/RedReactorCard';
import { LifeBettermentPanel } from './components/LifeBettermentPanel';
import { SterlingAlchemyPanel } from './components/SterlingAlchemyPanel';
import { PublishUrlBanner } from './components/PublishUrlBanner';

export default function App() {
  const initialUrlState =
    typeof window !== 'undefined'
      ? parseUrlPublishState(window.location.search)
      : { editionKey: 'excelents' as PublishEditionKey, customSlug: 'excelents' };

  const [editionKey, setEditionKey] = useState<PublishEditionKey>(initialUrlState.editionKey);
  const [customSlug, setCustomSlug] = useState<string>(initialUrlState.customSlug);
  const [redLevel, setRedLevel] = useState<RedLevel>(initialUrlState.redLevel ?? 0);
  const [poundMorph, setPoundMorph] = useState<boolean>(initialUrlState.poundMorph ?? false);
  const [actions, setActions] = useState<LifeAction[]>(INITIAL_LIFE_ACTIONS);
  const [ledger, setLedger] = useState<SterlingEntry[]>(INITIAL_STERLING_LEDGER);
  const [lastOperationMsg, setLastOperationMsg] = useState<string>(
    'System ready. Click 0 (Become Red), 1 (Make Life Better), or 2 (Become £).'
  );

  // Sync browser URL query string & document title whenever edition, redLevel, or poundMorph changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const bundle = buildPublishedUrls(
      editionKey,
      customSlug,
      redLevel,
      poundMorph,
      SHARED_APP_BASE_URL
    );
    try {
      window.history.replaceState(null, '', bundle.relativeQueryUrl);
      document.title = `RedSterling £ · ${bundle.cleanSlug.toUpperCase()} Edition (0 Red · 1 Better · 2 £)`;
    } catch {
      // Ignore history API restrictions if any
    }
  }, [editionKey, customSlug, redLevel, poundMorph]);

  const palette = getRedPalette(redLevel);
  const metrics = calculateLifeBettermentMetrics(actions, ledger, redLevel);

  const nowTimeLabel = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  // 0 - Becoming Red handler
  const handleBecomeRed = () => {
    const next = nextRedLevel(redLevel);
    setRedLevel(next);
    const nextInfo = getRedPalette(next);
    setLastOperationMsg(
      `0 · Red State updated to ${nextInfo.name} (${nextInfo.hexPrimary}, ${nextInfo.multiplier.toFixed(2)}x £ multiplier).`
    );
  };

  // 1 - Makes Your Life Better handler
  const handleMakeLifeBetterQuick = () => {
    const nextUnfinished = actions.find((a) => !a.completed);
    if (nextUnfinished) {
      handleToggleAction(nextUnfinished.id);
    } else {
      // If all are already completed, log a bonus daily betterment win
      const bonusEntry: SterlingEntry = {
        id: `led-${Date.now()}`,
        label: 'Bonus Daily Life Optimization Check-In',
        source: 'habit',
        amountGbp: 7.5,
        minutesSaved: 15,
        timestamp: nowTimeLabel(),
      };
      setLedger((prev) => [bonusEntry, ...prev]);
      setLastOperationMsg(
        '1 · All core habits complete! Added +£7.50 & 15m Bonus Life Optimization.'
      );
    }
  };

  // 2 - Becomes £ handler
  const handleBecomePound = () => {
    const nextMorph = !poundMorph;
    setPoundMorph(nextMorph);
    if (nextMorph) {
      const surgeAmount = Math.round(10 * palette.multiplier * 100) / 100;
      const newEntry: SterlingEntry = {
        id: `led-pound-${Date.now()}`,
        label: 'Pillar 2 · Instant Sterling (£) Transmutation Surge',
        source: 'transmute',
        amountGbp: surgeAmount,
        minutesSaved: 20,
        timestamp: nowTimeLabel(),
      };
      setLedger((prev) => [newEntry, ...prev]);
      setLastOperationMsg(
        `2 · £ Morph Activated! UI transfigured into £ and +${formatSterling(surgeAmount)} added to Vault.`
      );
    } else {
      setLastOperationMsg('2 · £ Symbol Morph returned to standard typography.');
    }
  };

  // Activate all 3 simultaneously (0 + 1 + 2)
  const handleActivateTriad = () => {
    const targetRed: RedLevel = redLevel === 0 ? 2 : redLevel;
    setRedLevel(targetRed);
    setPoundMorph(true);

    const unfinished = actions.find((a) => !a.completed);
    let habitGbp = 8.0;
    let habitLabel = 'Full Triad Activation (0 Red + 1 Better Life + 2 £)';
    let habitMins = 20;

    if (unfinished) {
      habitGbp = unfinished.gbpValue;
      habitLabel = unfinished.title;
      habitMins = unfinished.minutesSaved;
      setActions((prev) =>
        prev.map((a) =>
          a.id === unfinished.id
            ? { ...a, completed: true, completedCount: a.completedCount + 1 }
            : a
        )
      );
    }

    const entry: SterlingEntry = {
      id: `led-triad-${Date.now()}`,
      label: habitLabel,
      source: 'red-surge',
      amountGbp: habitGbp,
      minutesSaved: habitMins,
      timestamp: nowTimeLabel(),
    };
    setLedger((prev) => [entry, ...prev]);
    setLastOperationMsg(
      `Triad Engaged: Red Mode (#DC2626) + "${habitLabel}" completed + £${habitGbp.toFixed(2)} minted.`
    );
  };

  const handleToggleAction = (id: string) => {
    const target = actions.find((a) => a.id === id);
    if (!target) return;

    const willComplete = !target.completed;
    setActions((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: willComplete,
              completedCount: willComplete ? item.completedCount + 1 : item.completedCount,
            }
          : item
      )
    );

    if (willComplete) {
      const newEntry: SterlingEntry = {
        id: `led-act-${Date.now()}`,
        label: target.title,
        source: 'habit',
        amountGbp: target.gbpValue,
        minutesSaved: target.minutesSaved,
        timestamp: nowTimeLabel(),
      };
      setLedger((prev) => [newEntry, ...prev]);
      setLastOperationMsg(
        `1 · Completed "${target.title}" — Life Betterment improved & +${formatSterling(target.gbpValue)} added.`
      );
    } else {
      setLastOperationMsg(`1 · Unchecked "${target.title}".`);
    }
  };

  const handleAddAction = (
    title: string,
    category: ActionCategory,
    gbpValue: number,
    minutesSaved: number
  ) => {
    const newAction: LifeAction = {
      id: `act-${Date.now()}`,
      title,
      category,
      minutesSaved,
      gbpValue,
      benefitSummary: `Custom ${category} upgrade · saves ${minutesSaved}m and adds ${formatSterling(gbpValue)}`,
      completed: true,
      completedCount: 1,
    };
    setActions((prev) => [newAction, ...prev]);

    const newLedgerEntry: SterlingEntry = {
      id: `led-custom-${Date.now()}`,
      label: title,
      source: 'habit',
      amountGbp: gbpValue,
      minutesSaved,
      timestamp: nowTimeLabel(),
    };
    setLedger((prev) => [newLedgerEntry, ...prev]);
    setLastOperationMsg(
      `1 · Added & completed "${title}" (+${formatSterling(gbpValue)}, ${minutesSaved}m saved).`
    );
  };

  const handleClaimSprintReward = (bonusGbp: number, minutes: number, label: string) => {
    const newEntry: SterlingEntry = {
      id: `led-sprint-${Date.now()}`,
      label,
      source: 'red-surge',
      amountGbp: bonusGbp,
      minutesSaved: minutes,
      timestamp: nowTimeLabel(),
    };
    setLedger((prev) => [newEntry, ...prev]);
    setLastOperationMsg(
      `0 · Crimson Focus Surge complete: +${formatSterling(bonusGbp)} & ${minutes}m reclaimed.`
    );
  };

  const handleDepositTransmutation = (
    label: string,
    amountGbp: number,
    minutesSaved: number
  ) => {
    const newEntry: SterlingEntry = {
      id: `led-transmute-${Date.now()}`,
      label,
      source: 'transmute',
      amountGbp,
      minutesSaved,
      timestamp: nowTimeLabel(),
    };
    setLedger((prev) => [newEntry, ...prev]);
    setLastOperationMsg(
      `2 · Minted ${formatSterling(amountGbp)} from "${label}" into Sterling Vault.`
    );
  };

  const handleClearLedger = () => {
    setLedger([]);
    setLastOperationMsg('Sterling (£) Ledger reset to £0.00.');
  };

  return (
    <div
      data-red-level={redLevel}
      data-pound-morph={poundMorph}
      className={`min-h-screen transition-colors duration-150 ${
        palette.isRedActive
          ? redLevel === 3
            ? 'bg-red-900 text-white'
            : 'bg-red-600 text-white'
          : 'bg-stone-50 text-stone-900'
      }`}
    >
      {/* Top Navigation Bar — Strict 3-Zone Contract */}
      <header
        className={`flex items-center justify-between gap-8 px-6 py-4 border-b transition-colors duration-150 ${
          palette.isRedActive
            ? 'border-red-500/60 bg-red-950/90 text-white'
            : 'border-stone-200 bg-white text-stone-900'
        }`}
      >
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          className="text-lg font-bold tracking-tight font-display whitespace-nowrap shrink-0"
        >
          {poundMorph ? 'R£dSt£rling £' : 'RedSterling £'}
        </a>

        {/* Zone 2: 4 concise single-line navigation links */}
        <nav
          aria-label="Primary sections"
          className={`hidden md:flex items-center gap-6 text-sm font-medium ${
            palette.isRedActive ? 'text-red-100' : 'text-stone-600'
          }`}
        >
          <a
            href="#section-red"
            className="hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            0. Become Red
          </a>
          <a
            href="#section-better-life"
            className="hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            1. Better Life
          </a>
          <a
            href="#section-sterling"
            className="hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            2. Become £
          </a>
          <a
            href="#section-ledger"
            className="hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            £ Ledger
          </a>
          <a
            href="#section-publish"
            className="hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Publish URL
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleActivateTriad}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              palette.isRedActive
                ? 'bg-white text-red-900 hover:bg-red-100'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            Activate All (0 · 1 · 2)
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main id="top" className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Hero Stage: 2-Column Split */}
        <section
          aria-label="Triad Command Center"
          className={`rounded-2xl border p-6 lg:p-8 transition-colors duration-150 ${
            palette.isRedActive
              ? 'bg-red-950/95 border-red-400/50 text-white'
              : 'bg-white border-stone-200 text-stone-900'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left 7 Cols: Headline & Direct 0 / 1 / 2 Triggers */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div
                  className={`flex items-center gap-2 text-xs font-mono ${
                    palette.isRedActive ? 'text-red-300' : 'text-red-700'
                  }`}
                >
                  <span>ZERO-LATENCY TRIAD ENGINE</span>
                  <span aria-hidden="true">·</span>
                  <span>0 RED</span>
                  <span aria-hidden="true">·</span>
                  <span>1 BETTER LIFE</span>
                  <span aria-hidden="true">·</span>
                  <span>2 STERLING £</span>
                </div>

                <h1
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display leading-tight"
                  style={{ textWrap: 'balance' }}
                >
                  {morphPhraseToSterling(
                    'Turn Crimson. Make Your Life Better. Transmute Into £.',
                    poundMorph
                  )}
                </h1>

                <p
                  className={`text-base leading-relaxed max-w-2xl ${
                    palette.isRedActive ? 'text-red-100/90' : 'text-stone-600'
                  }`}
                >
                  {morphPhraseToSterling(
                    'Engineered for instant state changes: shift the entire workspace into high-focus Crimson Red (0), execute daily friction-cutting upgrades that measurably improve your life (1), and convert every saved minute and skipped impulse into British Pounds £ (2).',
                    poundMorph
                  )}
                </p>
              </div>

              {/* The 3 Primary Triad Controls */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={handleBecomeRed}
                    className={`px-4 py-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                      palette.isRedActive
                        ? 'bg-red-600 border-red-300 text-white shadow-sm'
                        : 'bg-red-600 border-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    <span className="block text-xs font-mono opacity-85 whitespace-nowrap">
                      ACTION 0
                    </span>
                    <span className="block text-sm font-bold mt-0.5 whitespace-nowrap">
                      {palette.isRedActive ? '0. Red Active (Boost)' : '0. Become Red'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleMakeLifeBetterQuick}
                    className={`px-4 py-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                      palette.isRedActive
                        ? 'bg-red-900/80 border-red-600 text-white hover:bg-red-800'
                        : 'bg-stone-900 border-stone-900 text-white hover:bg-stone-800'
                    }`}
                  >
                    <span className="block text-xs font-mono opacity-75 whitespace-nowrap">
                      ACTION 1
                    </span>
                    <span className="block text-sm font-bold mt-0.5 whitespace-nowrap">
                      1. Make Life Better
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBecomePound}
                    className={`px-4 py-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                      poundMorph
                        ? 'bg-amber-400 border-amber-300 text-stone-950'
                        : palette.isRedActive
                        ? 'bg-white border-white text-red-950 hover:bg-red-50'
                        : 'bg-stone-100 border-stone-300 text-stone-900 hover:bg-stone-200'
                    }`}
                  >
                    <span className="block text-xs font-mono opacity-75 whitespace-nowrap">
                      ACTION 2
                    </span>
                    <span className="block text-sm font-bold mt-0.5 whitespace-nowrap">
                      {poundMorph ? '2. £ Mode Active (£££)' : '2. Become £'}
                    </span>
                  </button>
                </div>

                {/* Live Feedback Readout */}
                <p
                  aria-live="polite"
                  className={`text-xs font-mono ${
                    palette.isRedActive ? 'text-red-200' : 'text-stone-500'
                  }`}
                >
                  Last execution: {lastOperationMsg}
                </p>
              </div>
            </div>

            {/* Right 5 Cols: Live Triad Telemetry Display Card */}
            <div
              className={`lg:col-span-5 rounded-xl border p-6 flex flex-col justify-between ${
                palette.isRedActive
                  ? 'bg-red-900/70 border-red-500/60 text-white'
                  : 'bg-stone-900 border-stone-800 text-white'
              }`}
            >
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <span className="text-xs font-mono text-red-300">
                  LIVE STERLING &amp; RED STATE
                </span>
                <span className="text-xs font-mono tabular-nums text-stone-300">
                  {palette.name}
                </span>
              </div>

              <div className="my-6 space-y-2">
                <span className="text-xs text-stone-300 block">
                  Total Value Transmuted Into British Pounds (£)
                </span>
                <div
                  data-testid="hero-sterling-total"
                  className="text-4xl sm:text-5xl font-mono font-bold tracking-tight tabular-nums text-white"
                >
                  {formatSterling(metrics.ledgerGbpTotal, poundMorph)}
                </div>
                <p className="text-xs text-red-200 font-mono tabular-nums">
                  10-Yr Weekly Compounded Value: {formatSterling(metrics.compoundedTenYearGbp)}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/15 text-xs">
                <div>
                  <span className="text-stone-300 block">0 · Red State</span>
                  <span className="font-mono font-bold text-sm tabular-nums">
                    {palette.isRedActive ? `${palette.hexPrimary}` : 'Standby'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-300 block">1 · Life Score</span>
                  <span className="font-mono font-bold text-sm tabular-nums">
                    {metrics.wellbeingScore}/100
                  </span>
                </div>
                <div>
                  <span className="text-stone-300 block">2 · Time Saved</span>
                  <span className="font-mono font-bold text-sm tabular-nums">
                    {metrics.totalMinutesSaved} mins
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Full-width 4-Column KPI Strip Below Hero Split */}
          <div
            className={`mt-8 pt-6 border-t grid grid-cols-2 lg:grid-cols-4 gap-6 ${
              palette.isRedActive ? 'border-red-800' : 'border-stone-200'
            }`}
          >
            <div>
              <span
                className={`text-xs block ${
                  palette.isRedActive ? 'text-red-200' : 'text-stone-500'
                }`}
              >
                0 · Red Chromatic Multiplier
              </span>
              <span className="text-xl font-mono font-bold tabular-nums mt-0.5 block">
                {palette.multiplier.toFixed(2)}x · {palette.wavelengthNm}nm
              </span>
            </div>

            <div>
              <span
                className={`text-xs block ${
                  palette.isRedActive ? 'text-red-200' : 'text-stone-500'
                }`}
              >
                1 · Daily Upgrades Completed
              </span>
              <span className="text-xl font-mono font-bold tabular-nums mt-0.5 block">
                {metrics.completedCount} / {metrics.totalCount} ({metrics.completionRate}%)
              </span>
            </div>

            <div>
              <span
                className={`text-xs block ${
                  palette.isRedActive ? 'text-red-200' : 'text-stone-500'
                }`}
              >
                1 · Reclaimed Deep-Focus Time
              </span>
              <span className="text-xl font-mono font-bold tabular-nums mt-0.5 block">
                {metrics.totalMinutesSaved} minutes
              </span>
            </div>

            <div>
              <span
                className={`text-xs block ${
                  palette.isRedActive ? 'text-red-200' : 'text-stone-500'
                }`}
              >
                2 · Active Sterling (£) Vault
              </span>
              <span className="text-xl font-mono font-bold tabular-nums mt-0.5 block">
                {formatSterling(metrics.ledgerGbpTotal, poundMorph)}
              </span>
            </div>
          </div>
        </section>

        {/* Live Publication & Permalink Gateway: Excelents & Magitarious */}
        <PublishUrlBanner
          editionKey={editionKey}
          customSlug={customSlug}
          redLevel={redLevel}
          poundMorph={poundMorph}
          onSelectEdition={(key, slug) => {
            setEditionKey(key);
            if (slug) setCustomSlug(slug);
            const activeSlug = key === 'custom' ? slug || customSlug : key;
            setLastOperationMsg(
              `Published URL switched to https://${activeSlug}.uk/0-red-1-better-2-pound`
            );
          }}
          onPublishSync={(vanityUrl, liveUrl) => {
            setLastOperationMsg(`Published & synced: ${vanityUrl} (${liveUrl})`);
          }}
        />

        {/* 2-Column Interactive Workspace: Pillar 0 (Becoming Red) + Pillar 1 (Makes Life Better) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-5 flex">
            <div className="w-full flex">
              <RedReactorCard
                redLevel={redLevel}
                poundMorph={poundMorph}
                onSelectRedLevel={(lvl) => {
                  setRedLevel(lvl);
                  const info = getRedPalette(lvl);
                  setLastOperationMsg(`0 · Selected ${info.name} (${info.hexPrimary}).`);
                }}
                onTriggerBecomeRed={handleBecomeRed}
                onClaimSprintReward={handleClaimSprintReward}
              />
            </div>
          </div>

          <div className="lg:col-span-7 flex">
            <div className="w-full flex">
              <LifeBettermentPanel
                actions={actions}
                ledger={ledger}
                redLevel={redLevel}
                poundMorph={poundMorph}
                wellbeingScore={metrics.wellbeingScore}
                onToggleAction={handleToggleAction}
                onAddAction={handleAddAction}
                onCompleteNextUnfinished={handleMakeLifeBetterQuick}
              />
            </div>
          </div>
        </div>

        {/* Full-Width Interactive Workspace: Pillar 2 (Becomes £) & Live Ledger */}
        <SterlingAlchemyPanel
          redLevel={redLevel}
          poundMorph={poundMorph}
          ledger={ledger}
          totalSterlingGbp={metrics.ledgerGbpTotal}
          onTogglePoundMorph={handleBecomePound}
          onDepositTransmutation={handleDepositTransmutation}
          onClearLedger={handleClearLedger}
        />
      </main>

      {/* Clean Minimal Footer */}
      <footer
        className={`border-t py-6 px-6 text-xs transition-colors duration-150 ${
          palette.isRedActive
            ? 'border-red-500/40 bg-red-950/90 text-red-200'
            : 'border-stone-200 bg-white text-stone-500'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <span>RedSterling £ — Built for 0 (Red), 1 (Better Life), and 2 (£).</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setRedLevel(0);
                setPoundMorph(false);
                setActions(INITIAL_LIFE_ACTIONS);
                setLedger(INITIAL_STERLING_LEDGER);
                setLastOperationMsg('Workspace restored to default initial state.');
              }}
              className="underline underline-offset-4 hover:opacity-80 cursor-pointer"
            >
              Restore Default Workspace
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
