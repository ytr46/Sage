export type RedLevel = 0 | 1 | 2 | 3;

export type ActionCategory = 'health' | 'clarity' | 'wealth';

export interface LifeAction {
  id: string;
  title: string;
  category: ActionCategory;
  minutesSaved: number;
  gbpValue: number;
  benefitSummary: string;
  completed: boolean;
  completedCount: number;
}

export interface SterlingEntry {
  id: string;
  label: string;
  source: 'habit' | 'transmute' | 'red-surge';
  amountGbp: number;
  minutesSaved: number;
  timestamp: string;
}

export interface RedPaletteInfo {
  level: RedLevel;
  name: string;
  hexPrimary: string;
  wavelengthNm: number;
  multiplier: number;
  description: string;
  isRedActive: boolean;
}

export const INITIAL_LIFE_ACTIONS: LifeAction[] = [
  {
    id: 'act-water',
    title: 'Drink 500ml water & 90s daylight reset before screens',
    category: 'health',
    minutesSaved: 18,
    gbpValue: 4.5,
    benefitSummary: 'Eliminates morning grogginess and skips £4.50 impulse caffeine drink',
    completed: true,
    completedCount: 1,
  },
  {
    id: 'act-impulse',
    title: '24-hour rule on non-essential online checkout cart',
    category: 'wealth',
    minutesSaved: 12,
    gbpValue: 28.0,
    benefitSummary: 'Redirects £28.00 unplanned spend directly into Sterling Reserve',
    completed: true,
    completedCount: 1,
  },
  {
    id: 'act-deepwork',
    title: 'Single-tab 25-minute Crimson sprint on #1 priority task',
    category: 'clarity',
    minutesSaved: 45,
    gbpValue: 22.5,
    benefitSummary: 'Cuts context-switching drag and finishes core work 45m faster',
    completed: false,
    completedCount: 0,
  },
  {
    id: 'act-posture',
    title: '2-minute thoracic stretch & breathing decompression',
    category: 'health',
    minutesSaved: 15,
    gbpValue: 6.0,
    benefitSummary: 'Lowers cortisol and prevents afternoon energy slump',
    completed: false,
    completedCount: 0,
  },
  {
    id: 'act-sub-audit',
    title: 'Cancel or pause 1 unused recurring UK subscription',
    category: 'wealth',
    minutesSaved: 10,
    gbpValue: 14.99,
    benefitSummary: 'Locks in £14.99 immediate monthly cashflow gain (£179.88/yr)',
    completed: false,
    completedCount: 0,
  },
  {
    id: 'act-inbox',
    title: 'Archive all low-signal notifications in a 3-minute sweep',
    category: 'clarity',
    minutesSaved: 25,
    gbpValue: 12.0,
    benefitSummary: 'Restores mental bandwidth and recovers 25 minutes of deep focus',
    completed: false,
    completedCount: 0,
  },
];

export const INITIAL_STERLING_LEDGER: SterlingEntry[] = [
  {
    id: 'led-2',
    label: '24-hour rule on non-essential online checkout cart',
    source: 'habit',
    amountGbp: 28.0,
    minutesSaved: 12,
    timestamp: '09:40',
  },
  {
    id: 'led-1',
    label: 'Drink 500ml water & 90s daylight reset before screens',
    source: 'habit',
    amountGbp: 4.5,
    minutesSaved: 18,
    timestamp: '08:15',
  },
];

export function getRedPalette(level: RedLevel): RedPaletteInfo {
  switch (level) {
    case 0:
      return {
        level: 0,
        name: '00 · Standby Neutral',
        hexPrimary: '#1C1917',
        wavelengthNm: 540,
        multiplier: 1.0,
        description: 'Baseline neutral state. Click "0. Become Red" to ignite Crimson mode.',
        isRedActive: false,
      };
    case 1:
      return {
        level: 1,
        name: '01 · Crimson Warmup',
        hexPrimary: '#E11D48',
        wavelengthNm: 635,
        multiplier: 1.25,
        description: 'Warm rose-crimson field engaged. Visual urgency +25%.',
        isRedActive: true,
      };
    case 2:
      return {
        level: 2,
        name: '02 · Pure Signal Red',
        hexPrimary: '#DC2626',
        wavelengthNm: 660,
        multiplier: 1.5,
        description: 'High-clarity British Pillar-Box Red (#DC2626). Zero-distraction state.',
        isRedActive: true,
      };
    case 3:
      return {
        level: 3,
        name: '03 · Maximum Crimson Overdrive',
        hexPrimary: '#991B1B',
        wavelengthNm: 700,
        multiplier: 2.0,
        description: 'Full deep-crimson saturation (#991B1B). 2.0x £ focus velocity active.',
        isRedActive: true,
      };
  }
}

export function nextRedLevel(current: RedLevel): RedLevel {
  if (current === 0) return 2;
  if (current === 2) return 3;
  if (current === 3) return 1;
  return 0;
}

