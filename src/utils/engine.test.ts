import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getRedPalette,
  nextRedLevel,
  formatSterling,
  calculateLifeBettermentMetrics,
  transmuteToSterling,
  validateNewAction,
  morphPhraseToSterling,
  buildPublishedUrls,
  parseUrlPublishState,
  buildSterlingGrowthSeries,
  INITIAL_LIFE_ACTIONS,
  INITIAL_STERLING_LEDGER,
} from './engine';

test('Pillar 0 (Becoming Red): getRedPalette and nextRedLevel transition into Crimson state', () => {
  const neutral = getRedPalette(0);
  assert.equal(neutral.isRedActive, false);
  assert.equal(neutral.multiplier, 1.0);

  const firstClick = nextRedLevel(0);
  assert.equal(firstClick, 2); // Immediate jump to Pure Signal Red (#DC2626)
  const signalRed = getRedPalette(firstClick);
  assert.equal(signalRed.isRedActive, true);
  assert.equal(signalRed.hexPrimary, '#DC2626');
  assert.equal(signalRed.multiplier, 1.5);

  const overdrive = nextRedLevel(firstClick);
  assert.equal(overdrive, 3);
  assert.equal(getRedPalette(overdrive).multiplier, 2.0);
});

test('Pillar 1 (Makes Life Better): calculateLifeBettermentMetrics computes accurate wellbeing and £ totals', () => {
  const metrics = calculateLifeBettermentMetrics(
    INITIAL_LIFE_ACTIONS,
    INITIAL_STERLING_LEDGER,
    2
  );
  assert.equal(metrics.completedCount, 2);
  assert.equal(metrics.totalCount, 6);
  assert.equal(metrics.habitGbpTotal, 32.5);
  assert.equal(metrics.ledgerGbpTotal, 32.5);
  assert.equal(metrics.totalMinutesSaved, 30);
  assert.ok(metrics.wellbeingScore > 30);
});

test('Pillar 1 Validation: validateNewAction rejects invalid inputs and accepts valid actions', () => {
  const emptyTitle = validateNewAction('   ', '10', '15');
  assert.equal(emptyTitle.valid, false);

  const badGbp = validateNewAction('Pack healthy lunch', '-5', '20');
  assert.equal(badGbp.valid, false);

  const badMinutes = validateNewAction('Pack healthy lunch', '8.50', '0');
  assert.equal(badMinutes.valid, false);

  const valid = validateNewAction('Brew espresso at home', '3.80', '12');
  assert.equal(valid.valid, true);
  assert.equal(valid.parsedGbp, 3.8);
  assert.equal(valid.parsedMinutes, 12);
});

test('Pillar 2 (Becomes £): formatSterling, transmuteToSterling, and morphPhraseToSterling work accurately', () => {
  assert.equal(formatSterling(32.5, false), '£32.50');
  assert.ok(formatSterling(60, true).startsWith('£££ · £60.00'));

  const transmuted = transmuteToSterling(30, 30, 10, 2);
  // 30 mins @ £30/hr = £15.00 + £10.00 impulse = £25.00 base.
  // Red level 2 has 1.5x multiplier => +£12.50 bonus => £37.50 instant £
  assert.equal(transmuted.timeValueGbp, 15);
  assert.equal(transmuted.impulseSavedGbp, 10);
  assert.equal(transmuted.redBonusGbp, 12.5);
  assert.equal(transmuted.instantTotalGbp, 37.5);
  assert.ok(transmuted.tenYearCompoundGbp > transmuted.oneYearCompoundGbp);

  assert.equal(
    morphPhraseToSterling('Become Red and Better', true),
    'B£com£ R£d and B£tt£r'
  );
});

test('Publishing URL Engine: buildPublishedUrls and parseUrlPublishState support excelents and magitarious', () => {
  const excelentsBundle = buildPublishedUrls(
    'excelents',
    'excelents',
    2,
    true,
    'https://ais-pre-csfsgkzzi6lxtkszmall6g-467513586090.europe-west2.run.app'
  );
  assert.equal(excelentsBundle.cleanSlug, 'excelents');
  assert.equal(excelentsBundle.vanityDisplayUrl, 'https://excelents.uk/0-red-1-better-2-pound');
  assert.ok(excelentsBundle.liveShareableUrl.includes('?edition=excelents&red=2&pound=1'));

  const magitariousBundle = buildPublishedUrls(
    'magitarious',
    'magitarious',
    3,
    false,
    'https://ais-pre-csfsgkzzi6lxtkszmall6g-467513586090.europe-west2.run.app'
  );
  assert.equal(magitariousBundle.cleanSlug, 'magitarious');
  assert.equal(magitariousBundle.vanityDisplayUrl, 'https://magitarious.uk/0-red-1-better-2-pound');
  assert.ok(magitariousBundle.liveShareableUrl.includes('?edition=magitarious&red=3&pound=0'));

  const parsed = parseUrlPublishState('?edition=magitarious&red=2&pound=1');
  assert.equal(parsed.editionKey, 'magitarious');
  assert.equal(parsed.redLevel, 2);
  assert.equal(parsed.poundMorph, true);
});

test('Sterling Growth Trends Series: buildSterlingGrowthSeries computes chronological cumulative £', () => {
  const sampleLedger = [
    {
      id: 'e-newest',
      label: 'Newest Entry',
      source: 'transmute' as const,
      amountGbp: 15.0,
      minutesSaved: 20,
      timestamp: '10:30',
    },
    {
      id: 'e-oldest',
      label: 'Oldest Entry',
      source: 'habit' as const,
      amountGbp: 10.5,
      minutesSaved: 15,
      timestamp: '08:00',
    },
  ];

  const series = buildSterlingGrowthSeries(sampleLedger);
  assert.equal(series.length, 2);
  assert.equal(series[0].id, 'e-oldest');
  assert.equal(series[0].deltaGbp, 10.5);
  assert.equal(series[0].cumulativeGbp, 10.5);
  assert.equal(series[1].id, 'e-newest');
  assert.equal(series[1].deltaGbp, 15.0);
  assert.equal(series[1].cumulativeGbp, 25.5);
});


