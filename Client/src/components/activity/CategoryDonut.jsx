import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function CategoryDonut({ categories, onCategoryClick }) {
  const data = {
    labels: categories.map((c) => c.name),
    datasets: [
      {
        data: categories.map((c) => c.amount),
        backgroundColor: categories.map((c) => c.color),
        borderWidth: 2,
        borderColor: 'var(--card-bg, #161b24)',
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '62%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#161b24',
        titleColor: '#8b9ab5',
        bodyColor: '#e8edf5',
        borderColor: '#2a3147',
        borderWidth: 1,
        callbacks: {
          label: (ctx) => ` ₹${ctx.parsed.toLocaleString('en-IN')} (${categories[ctx.dataIndex].pct}%)`,
        },
      },
    },
    onClick: (evt, els) => {
      if (!els.length) return;
      const catName = categories[els[0].index].name;
      if (onCategoryClick) onCategoryClick(catName);
    },
    animation: { duration: 600 },
  };

  return <Doughnut data={data} options={options} />;
}
