import React, { useState } from 'react';
import { Check, Copy, Globe, Link2 } from 'lucide-react';
import {
  PublishEditionKey,
  RedLevel,
  SHARED_APP_BASE_URL,
  buildPublishedUrls,
  morphPhraseToSterling,
} from '../utils/engine';

interface PublishUrlBannerProps {
  editionKey: PublishEditionKey;
  customSlug: string;
  redLevel: RedLevel;
  poundMorph: boolean;
  onSelectEdition: (key: PublishEditionKey, slug?: string) => void;
  onPublishSync: (vanityUrl: string, liveUrl: string) => void;
}

export const PublishUrlBanner: React.FC<PublishUrlBannerProps> = ({
  editionKey,
  customSlug,
  redLevel,
  poundMorph,
  onSelectEdition,
  onPublishSync,
}) => {
  const [copiedTarget, setCopiedTarget] = useState<'live' | 'vanity' | null>(null);
  const [slugDraft, setSlugDraft] = useState<string>(customSlug);

  const isRed = redLevel > 0;
  const bundle = buildPublishedUrls(
    editionKey,
    editionKey === 'custom' ? slugDraft : customSlug,
    redLevel,
    poundMorph,
    SHARED_APP_BASE_URL
  );

  const handleCopy = async (text: string, target: 'live' | 'vanity') => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      // Fallback handled silently in restricted frames
    }
    setCopiedTarget(target);
    onPublishSync(bundle.vanityDisplayUrl, bundle.liveShareableUrl);
    window.setTimeout(() => {
      setCopiedTarget((prev) => (prev === target ? null : prev));
    }, 2500);
  };

  const handleCustomSlugSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectEdition('custom', slugDraft);
    const updated = buildPublishedUrls('custom', slugDraft, redLevel, poundMorph, SHARED_APP_BASE_URL);
    onPublishSync(updated.vanityDisplayUrl, updated.liveShareableUrl);
  };

  return (
    <section
      id="section-publish"
      aria-labelledby="heading-publish-url"
      className={`rounded-xl border p-6 transition-colors duration-150 ${
        isRed
          ? 'bg-red-950/90 border-red-700 text-red-50'
          : 'bg-white border-stone-200 text-stone-900'
      }`}
    >
      <div
        className={`flex flex-wrap items-center justify-between gap-4 border-b pb-4 mb-5 ${
          isRed ? 'border-red-800/80' : 'border-stone-200'
        }`}
      >
        <div>
          <p
            className={`text-xs font-mono tracking-tight ${
              isRed ? 'text-red-300' : 'text-red-700'
            }`}
          >
            LIVE PUBLICATION &amp; PERMALINK GATEWAY · EXCELENTS &amp; MAGITARIOUS
          </p>
          <h2
            id="heading-publish-url"
            className="text-xl font-bold tracking-tight mt-0.5 font-display"
          >
            {morphPhraseToSterling(
              `Published Edition: ${bundle.cleanSlug.toUpperCase()}.UK`,
              poundMorph
            )}
          </h2>
        </div>

        {/* Segmented Edition Switcher: Excelents vs Magitarious */}
        <div
          role="group"
          aria-label="Select published URL edition"
          className={`flex items-center gap-1 p-1 rounded-lg ${
            isRed ? 'bg-red-900/70' : 'bg-stone-100'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setSlugDraft('excelents');
              onSelectEdition('excelents', 'excelents');
            }}
            aria-pressed={editionKey === 'excelents'}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              editionKey === 'excelents'
                ? 'bg-red-600 text-white shadow-xs'
                : isRed
                ? 'text-red-200 hover:text-white'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            Publish: Excelents
          </button>

          <button
            type="button"
            onClick={() => {
              setSlugDraft('magitarious');
              onSelectEdition('magitarious', 'magitarious');
            }}
            aria-pressed={editionKey === 'magitarious'}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              editionKey === 'magitarious'
                ? 'bg-red-600 text-white shadow-xs'
                : isRed
                ? 'text-red-200 hover:text-white'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            Publish: Magitarious
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 7 Cols: Live Shareable Public URL & Vanity Alias */}
        <div className="lg:col-span-7 space-y-3">
          <div
            className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isRed ? 'bg-red-900/50 border-red-700/80' : 'bg-stone-50 border-stone-200'
            }`}
          >
            <div className="min-w-0">
              <span
                className={`text-xs block mb-0.5 ${
                  isRed ? 'text-red-200' : 'text-stone-500'
                }`}
              >
                Branded Edition Alias ({bundle.cleanSlug})
              </span>
              <p
                data-testid="vanity-display-url"
                className="text-sm font-mono font-bold truncate"
              >
                {bundle.vanityDisplayUrl}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(bundle.vanityDisplayUrl, 'vanity')}
              className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isRed
                  ? 'border-red-400 text-white hover:bg-red-800/60'
                  : 'border-stone-300 text-stone-800 bg-white hover:bg-stone-100'
              }`}
            >
              {copiedTarget === 'vanity' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied Alias
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Alias URL
                </>
              )}
            </button>
          </div>

          <div
            className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isRed ? 'bg-red-900/50 border-red-700/80' : 'bg-stone-50 border-stone-200'
            }`}
          >
            <div className="min-w-0">
              <span
                className={`text-xs block mb-0.5 ${
                  isRed ? 'text-red-200' : 'text-stone-500'
                }`}
              >
                Live Public Share URL (Works in any browser · Syncs Red &amp; £ state)
              </span>
              <p
                data-testid="live-shareable-url"
                className="text-xs font-mono font-semibold truncate"
              >
                {bundle.liveShareableUrl}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(bundle.liveShareableUrl, 'live')}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-500 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copiedTarget === 'live' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Published &amp; Copied!
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5" />
                  Copy Live URL
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right 5 Cols: Custom Domain Slug Publisher */}
        <form
          onSubmit={handleCustomSlugSubmit}
          className={`lg:col-span-5 p-4 rounded-lg border flex flex-col justify-between ${
            isRed ? 'bg-red-900/40 border-red-700/80' : 'bg-stone-50 border-stone-200'
          }`}
        >
          <div>
            <label
              htmlFor="custom-publish-slug"
              className={`text-xs font-semibold inline-flex items-center gap-1.5 mb-1.5 ${
                isRed ? 'text-red-100' : 'text-stone-800'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              Custom Edition Name (e.g. excelents or magitarious)
            </label>
            <p className={`text-xs mb-3 ${isRed ? 'text-red-200/90' : 'text-stone-500'}`}>
              Instantly updates the active browser address bar query (`?edition=...`) and page title.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="custom-publish-slug"
              type="text"
              value={slugDraft}
              onChange={(e) => setSlugDraft(e.target.value)}
              placeholder="excelents or magitarious"
              className="flex-1 px-3 py-2 text-xs font-mono text-stone-900 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isRed
                  ? 'bg-white text-red-950 hover:bg-red-100'
                  : 'bg-stone-900 text-white hover:bg-stone-800'
              }`}
            >
              Publish Slug
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
