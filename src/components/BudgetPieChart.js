import React from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';

function BudgetPieChart({ expenses = [] }) {
  // Sikre at expenses er en array
  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  if (safeExpenses.length === 0) {
    return <p>Ingen utgifter registrert ennå.</p>;
  }

  // Gruppér utgifter etter kategori
  const categoryTotals = safeExpenses.reduce((acc, expense) => {
    const category = expense.category || 'Ukjent';
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {});

  const data = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: [
          '#00ffff',
          '#ff00ff',
          '#ffff00',
          '#00ff00',
          '#ff9900',
          '#ff3300',
        ],
      },
    ],
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <Pie data={data} />
    </div>
  );
}

export default BudgetPieChart;
