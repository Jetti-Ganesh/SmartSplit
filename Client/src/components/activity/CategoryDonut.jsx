import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useRef } from 'react';

ChartJS.register(ArcElement, Tooltip, Legend);

// Custom external tooltip renderer — renders as an HTML element outside the canvas
function getOrCreateTooltip(chart) {
  let tooltipEl = chart.canvas.parentNode.querySelector('.donut-ext-tooltip');
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'donut-ext-tooltip';
    tooltipEl.style.cssText = `
      position: absolute;
      pointer-events: none;
      transition: all 0.15s ease;
      z-index: 100;
      white-space: nowrap;
    `;
    chart.canvas.parentNode.style.position = 'relative';
    chart.canvas.parentNode.appendChild(tooltipEl);
  }
  return tooltipEl;
}

function externalTooltipHandler(context, categories) {
  const { chart, tooltip } = context;
  const tooltipEl = getOrCreateTooltip(chart);

  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = '0';
    return;
  }

  if (tooltip.body) {
    const idx = tooltip.dataPoints[0].dataIndex;
    const cat = categories[idx];

    // Determine if we are in dark mode
    const isDark = document.body.classList.contains('dark');

    tooltipEl.innerHTML = `
      <div style="
        background: ${isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.97)'};
        border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'};
        border-radius: 12px;
        padding: 10px 14px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.18);
        min-width: 140px;
      ">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
          <span style="font-size:18px">${cat.emoji}</span>
          <span style="
            font-size:13px;font-weight:700;
            color:${isDark ? '#f1f5f9' : '#1e293b'};
            font-family:'Outfit',sans-serif;
          ">${cat.name}</span>
        </div>
        <div style="display:flex;align-items:baseline;gap:6px;">
          <div style="
            width:8px;height:8px;border-radius:50%;
            background:${cat.color};flex-shrink:0;margin-top:2px;
          "></div>
          <span style="
            font-size:17px;font-weight:800;
            color:${cat.color};
            font-family:'Syne',sans-serif;letter-spacing:-0.5px;
          ">₹${cat.amount.toLocaleString('en-IN')}</span>
        </div>
        <div style="
          font-size:11px;font-weight:600;margin-top:4px;
          color:${isDark ? '#64748b' : '#94a3b8'};
          font-family:'DM Sans',sans-serif;
        ">${cat.pct}% of total spending</div>
      </div>
    `;
  }

  const { offsetLeft, offsetTop } = chart.canvas;
  const canvasWidth = chart.canvas.offsetWidth;
  const canvasHeight = chart.canvas.offsetHeight;
  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    // Mobile: Show at the BOTTOM of the chart area as a fixed-position pill
    const tooltipWidth = tooltipEl.offsetWidth || 180;
    const x = offsetLeft + (canvasWidth / 2) - (tooltipWidth / 2);
    const y = offsetTop + canvasHeight + 10; // 10px below the canvas
    
    tooltipEl.style.opacity = '1';
    tooltipEl.style.left = x + 'px';
    tooltipEl.style.top = y + 'px';
    tooltipEl.style.whiteSpace = 'normal'; // Allow wrapping if needed
  } else {
    // Desktop: Place tooltip to the RIGHT of the chart
    const x = offsetLeft + canvasWidth + 8;
    const y = offsetTop + tooltip.caretY - 50;
    
    tooltipEl.style.opacity = '1';
    tooltipEl.style.left = x + 'px';
    tooltipEl.style.top = Math.max(0, y) + 'px';
    tooltipEl.style.whiteSpace = 'nowrap';
  }
}

export default function CategoryDonut({ categories, onCategoryClick }) {
  const data = {
    labels: categories.map((c) => c.name),
    datasets: [
      {
        data: categories.map((c) => c.amount),
        backgroundColor: categories.map((c) => c.color),
        hoverBackgroundColor: categories.map((c) => c.color),
        hoverOffset: 0,
        spacing: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '80%',
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: false,
        external: (context) => externalTooltipHandler(context, categories),
      },
    },
    onClick: (evt, els) => {
      if (!els.length) return;
      const catName = categories[els[0].index].name;
      if (onCategoryClick) onCategoryClick(catName);
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 900,
      easing: 'easeOutQuart',
    },
  };

  return <Doughnut data={data} options={options} />;
}
