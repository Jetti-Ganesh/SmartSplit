import React, { useMemo } from 'react';
import '../../styles/Activity.css'; // Relies on shared activity styles

export default function SpendHeatmap({ data }) {
  // data.labels and data.mine expected from the backend trend
  const { labels, mine } = data;

  const heatmapData = useMemo(() => {
    if (!labels || !mine) return [];
    
    // Create an array of day objects
    const days = labels.map((label, index) => ({
      date: label,
      amount: mine[index] || 0
    }));

    // Find the max amount to calculate intensity
    const maxAmount = Math.max(...mine, 1); // Avoid division by zero

    return days.map(day => {
      let intensity = 0;
      if (day.amount > 0) {
        // Calculate intensity from 1 to 4 based on max amount
        const ratio = day.amount / maxAmount;
        if (ratio > 0.75) intensity = 4;
        else if (ratio > 0.5) intensity = 3;
        else if (ratio > 0.25) intensity = 2;
        else intensity = 1;
      }

      return {
        ...day,
        intensity
      };
    });
  }, [labels, mine]);

  if (heatmapData.length === 0) return null;

  return (
    <div className="heatmap-container">
      <div className="heatmap-grid">
        {heatmapData.map((day, i) => (
          <div 
            key={i} 
            className={`heatmap-cell intensity-${day.intensity}`}
            title={`${day.date}: ₹${day.amount.toLocaleString('en-IN')}`}
          >
            {/* Tooltip on hover is handled natively via title */}
          </div>
        ))}
      </div>
      <div className="heatmap-legend">
        <span className="legend-text">Less</span>
        <div className="heatmap-cell intensity-0"></div>
        <div className="heatmap-cell intensity-1"></div>
        <div className="heatmap-cell intensity-2"></div>
        <div className="heatmap-cell intensity-3"></div>
        <div className="heatmap-cell intensity-4"></div>
        <span className="legend-text">More</span>
      </div>
    </div>
  );
}
