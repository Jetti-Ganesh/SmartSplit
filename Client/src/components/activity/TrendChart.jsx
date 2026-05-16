import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function TrendChart({ labels, mine, avg }) {
  const data = {
    labels,
    datasets: [
      {
        label: 'You',
        data: mine,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.1)'); // Faded emerald
          gradient.addColorStop(1, 'rgba(16, 185, 129, 1)');   // Solid emerald
          return gradient;
        },
        borderRadius: 8,
        borderSkipped: false,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
        hoverBackgroundColor: '#059669',
      },
      {
        label: 'Group avg',
        data: avg,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(96, 165, 250, 0.1)'); // Faded blue
          gradient.addColorStop(1, 'rgba(96, 165, 250, 0.8)'); // Solid blue
          return gradient;
        },
        borderRadius: 8,
        borderSkipped: false,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
        hoverBackgroundColor: '#3B82F6',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)', // Very dark slate with opacity
        titleColor: '#94a3b8',
        bodyColor: '#f8fafc',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        displayColors: true,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: { size: 13, family: "'Outfit', sans-serif", weight: '600' },
        bodyFont: { size: 14, family: "'Syne', sans-serif", weight: '700' },
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ₹${ctx.parsed.y.toLocaleString('en-IN')}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { font: { size: 11, family: "'DM Sans', sans-serif", weight: '500' }, color: '#64748b', maxRotation: 0 },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: 11, family: "'DM Sans', sans-serif", weight: '500' },
          color: '#64748b',
          callback: (v) => '₹' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v),
          padding: 10,
        },
        grid: { color: 'rgba(148, 163, 184, 0.1)', drawTicks: false },
        border: { display: false, dash: [4, 4] },
      },
    },
    animation: { 
      duration: 800, 
      easing: 'easeOutQuart',
    },
  };

  return <Bar data={data} options={options} />;
}
