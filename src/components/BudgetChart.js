import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

function BudgetChart({ expenses = [] }) {
  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  if (safeExpenses.length === 0) {
    return <p>Ingen utgifter registrert ennå.</p>;
  }

  // Sorter utgifter etter dato (hvis du har datoer)
  const sorted = [...safeExpenses].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Lag labels og summer
  const labels = sorted.map((e) => e.date || 'Ukjent');
  const dataPoints = sorted.map((e) => e.amount);

  const data = {
    labels,
    datasets: [
      {
        label: 'Utgifter over tid',
        data: dataPoints,
        fill: false,
        borderColor: '#00ffff',
        tension: 0.3,
      },
    ],
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <Line data={data} />
    </div>
  );
}

export default BudgetChart;
