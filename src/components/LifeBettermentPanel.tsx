import React, { useState } from 'react';
import { Check, Plus, Sparkles } from 'lucide-react';
import {
  ActionCategory,
  LifeAction,
  RedLevel,
  SterlingEntry,
  formatSterling,
  morphPhraseToSterling,
  validateNewAction,
} from '../utils/engine';
import { SterlingGrowthChart } from './SterlingGrowthChart';

interface LifeBettermentPanelProps {
  actions: LifeAction[];
  ledger: SterlingEntry[];
  redLevel: RedLevel;
  poundMorph: boolean;
  wellbeingScore: number;
  onToggleAction: (id: string) => void;
  onAddAction: (title: string, category: ActionCategory, gbpValue: number, minutesSaved: number) => void;
  onCompleteNextUnfinished: () => void;
}

export const LifeBettermentPanel: React.FC<LifeBettermentPanelProps> = ({
  actions,
  ledger,
  redLevel,
  poundMorph,
  wellbeingScore,
  onToggleAction,
  onAddAction,
  onCompleteNextUnfinished,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'all' | ActionCategory>('all');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<ActionCategory>('health');
  const [newGbp, setNewGbp] = useState<string>('6.50');
  const [newMinutes, setNewMinutes] = useState<string>('20');
  const [formError, setFormError] = useState<string | null>(null);

  const isRed = redLevel > 0;

  const filteredActions = actions.filter((item) =>
    categoryFilter === 'all' ? true : item.category === categoryFilter
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateNewAction(newTitle, newGbp, newMinutes);
    if (!validation.valid) {
      setFormError(validation.error || 'Invalid action input.');
      return;
    }
    setFormError(null);
    onAddAction(
      validation.parsedTitle!,
      newCategory,
      validation.parsedGbp!,
      validation.parsedMinutes!
    );
    setNewTitle('');
  };

  return (
    <section
      id="section-better-life"
      aria-labelledby="heading-better-life"
      className={`rounded-xl border transition-colors duration-150 p-6 flex flex-col justify-between ${
        isRed
          ? 'bg-red-950/90 border-red-700 text-red-50'
          : 'bg-white border-stone-200 text-stone-900'
      }`}
    >
      <div>
        {/* Header */}
        <div
          className={`flex items-center justify-between gap-4 border-b pb-4 mb-5 ${
            isRed ? 'border-red-800/80' : 'border-stone-200'
          }`}
        >
          <div>
            <p
              className={`text-xs font-mono tracking-tight ${
                isRed ? 'text-red-300' : 'text-red-700'
              }`}
            >
              01 · PILLAR ONE · DAILY FRICTION ELIMINATOR
            </p>
            <h2
              id="heading-better-life"
              className="text-xl font-bold tracking-tight mt-0.5 font-display"
            >
              {morphPhraseToSterling('1. Makes Your Life Better', poundMorph)}
            </h2>
          </div>

          <button
            type="button"
            onClick={onCompleteNextUnfinished}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isRed
                ? 'bg-white text-red-950 hover:bg-red-100'
                : 'bg-stone-900 text-white hover:bg-red-700'
            }`}
          >
            Upgrade Life Now (+1 Habit)
          </button>
        </div>

        {/* Wellbeing Progress Bar & Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div
            className={`flex items-center gap-2 text-xs ${
              isRed ? 'text-red-200' : 'text-stone-600'
            }`}
          >
            <span>Daily Betterment Index</span>
            <span aria-hidden="true">·</span>
            <span
              className={`font-mono font-bold tabular-nums ${
                isRed ? 'text-white' : 'text-stone-900'
              }`}
            >
              {wellbeingScore}/100
            </span>
          </div>

          <div
            role="group"
            aria-label="Filter life betterment actions by category"
            className={`flex items-center gap-1 p-1 rounded-lg ${
              isRed ? 'bg-red-900/70' : 'bg-stone-100'
            }`}
          >
            {(['all', 'health', 'clarity', 'wealth'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors capitalize whitespace-nowrap shrink-0 cursor-pointer ${
                  categoryFilter === cat
                    ? isRed
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-white text-stone-900 shadow-xs'
                    : isRed
                    ? 'text-red-200 hover:text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* D3 Sterling Growth Trends Visualization */}
        <SterlingGrowthChart
          ledger={ledger}
          redLevel={redLevel}
          poundMorph={poundMorph}
        />

        {/* Action List */}
        <ul
          className={`divide-y border-t border-b mb-5 ${
            isRed ? 'divide-red-800/70 border-red-800/70' : 'divide-stone-200 border-stone-200'
          }`}
        >
          {filteredActions.map((action) => (
            <li
              key={action.id}
              className={`py-3 flex items-start justify-between gap-3 transition-colors px-2 -mx-2 rounded-lg ${
                isRed ? 'hover:bg-red-900/40' : 'hover:bg-stone-50/80'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => onToggleAction(action.id)}
                  aria-label={`Toggle "${action.title}"`}
                  aria-pressed={action.completed}
                  className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                    action.completed
                      ? 'bg-red-600 border-red-500 text-white'
                      : isRed
                      ? 'border-red-400 bg-red-950 hover:border-white'
                      : 'border-stone-300 bg-white hover:border-red-500'
                  }`}
                >
                  {action.completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                </button>
                <div className="min-w-0">
                  <p
                    className={`text-sm font-medium leading-snug ${
                      action.completed
                        ? isRed
                          ? 'line-through text-red-300/60'
                          : 'line-through text-stone-400'
                        : isRed
                        ? 'text-white'
                        : 'text-stone-900'
                    }`}
                  >
                    {morphPhraseToSterling(action.title, poundMorph)}
                  </p>
                  <p className={`text-xs mt-0.5 ${isRed ? 'text-red-200/80' : 'text-stone-500'}`}>
                    <span className="capitalize">{action.category}</span>
                    <span aria-hidden="true"> · </span>
                    <span>Saves {action.minutesSaved}m</span>
                    <span aria-hidden="true"> · </span>
                    <span>{action.benefitSummary}</span>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 whitespace-nowrap">
                <span
                  className={`text-xs font-mono font-semibold tabular-nums whitespace-nowrap ${
                    isRed
                      ? 'text-red-200'
                      : action.completed
                      ? 'text-red-700'
                      : 'text-stone-700'
                  }`}
                >
                  +{formatSterling(action.gbpValue, poundMorph)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Add New Life Action Form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className={`rounded-lg p-4 border ${
          isRed ? 'bg-red-900/50 border-red-700/80' : 'bg-stone-50 border-stone-200'
        }`}
      >
        <div className="flex items-center justify-between mb-2.5">
          <label
            htmlFor="new-life-action-title"
            className={`text-xs font-semibold inline-flex items-center gap-1.5 ${
              isRed ? 'text-red-100' : 'text-stone-700'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isRed ? 'text-red-300' : 'text-red-600'}`} />
            Add Custom Life-Improving Micro-Action
          </label>
          <span className={`text-xs font-mono ${isRed ? 'text-red-200' : 'text-stone-500'}`}>
            Auto-links to £ Vault
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <div className="sm:col-span-5">
            <input
              id="new-life-action-title"
              type="text"
              value={newTitle}
              onChange={(e) => {
                setNewTitle(e.target.value);
                if (formError) setFormError(null);
              }}
              placeholder="e.g. Walk 15m outdoors & skip rideshare"
              className="w-full px-3 py-2 text-xs text-stone-900 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div className="sm:col-span-2">
            <select
              aria-label="Action category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as ActionCategory)}
              className="w-full px-2 py-2 text-xs text-stone-900 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="health">Health</option>
              <option value="clarity">Clarity</option>
              <option value="wealth">Wealth</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <input
              aria-label="Sterling pound value"
              type="number"
              step="0.50"
              min="0.50"
              value={newGbp}
              onChange={(e) => setNewGbp(e.target.value)}
              placeholder="£ Value"
              className="w-full px-2.5 py-2 text-xs font-mono text-stone-900 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 tabular-nums"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              className="w-full h-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-500 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Action
            </button>
          </div>
        </div>

        {formError && (
          <p
            role="alert"
            className={`text-xs font-medium mt-2 ${
              isRed ? 'text-amber-300' : 'text-red-600'
            }`}
          >
            {formError}
          </p>
        )}
      </form>
    </section>
  );
};
