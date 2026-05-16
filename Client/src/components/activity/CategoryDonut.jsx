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
        hoverBackgroundColor: categories.map((c) => c.color),
        borderWidth: 3,
        borderColor: 'transparent',
        hoverBorderColor: '#fff',
        hoverBorderWidth: 3,
        hoverOffset: 10,
        spacing: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        titleColor: '#94a3b8',
        bodyColor: '#f8fafc',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 14,
        cornerRadius: 12,
        displayColors: true,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: { size: 13, family: "'Outfit', sans-serif", weight: '600' },
        bodyFont: { size: 15, family: "'Syne', sans-serif", weight: '800' },
        callbacks: {
          title: (items) => categories[items[0].dataIndex].name,
          label: (ctx) =>
            ` ₹${ctx.parsed.toLocaleString('en-IN')}  (${categories[ctx.dataIndex].pct}%)`,
        },
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
