import React from 'react';

// 1. HORIZONTAL BAR CHART COMPONENT
export function BarChart({ data }) {
  if (!data || data.length === 0) return <EmptyChartState />;

  const maxVal = Math.max(...data.map(d => d.count), 1);
  const chartHeight = data.length * 50;

  return (
    <svg width="100%" height={chartHeight} viewBox={`0 0 500 ${chartHeight}`} className="font-sans">
      {data.map((item, idx) => {
        const barWidth = (item.count / maxVal) * 320; // Scale to max 320px
        const y = idx * 50 + 10;
        
        return (
          <g key={item.name} className="group cursor-pointer">
            {/* Room Type Label */}
            <text 
              x="10" 
              y={y + 20} 
              className="text-xs font-semibold fill-brand-dark dark:fill-brand-cream/80"
            >
              {item.name}
            </text>

            {/* Background Bar */}
            <rect 
              x="130" 
              y={y} 
              width="320" 
              height="24" 
              rx="4" 
              className="fill-brand-dark/5 dark:fill-brand-cream/5"
            />

            {/* Filled Bar */}
            <rect 
              x="130" 
              y={y} 
              width={barWidth || 5} // Fallback to 5px min width
              height="24" 
              rx="4" 
              className="fill-brand-gold transition-all duration-700 ease-out hover:fill-brand-goldLight"
            />

            {/* Count Tag */}
            <text 
              x={130 + barWidth + 10} 
              y={y + 17} 
              className="text-xs font-bold fill-brand-gold"
            >
              {item.count}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// 2. DONUT (PIE) CHART COMPONENT
export function DonutChart({ data }) {
  if (!data || data.length === 0) return <EmptyChartState />;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (total === 0) return <EmptyChartState />;

  const radius = 55;
  const strokeWidth = 18;
  const circ = 2 * Math.PI * radius; // Approx 345.57
  const center = 80;

  // Colors for the slices
  const colors = [
    '#8B6914', // Gold
    '#2C1810', // Dark Brown
    '#C5A85C', // Light Gold
    '#E6DEC9', // Sand / Beige
  ];

  let accumulatedPercent = 0;

  const slices = data.map((item, idx) => {
    const percent = item.value / total;
    const strokeLength = percent * circ;
    const strokeOffset = circ - (accumulatedPercent * circ);
    
    // Store accumulated percentage for the next slice
    accumulatedPercent += percent;

    return {
      ...item,
      strokeLength,
      strokeOffset,
      color: colors[idx % colors.length],
      percentage: Math.round(percent * 100)
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
      {/* Donut SVG */}
      <div className="relative w-40 h-40">
        <svg width="100%" height="100%" viewBox="0 0 160 160" className="-rotate-90">
          <circle 
            cx={center} 
            cy={center} 
            r={radius} 
            fill="transparent" 
            stroke="rgba(0,0,0,0.03)" 
            strokeWidth={strokeWidth} 
          />
          {slices.map((slice, idx) => (
            slice.value > 0 && (
              <circle
                key={slice.label}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${slice.strokeLength} ${circ}`}
                strokeDashoffset={slice.strokeOffset}
                strokeLinecap={slices.length === 1 ? 'butt' : 'round'}
                className="transition-all duration-1000 ease-out hover:opacity-90"
              />
            )
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-serif font-bold text-brand-dark dark:text-brand-cream">{total}</span>
          <span className="text-[9px] uppercase tracking-wider text-brand-textMuted">Total Sets</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2">
        {slices.map((slice) => (
          <div key={slice.label} className="flex items-center gap-3 text-xs">
            <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }}></span>
            <span className="font-medium text-brand-dark/80 dark:text-brand-cream/80">{slice.label}:</span>
            <span className="font-bold text-brand-dark dark:text-brand-cream">{slice.value} ({slice.percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. DAILY TREND LINE CHART COMPONENT
export function LineChart({ data }) {
  if (!data || data.length === 0) return <EmptyChartState />;

  const maxVal = Math.max(...data.map(d => d.count), 2); // Set minimum height scaling factor of 2
  
  const width = 500;
  const height = 180;
  const paddingX = 40;
  const paddingY = 20;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Calculate coordinates
  const points = data.map((item, idx) => {
    const x = paddingX + (idx / (data.length - 1)) * chartWidth;
    const y = paddingY + chartHeight - (item.count / maxVal) * chartHeight;
    return { x, y, label: item.label, count: item.count };
  });

  // Construct SVG Path
  const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  
  // Construct Shaded Area Path (goes down to bottom of graph)
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="font-sans">
      <defs>
        {/* Shaded Area Gradient */}
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B6914" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#8B6914" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Grid Lines */}
      {[0, 0.5, 1].map((ratio) => {
        const y = paddingY + chartHeight * ratio;
        const gridLabel = Math.round(maxVal * (1 - ratio));
        return (
          <g key={ratio}>
            <line 
              x1={paddingX} 
              y1={y} 
              x2={width - paddingX} 
              y2={y} 
              className="stroke-brand-dark/10 dark:stroke-brand-cream/10" 
              strokeDasharray="4 4"
            />
            <text 
              x={paddingX - 10} 
              y={y + 4} 
              textAnchor="end" 
              className="text-[10px] fill-brand-textMuted font-bold"
            >
              {gridLabel}
            </text>
          </g>
        );
      })}

      {/* Area under the line */}
      <path d={areaPath} fill="url(#chartGradient)" />

      {/* Trend line */}
      <path 
        d={linePath} 
        fill="transparent" 
        stroke="#8B6914" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />

      {/* Interactive Data Nodes */}
      {points.map((p, idx) => (
        <g key={idx} className="group">
          {/* Outer highlight */}
          <circle 
            cx={p.x} 
            cy={p.y} 
            r="8" 
            className="fill-brand-gold/0 group-hover:fill-brand-gold/20 transition-all duration-150 cursor-pointer"
          />
          {/* Inner point */}
          <circle 
            cx={p.x} 
            cy={p.y} 
            r="4.5" 
            className="fill-brand-cream stroke-brand-gold stroke-2 dark:fill-brand-bgDark transition-transform duration-150 group-hover:scale-125 cursor-pointer"
          />
          
          {/* Tooltip on hover */}
          <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
            <rect 
              x={p.x - 18} 
              y={p.y - 28} 
              width="36" 
              height="20" 
              rx="4" 
              className="fill-brand-dark dark:fill-brand-cream"
            />
            <text 
              x={p.x} 
              y={p.y - 15} 
              textAnchor="middle" 
              className="text-[10px] font-bold fill-brand-cream dark:fill-brand-dark"
            >
              {p.count}
            </text>
          </g>

          {/* X-axis Date Labels */}
          <text 
            x={p.x} 
            y={height - 2} 
            textAnchor="middle" 
            className="text-[10px] fill-brand-textMuted font-medium"
          >
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// EMPTY STATE CHART WRAPPER
function EmptyChartState() {
  return (
    <div className="flex flex-col items-center justify-center h-40 text-sm text-brand-textMuted">
      <span>No metrics available to plot.</span>
    </div>
  );
}
