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
        backgroundColor: '#10B981',
        borderRadius: 5,
        borderSkipped: false,
      },
      {
        label: 'Group avg',
        data: avg,
        backgroundColor: '#BFDBFE',
        borderRadius: 5,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#161b24', // Use theme
        titleColor: '#8b9ab5',
        bodyColor: '#e8edf5',
        borderColor: '#2a3147',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ₹${ctx.parsed.y.toLocaleString('en-IN')}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { font: { size: 10, family: 'DM Sans' }, color: '#8b9ab5', maxRotation: 0 },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        ticks: {
          font: { size: 10, family: 'DM Sans' },
          color: '#8b9ab5',
          callback: (v) => '₹' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v),
        },
        grid: { color: '#2a3147', drawTicks: false },
        border: { display: false, dash: [4, 4] },
      },
    },
    animation: { duration: 600, easing: 'easeOutQuart' },
  };

  return <Bar data={data} options={options} />;
}