export function formatSterling(amount: number, showSymbolDensity = false): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const formatted = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);

  if (!showSymbolDensity) {
    return formatted;
  }

  const tierCount = Math.min(5, Math.max(1, Math.ceil(safeAmount / 25)));
  const symbols = '£'.repeat(tierCount);
  return `${symbols} · ${formatted}`;
}

export interface LifeBettermentMetrics {
  completedCount: number;
  totalCount: number;
  completionRate: number;
  wellbeingScore: number;
  totalMinutesSaved: number;
  habitGbpTotal: number;
  ledgerGbpTotal: number;
  compoundedTenYearGbp: number;
}

export function calculateLifeBettermentMetrics(
  actions: LifeAction[],
  ledger: SterlingEntry[],
  redLevel: RedLevel
): LifeBettermentMetrics {
  const totalCount = actions.length;
  const completedActions = actions.filter((a) => a.completed);
  const completedCount = completedActions.length;

  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const habitGbpTotal = completedActions.reduce((sum, a) => sum + a.gbpValue, 0);
  const ledgerGbpTotal = ledger.reduce((sum, item) => sum + item.amountGbp, 0);
  const totalMinutesSaved = ledger.reduce((sum, item) => sum + item.minutesSaved, 0);

  // Wellbeing score blends habit completion, time reclaimed, and active Red focus state
  const redBonus = redLevel > 0 ? redLevel * 4 : 0;
  const timeBonus = Math.min(25, Math.floor(totalMinutesSaved / 5));
  const baseCompletionScore = Math.round(completionRate * 0.65);
  const wellbeingScore = Math.min(100, Math.max(12, baseCompletionScore + timeBonus + redBonus));

  // 10-year compound value assuming weekly repetition of current £ gains at 7% annual return
  const annualEquivalent = ledgerGbpTotal * 52;
  const compoundedTenYearGbp = Math.round(annualEquivalent * 13.816 * 100) / 100;

  return {
    completedCount,
    totalCount,
    completionRate,
    wellbeingScore,
    totalMinutesSaved,
    habitGbpTotal: Math.round(habitGbpTotal * 100) / 100,
    ledgerGbpTotal: Math.round(ledgerGbpTotal * 100) / 100,
    compoundedTenYearGbp,
  };
}

export interface TransmutationResult {
  timeValueGbp: number;
  impulseSavedGbp: number;
  redBonusGbp: number;
  instantTotalGbp: number;
  oneYearCompoundGbp: number;
  fiveYearCompoundGbp: number;
  tenYearCompoundGbp: number;
}

export function transmuteToSterling(
  minutesReclaimed: number,
  hourlyRateGbp: number,
  impulseSkippedGbp: number,
  redLevel: RedLevel
): TransmutationResult {
  const safeMinutes = Math.max(0, Number.isFinite(minutesReclaimed) ? minutesReclaimed : 0);
  const safeRate = Math.max(0, Number.isFinite(hourlyRateGbp) ? hourlyRateGbp : 0);
  const safeImpulse = Math.max(0, Number.isFinite(impulseSkippedGbp) ? impulseSkippedGbp : 0);

  const rawTimeValue = (safeMinutes / 60) * safeRate;
  const timeValueGbp = Math.round(rawTimeValue * 100) / 100;
  const impulseSavedGbp = Math.round(safeImpulse * 100) / 100;

  const baseSum = timeValueGbp + impulseSavedGbp;
  const palette = getRedPalette(redLevel);
  const redBonusGbp =
    redLevel > 0 ? Math.round(baseSum * (palette.multiplier - 1) * 100) / 100 : 0;

  const instantTotalGbp = Math.round((baseSum + redBonusGbp) * 100) / 100;

  // Compound projections if repeated weekly (52x/yr) at 7% UK ISA annual growth
  const annualContribution = instantTotalGbp * 52;
  const oneYearCompoundGbp = Math.round(annualContribution * 1.07 * 100) / 100;
  const fiveYearCompoundGbp = Math.round(annualContribution * 5.7507 * 100) / 100;
  const tenYearCompoundGbp = Math.round(annualContribution * 13.8164 * 100) / 100;

  return {
    timeValueGbp,
    impulseSavedGbp,
    redBonusGbp,
    instantTotalGbp,
    oneYearCompoundGbp,
    fiveYearCompoundGbp,
    tenYearCompoundGbp,
  };
}

export interface ValidationOutcome {
  valid: boolean;
  error?: string;
  parsedTitle?: string;
  parsedGbp?: number;
  parsedMinutes?: number;
}

