import React, { useEffect, useState } from 'react';
import BudgetProgress from './BudgetProgress';

function BudgetPlanner({ balance, goals, profile, expenses }) {
  const [plan, setPlan] = useState(null);
  const [periodeStart, setPeriodeStart] = useState(null);
  const [periodeSlutt, setPeriodeSlutt] = useState(null);

  // 🔍 Debug-logg
  useEffect(() => {
    console.log('BudgetPlanner props:', { balance, goals, profile });
  }, [balance, goals, profile]);

  const kostnadsfaktor = {
    vanlig: 1,
    vegetar: 0.9,
    vegan: 0.85,
    lavkarbo: 1.1
  };

  const dietFaktor = kostnadsfaktor[profile?.diet] || 1;
  const matPerVoksen = 3000 * dietFaktor;
  const matPerBarn = 1800 * dietFaktor;
  const matUtgiftAnbefalt = Math.round((profile?.adults || 1) * matPerVoksen + (profile?.children || 0) * matPerBarn);

  const budsjettFordeling = {
    mat: matUtgiftAnbefalt / (parseFloat(balance || 0) || 1),
    transport: 0.1,
    fritid: 0.15,
    bolig: 0.3,
    sparing: 0.15
  };

  useEffect(() => {
    if (!balance || !profile?.nextPayoutDate || !profile?.adults) return;

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
      Mat: matUtgiftAnbefalt,
      Transport: Math.round(available * 0.1),
      Sparing: Math.round(available * 0.2),
      Fritid: Math.round(available * 0.25),
    };

    const start = new Date(payoutDate);
    start.setMonth(start.getMonth() - 1);

    setPeriodeStart(start);
    setPeriodeSlutt(payoutDate);

    setPlan({
      rawBalance,
      totalSavingsGoal,
      available,
      daily,
      weekly,
      distribution
    });
  }, [balance, goals, profile]);

  // ⚠️ Fallback hvis data mangler
  if (!balance || !profile?.nextPayoutDate || !profile?.adults) {
    return (
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#1e1e1e', borderRadius: '8px', color: '#f0f0f0' }}>
        <h3>📐 Budsjettforslag</h3>
        <p>⚠️ Mangler nødvendig data:</p>
        <ul>
          {!balance && <li>– Ingen saldo registrert</li>}
          {!profile?.nextPayoutDate && <li>– Neste utbetalingsdato mangler</li>}
          {!profile?.adults && <li>– Antall voksne ikke satt</li>}
        </ul>
        <p>Oppdater husholdningsprofilen og saldoen for å aktivere budsjettplanleggeren.</p>
      </div>
    );
  }

  // ✅ Hovedvisning
  if (!plan || !periodeStart || !periodeSlutt) return null;

  return (
    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#1e1e1e', borderRadius: '8px', color: '#f0f0f0' }}>
      <h3>📐 Budsjettforslag</h3>
      <p><strong>Saldo:</strong> kr {plan.rawBalance}</p>
      <p><strong>Utestående sparemål:</strong> kr {plan.totalSavingsGoal}</p>
      <p><strong>Disponibelt beløp:</strong> kr {plan.available}</p>
      <p><strong>Daglig budsjett:</strong> kr {plan.daily}</p>
      <p><strong>Ukentlig budsjett:</strong> kr {plan.weekly}</p>

      <h4 style={{ marginTop: '20px' }}>📊 Fordeling</h4>
      <ul style={{ paddingLeft: '20px' }}>
        {Object.entries(plan.distribution).map(([key, value]) => (
          <li key={key}>{key}: kr {value}</li>
        ))}
      </ul>

      <h4 style={{ marginTop: '20px' }}>📈 Fremdrift per kategori</h4>
      {Object.entries(budsjettFordeling).map(([kategori, andel]) => (
        <BudgetProgress
          key={kategori}
          category={kategori}
          label={kategori.charAt(0).toUpperCase() + kategori.slice(1)}
          share={andel}
          totalBudget={plan.available}
          expenses={expenses}
          periodStart={periodeStart}
          periodEnd={periodeSlutt}
        />
      ))}
    </div>
  );
}

export default BudgetPlanner;
