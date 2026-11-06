import React, { useEffect, useId, useRef, useState } from 'react';
import * as d3 from 'd3';
import { TrendingUp } from 'lucide-react';
import {
  RedLevel,
  SterlingEntry,
  SterlingGrowthPoint,
  buildSterlingGrowthSeries,
  formatSterling,
  morphPhraseToSterling,
} from '../utils/engine';

interface SterlingGrowthChartProps {
  ledger: SterlingEntry[];
  redLevel: RedLevel;
  poundMorph: boolean;
}

export const SterlingGrowthChart: React.FC<SterlingGrowthChartProps> = ({
  ledger,
  redLevel,
  poundMorph,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gradientId = useId().replace(/:/g, '');
  const [chartMode, setChartMode] = useState<'cumulative' | 'delta'>('cumulative');
  const [activePoint, setActivePoint] = useState<SterlingGrowthPoint | null>(null);

  const isRed = redLevel > 0;
  const series = buildSterlingGrowthSeries(ledger);
  const latestPoint = series.length > 0 ? series[series.length - 1] : null;
  const inspectedPoint = activePoint ?? latestPoint;

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    if (series.length === 0) return;

    const width = 560;
    const height = 176;
    const margin = { top: 16, right: 20, bottom: 28, left: 48 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const values = series.map((d) =>
      chartMode === 'cumulative' ? d.cumulativeGbp : d.deltaGbp
    );
    const maxVal = Math.max(10, d3.max(values) ?? 10);

    const xScale = d3
      .scaleLinear()
      .domain([1, Math.max(2, series.length)])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, maxVal * 1.12])
      .nice()
      .range([innerHeight, 0]);

    const defs = svg.append('defs');
    const gradient = defs
      .append('linearGradient')
      .attr('id', `sterling-area-${gradientId}`)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', isRed ? '#FCA5A5' : '#DC2626')
      .attr('stop-opacity', isRed ? 0.42 : 0.24);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', isRed ? '#FCA5A5' : '#DC2626')
      .attr('stop-opacity', 0.02);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Horizontal Y grid lines & £ labels
    const yTicks = yScale.ticks(4);
    const gridGroup = g.append('g').attr('class', 'y-grid');

    gridGroup
      .selectAll('line')
      .data(yTicks)
      .join('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', isRed ? 'rgba(254, 202, 202, 0.16)' : 'rgba(28, 25, 23, 0.08)')
      .attr('stroke-dasharray', '3,3');

    gridGroup
      .selectAll('text')
      .data(yTicks)
      .join('text')
      .attr('x', -8)
      .attr('y', (d) => yScale(d))
      .attr('dy', '0.32em')
      .attr('text-anchor', 'end')
      .attr('fill', isRed ? '#FECACA' : '#78716C')
      .attr('font-size', '10px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text((d) => `£${Math.round(d)}`);

    // X-axis step/timestamp labels
    const xTicks =
      series.length <= 6
        ? series
        : series.filter(
            (_, idx) => idx === 0 || idx === series.length - 1 || idx % 2 === 0
          );

    g.append('g')
      .selectAll('text')
      .data(xTicks)
      .join('text')
      .attr('x', (d) =>
        series.length === 1 ? innerWidth / 2 : xScale(d.stepIndex)
      )
      .attr('y', innerHeight + 18)
      .attr('text-anchor', 'middle')
      .attr('fill', isRed ? '#FECACA' : '#78716C')
      .attr('font-size', '10px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text((d) => `#${d.stepIndex} (${d.timestamp})`);

    const getX = (d: SterlingGrowthPoint) =>
      series.length === 1 ? innerWidth / 2 : xScale(d.stepIndex);
    const getY = (d: SterlingGrowthPoint) =>
      yScale(chartMode === 'cumulative' ? d.cumulativeGbp : d.deltaGbp);

    if (series.length > 1) {
      const areaGenerator = d3
        .area<SterlingGrowthPoint>()
        .x((d) => getX(d))
        .y0(innerHeight)
        .y1((d) => getY(d))
        .curve(d3.curveMonotoneX);

      const lineGenerator = d3
        .line<SterlingGrowthPoint>()
        .x((d) => getX(d))
        .y((d) => getY(d))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(series)
        .attr('fill', `url(#sterling-area-${gradientId})`)
        .attr('d', areaGenerator);

      g.append('path')
        .datum(series)
        .attr('fill', 'none')
        .attr('stroke', isRed ? '#F87171' : '#DC2626')
        .attr('stroke-width', 2.25)
        .attr('d', lineGenerator);
    } else if (series.length === 1) {
      // Single point baseline stem
      const single = series[0];
      g.append('line')
        .attr('x1', getX(single))
        .attr('x2', getX(single))
        .attr('y1', innerHeight)
        .attr('y2', getY(single))
        .attr('stroke', isRed ? '#F87171' : '#DC2626')
        .attr('stroke-width', 2);
    }

    // Data nodes
    g.append('g')
      .selectAll('circle')
      .data(series)
      .join('circle')
      .attr('cx', (d) => getX(d))
      .attr('cy', (d) => getY(d))
      .attr('r', (d) => (inspectedPoint?.id === d.id ? 5.5 : 4))
      .attr('fill', (d) =>
        inspectedPoint?.id === d.id
          ? isRed
            ? '#FBBF24'
            : '#991B1B'
          : isRed
          ? '#FEF2F2'
          : '#DC2626'
      )
      .attr('stroke', isRed ? '#450A0A' : '#FFFFFF')
      .attr('stroke-width', 1.75)
      .style('cursor', 'pointer')
      .on('mouseenter', (_, d) => setActivePoint(d))
      .on('click', (_, d) => setActivePoint(d));
  }, [series, chartMode, isRed, gradientId, inspectedPoint]);

  return (
    <div
      data-testid="sterling-growth-trends"
      className={`rounded-lg p-4 border mb-5 transition-colors ${
        isRed
          ? 'bg-red-900/45 border-red-700/80 text-red-50'
          : 'bg-stone-50 border-stone-200 text-stone-900'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp
            className={`w-4 h-4 shrink-0 ${isRed ? 'text-red-300' : 'text-red-600'}`}
          />
          <div>
            <h3 className="text-xs font-semibold tracking-tight">
              {morphPhraseToSterling('Sterling Growth Trends (D3 Activity Telemetry)', poundMorph)}
            </h3>
            <p className={`text-xs font-mono ${isRed ? 'text-red-200' : 'text-stone-500'}`}>
              {series.length} ledger events tracked · Peak:{' '}
              {formatSterling(latestPoint?.cumulativeGbp ?? 0, poundMorph)}
            </p>
          </div>
        </div>

        <div
          role="group"
          aria-label="Sterling growth chart metric mode"
          className={`flex items-center gap-1 p-0.5 rounded-md ${
            isRed ? 'bg-red-950/80' : 'bg-stone-200/80'
          }`}
        >
          <button
            type="button"
            onClick={() => setChartMode('cumulative')}
            aria-pressed={chartMode === 'cumulative'}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              chartMode === 'cumulative'
                ? isRed
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-stone-900 shadow-xs'
                : isRed
                ? 'text-red-200 hover:text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Cumulative £
          </button>
          <button
            type="button"
            onClick={() => setChartMode('delta')}
            aria-pressed={chartMode === 'delta'}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              chartMode === 'delta'
                ? isRed
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-stone-900 shadow-xs'
                : isRed
                ? 'text-red-200 hover:text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Entry Delta £
          </button>
        </div>
      </div>

      {series.length === 0 ? (
        <div
          className={`py-6 text-center rounded border border-dashed text-xs ${
            isRed
              ? 'border-red-700 text-red-200'
              : 'border-stone-300 text-stone-500'
          }`}
        >
          No ledger activity yet. Complete a habit or add an action below to plot Sterling (£) growth.
        </div>
      ) : (
        <>
          <div className="w-full overflow-hidden">
            <svg
              ref={svgRef}
              viewBox="0 0 560 176"
              role="img"
              aria-label="Sterling Growth Trends D3 chart showing British Pound ledger activity over time"
              className="w-full h-40 select-none overflow-visible"
            />
          </div>

          {inspectedPoint && (
            <div
              className={`mt-2 pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-xs font-mono tabular-nums ${
                isRed
                  ? 'border-red-800/80 text-red-100'
                  : 'border-stone-200 text-stone-600'
              }`}
            >
              <span className="truncate max-w-xs sm:max-w-md">
                #{inspectedPoint.stepIndex} ({inspectedPoint.timestamp}) ·{' '}
                {morphPhraseToSterling(inspectedPoint.label, poundMorph)}
              </span>
              <span className="font-semibold whitespace-nowrap">
                +{formatSterling(inspectedPoint.deltaGbp)} → Total{' '}
                {formatSterling(inspectedPoint.cumulativeGbp, poundMorph)}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};
