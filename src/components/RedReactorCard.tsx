import React, { useEffect, useState } from 'react';
import { Flame, Play, RotateCcw, Zap } from 'lucide-react';
import {
  RedLevel,
  getRedPalette,
  formatSterling,
  morphPhraseToSterling,
} from '../utils/engine';

interface RedReactorCardProps {
  redLevel: RedLevel;
  poundMorph: boolean;
  onSelectRedLevel: (level: RedLevel) => void;
  onTriggerBecomeRed: () => void;
  onClaimSprintReward: (bonusGbp: number, minutes: number, label: string) => void;
}

const LEVELS: RedLevel[] = [0, 1, 2, 3];

export const RedReactorCard: React.FC<RedReactorCardProps> = ({
  redLevel,
  poundMorph,
  onSelectRedLevel,
  onTriggerBecomeRed,
  onClaimSprintReward,
}) => {
  const palette = getRedPalette(redLevel);
  const [sprintSeconds, setSprintSeconds] = useState<number>(90);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sprintCount, setSprintCount] = useState<number>(0);

  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setInterval(() => {
      setSprintSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 90;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRunning]);

  const handleToggleTimer = () => {
    if (redLevel === 0) {
      onSelectRedLevel(2);
    }
    setIsRunning((prev) => !prev);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setSprintSeconds(90);
  };

  const handleCompleteInstantSprint = () => {
    const activeLevel: RedLevel = redLevel === 0 ? 2 : redLevel;
    if (redLevel === 0) {
      onSelectRedLevel(2);
    }
    const activePalette = getRedPalette(activeLevel);
    const rewardGbp = Math.round(5.0 * activePalette.multiplier * 100) / 100;
    setSprintCount((c) => c + 1);
    setIsRunning(false);
    setSprintSeconds(90);
    onClaimSprintReward(
      rewardGbp,
      15,
      `Crimson 90s Focus Surge (${activePalette.multiplier.toFixed(2)}x Red Boost)`
    );
  };

  const mins = Math.floor(sprintSeconds / 60);
  const secs = sprintSeconds % 60;
  const formattedClock = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <section
      id="section-red"
      aria-labelledby="heading-red-pillar"
      className={`rounded-xl border transition-colors duration-150 p-6 flex flex-col justify-between ${
        palette.isRedActive
          ? 'bg-red-950/90 border-red-700 text-red-50'
          : 'bg-white border-stone-200 text-stone-900'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-4 border-b pb-4 mb-5 border-current/10">
          <div>
            <p
              className={`text-xs font-mono tracking-tight ${
                palette.isRedActive ? 'text-red-300' : 'text-red-700'
              }`}
            >
              00 · PILLAR ZERO · CHROMATIC VELOCITY
            </p>
            <h2
              id="heading-red-pillar"
              className="text-xl font-bold tracking-tight mt-0.5 font-display"
            >
              {morphPhraseToSterling('0. Becoming Red', poundMorph)}
            </h2>
          </div>

          <button
            type="button"
            onClick={onTriggerBecomeRed}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-transform active:scale-95 whitespace-nowrap shrink-0 cursor-pointer ${
              palette.isRedActive
                ? 'bg-white text-red-900 hover:bg-red-100'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {palette.isRedActive ? 'Cycle Red Intensity' : 'Ignite Red Now'}
          </button>
        </div>

        <p
          className={`text-sm leading-relaxed mb-5 ${
            palette.isRedActive ? 'text-red-100/90' : 'text-stone-600'
          }`}
        >
          {palette.description}
        </p>

        {/* 4-Stage Red Spectrum Selector */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className={palette.isRedActive ? 'text-red-200' : 'text-stone-500'}>
              Crimson Saturation Level
            </span>
            <span className="font-mono font-semibold tabular-nums">
              {palette.hexPrimary} · {palette.wavelengthNm}nm · {palette.multiplier.toFixed(2)}x £
            </span>
          </div>

          <div
            role="group"
            aria-label="Crimson saturation selector"
            className={`grid grid-cols-4 gap-1.5 p-1 rounded-lg ${
              palette.isRedActive ? 'bg-red-900/70' : 'bg-stone-100'
            }`}
          >
            {LEVELS.map((lvl) => {
              const info = getRedPalette(lvl);
              const selected = redLevel === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onSelectRedLevel(lvl)}
                  aria-pressed={selected}
                  className={`py-2 px-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selected
                      ? 'bg-red-600 text-white shadow-xs'
                      : palette.isRedActive
                      ? 'text-red-200 hover:bg-red-800/60'
                      : 'text-stone-700 hover:bg-stone-200/70'
                  }`}
                >
                  L{lvl} · {info.multiplier}x
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Crimson 90-Second Action Reactor */}
      <div
        className={`rounded-lg p-4 border ${
          palette.isRedActive
            ? 'bg-red-900/50 border-red-700/80'
            : 'bg-stone-50 border-stone-200'
        }`}
      >
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <span
              className={`text-xs font-medium block ${
                palette.isRedActive ? 'text-red-200' : 'text-stone-500'
              }`}
            >
              90-Second Crimson Micro-Sprint
            </span>
            <span className="text-2xl font-mono font-bold tabular-nums tracking-tight">
              {formattedClock}
            </span>
          </div>
          <div className="text-right">
            <span
              className={`text-xs block ${
                palette.isRedActive ? 'text-red-200' : 'text-stone-500'
              }`}
            >
              Sprint Yield ({palette.multiplier.toFixed(2)}x)
            </span>
            <span className="text-sm font-mono font-semibold tabular-nums">
              +{formatSterling(5 * palette.multiplier, poundMorph)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleToggleTimer}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              palette.isRedActive
                ? 'bg-red-500 text-white hover:bg-red-400'
                : 'bg-stone-900 text-white hover:bg-stone-800'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            {isRunning ? 'Pause Red Sprint' : 'Start Red Sprint'}
          </button>

          <button
            type="button"
            onClick={handleCompleteInstantSprint}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              palette.isRedActive
                ? 'border-red-400 text-red-50 hover:bg-red-800/60'
                : 'border-red-600 text-red-700 hover:bg-red-50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Instant Red Surge (+{formatSterling(5 * (redLevel === 0 ? 1.5 : palette.multiplier))})
          </button>

          <button
            type="button"
            onClick={handleResetTimer}
            aria-label="Reset sprint timer"
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              palette.isRedActive
                ? 'border-red-700 text-red-200 hover:bg-red-800'
                : 'border-stone-200 text-stone-600 hover:bg-stone-200/60'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div
          className={`mt-3 pt-2.5 border-t flex items-center justify-between text-xs ${
            palette.isRedActive
              ? 'border-red-800/80 text-red-200'
              : 'border-stone-200 text-stone-500'
          }`}
        >
          <span className="inline-flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" />
            Red State: {palette.isRedActive ? 'ACTIVE' : 'STANDBY'}
          </span>
          <span className="font-mono tabular-nums">
            Surges completed: {sprintCount}
          </span>
        </div>
      </div>
    </section>
  );
};
