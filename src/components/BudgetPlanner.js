import React, { useEffect, useState } from 'react';

function BudgetPlanner({ balance, goals, profile }) {
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    if (!balance || !profile?.nextPayoutDate) return;

    const rawBalance = parseFloat(balance);

    const totalSavingsGoal = Array.isArray(goals)
      ? goals.reduce((sum, g) => sum + ((g.target || 0) - (g.saved || 0)), 0)
      : 0;

    const available = Math.max(0, rawBalance - totalSavingsGoal);

    const payoutDate = new Date(profile.nextPayoutDate);
    const today = new Date();
    const daysLeft = Math.max(1, Math.ceil((payoutDate - today) / (1000 * 60 * 60 * 24)));

    const daily = Math.floor(available / daysLeft);
    const weekly = daily * 7;

    const distribution = {
      Bolig: Math.round(available * 0.3),
      Mat: Math.round(available * 0.15),
      Transport: Math.round(available * 0.1),
      Sparing: Math.round(available * 0.2),
      Fritid: Math.round(available * 0.25),
    };

    setPlan({
      rawBalance,
      totalSavingsGoal,
      available,
      daily,
      weekly,
      distribution,
    });
  }, [balance, goals, profile]);

  if (!plan) return null;

  return (
    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
      <h3>📐 Budsjettforslag</h3>
      <p><strong>Saldo:</strong> kr {plan.rawBalance}</p>
      <p><strong>Utestående sparemål:</strong> kr {plan.totalSavingsGoal}</p>
      <p><strong>Disponibelt beløp:</strong> kr {plan.available}</p>
      <p><strong>Daglig budsjett:</strong> kr {plan.daily}</p>
      <p><strong>Ukentlig budsjett:</strong> kr {plan.weekly}</p>

      <h4>📊 Fordeling</h4>
      <ul>
        {Object.entries(plan.distribution).map(([key, value]) => (
          <li key={key}>{key}: kr {value}</li>
        ))}
      </ul>
    </div>
  );
}

export default BudgetPlanner;