export function validateNewAction(
  title: string,
  gbpInput: string,
  minutesInput: string
): ValidationOutcome {
  const trimmed = title.trim();
  if (!trimmed) {
    return { valid: false, error: 'Please enter a specific life-improving action title.' };
  }
  if (trimmed.length < 3) {
    return { valid: false, error: 'Action title must be at least 3 characters long.' };
  }

  const gbpNum = Number(gbpInput);
  if (gbpInput.trim() === '' || Number.isNaN(gbpNum) || gbpNum <= 0 || gbpNum > 10000) {
    return {
      valid: false,
      error: 'Enter a valid Sterling (£) value between £0.50 and £10,000.',
    };
  }

  const minNum = Number(minutesInput);
  if (minutesInput.trim() === '' || Number.isNaN(minNum) || minNum < 1 || minNum > 480) {
    return {
      valid: false,
      error: 'Enter minutes saved between 1 and 480 minutes.',
    };
  }

  return {
    valid: true,
    parsedTitle: trimmed,
    parsedGbp: Math.round(gbpNum * 100) / 100,
    parsedMinutes: Math.round(minNum),
  };
}

export function morphPhraseToSterling(phrase: string, poundMorphActive: boolean): string {
  if (!poundMorphActive) return phrase;
  return phrase
    .replace(/[eE]/g, '£')
    .replace(/\$|€|¥/g, '£');
}

export type PublishEditionKey = 'excelents' | 'magitarious' | 'custom';

export interface PublishedUrlBundle {
  editionKey: PublishEditionKey;
  cleanSlug: string;
  vanityDisplayUrl: string;
  liveShareableUrl: string;
  relativeQueryUrl: string;
}

export const SHARED_APP_BASE_URL =
  'https://ais-pre-csfsgkzzi6lxtkszmall6g-467513586090.europe-west2.run.app';

export function sanitizeSlug(raw: string): string {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || 'excelents';
}

export function buildPublishedUrls(
  editionKey: PublishEditionKey,
  customSlug: string,
  redLevel: RedLevel,
  poundMorph: boolean,
  baseOrigin: string = SHARED_APP_BASE_URL
): PublishedUrlBundle {
  const cleanSlug =
    editionKey === 'excelents'
      ? 'excelents'
      : editionKey === 'magitarious'
      ? 'magitarious'
      : sanitizeSlug(customSlug);

  const query = `?edition=${encodeURIComponent(cleanSlug)}&red=${redLevel}&pound=${
    poundMorph ? '1' : '0'
  }`;
  const cleanOrigin = baseOrigin.replace(/\/+$/, '');

  return {
    editionKey,
    cleanSlug,
    vanityDisplayUrl: `https://${cleanSlug}.uk/0-red-1-better-2-pound`,
    liveShareableUrl: `${cleanOrigin}/${query}`,
    relativeQueryUrl: `/${query}`,
  };
}

export interface ParsedPublishState {
  editionKey: PublishEditionKey;
  customSlug: string;
  redLevel?: RedLevel;
  poundMorph?: boolean;
}

export function parseUrlPublishState(search: string): ParsedPublishState {
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
  const rawEdition = (params.get('edition') || 'excelents').toLowerCase().trim();

  let editionKey: PublishEditionKey = 'excelents';
  let customSlug = 'excelents';
  if (rawEdition === 'magitarious') {
    editionKey = 'magitarious';
    customSlug = 'magitarious';
  } else if (rawEdition && rawEdition !== 'excelents') {
    editionKey = 'custom';
    customSlug = sanitizeSlug(rawEdition);
  }

  const redParam = params.get('red');
  let redLevel: RedLevel | undefined;
  if (redParam === '0' || redParam === '1' || redParam === '2' || redParam === '3') {
    redLevel = Number(redParam) as RedLevel;
  }

  const poundParam = params.get('pound');
  let poundMorph: boolean | undefined;
  if (poundParam === '1' || poundParam === 'true') {
    poundMorph = true;
  } else if (poundParam === '0' || poundParam === 'false') {
    poundMorph = false;
  }

  return {
    editionKey,
    customSlug,
    redLevel,
    poundMorph,
  };
}

export interface SterlingGrowthPoint {
  stepIndex: number;
  id: string;
  label: string;
  timestamp: string;
  source: SterlingEntry['source'];
  deltaGbp: number;
  cumulativeGbp: number;
  minutesSaved: number;
}

export function buildSterlingGrowthSeries(ledger: SterlingEntry[]): SterlingGrowthPoint[] {
  // Ledger stores newest entries first; reverse to chronological order for time-series growth
  const chronological = [...ledger].reverse();
  let runningTotal = 0;

  return chronological.map((entry, idx) => {
    runningTotal = Math.round((runningTotal + entry.amountGbp) * 100) / 100;
    return {
      stepIndex: idx + 1,
      id: entry.id,
      label: entry.label,
      timestamp: entry.timestamp,
      source: entry.source,
      deltaGbp: entry.amountGbp,
      cumulativeGbp: runningTotal,
      minutesSaved: entry.minutesSaved,
    };
  });
}


