// src/Step6Budget.js
import React, { useEffect, useState } from 'react';
import layout from './Step.module.css';

function Step6Budget({ profile, setProfile, onNext, onBack }) {
  const [plan, setPlan] = useState(null);
  const [periodeStart, setPeriodeStart] = useState(null);
  const [periodeSlutt, setPeriodeSlutt] = useState(null);
  const [balance, setBalance] = useState(profile.balance || '');
  const goals = profile.goals || [];

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

  useEffect(() => {
    if (!balance || !profile?.nextPayoutDate || !profile?.adults) return;

    const rawBalance = parseFloat(balance);
    const payoutDate = new Date(profile.nextPayoutDate);
    const today = new Date();
    const daysLeft = Math.max(1, Math.ceil((payoutDate - today) / (1000 * 60 * 60 * 24)));

    const aktiveMål = goals.filter(g => g.active);
    const månedligSparingForeslått = aktiveMål.reduce((sum, goal) => {
      const deadline = new Date(goal.targetDate);
      const monthsLeft = Math.max(1, (deadline.getFullYear() - today.getFullYear()) * 12 + (deadline.getMonth() - today.getMonth()));
      const remaining = Math.max(0, goal.price - (goal.saved || 0));
      return sum + Math.ceil(remaining / monthsLeft);
    }, 0);

    // Buffer for faste utgifter og mat
    const boligBuffer = rawBalance * 0.3;
    const transportBuffer = rawBalance * 0.1;
    const fritidBuffer = rawBalance * 0.25;
    const minimumBuffer = boligBuffer + transportBuffer + matUtgiftAnbefalt;

    const justertSparing = rawBalance > minimumBuffer + 1000
      ? Math.min(månedligSparingForeslått, rawBalance - minimumBuffer)
      : 0;

    const available = Math.max(0, rawBalance - justertSparing);
    const daily = Math.floor(available / daysLeft);
    const weekly = Math.min(daily * 7, available); // realistisk ukebudsjett

    // Fordeling som aldri overstiger available
    const bolig = Math.round(available * 0.3);
    const transport = Math.round(available * 0.1);
    const fritid = Math.round(available * 0.25);
    const matRest = available - (bolig + transport + fritid);
    const mat = Math.max(0, Math.min(matUtgiftAnbefalt, matRest));

    const distribution = {
      Bolig: bolig,
      Mat: mat,
      Transport: transport,
      Sparing: justertSparing,
      Fritid: fritid,
    };

    const start = new Date(payoutDate);
    start.setMonth(start.getMonth() - 1);

    const kommentar = justertSparing < månedligSparingForeslått
      ? `Sparingen er justert ned fra kr ${månedligSparingForeslått} til kr ${justertSparing} fordi det er ${daysLeft} dager igjen til neste utbetaling og saldoen bør dekke nødvendige utgifter først.`
      : `Sparingen er satt til kr ${justertSparing} i tråd med dine aktive mål.`

    setPeriodeStart(start);
    setPeriodeSlutt(payoutDate);

    setPlan({
      rawBalance,
      månedligSparing: justertSparing,
      available,
      daily,
      weekly,
      distribution,
      daysLeft,
      kommentar
    });
  }, [balance, goals, profile]);

  if (!balance || !profile?.nextPayoutDate || !profile?.adults) {
    return (
      <div className={layout.stepContainer}>
        <h3>📐 Budsjettforslag</h3>
        <p>⚠️ Mangler nødvendig data:</p>
        <ul>
          {!balance && <li>– Ingen saldo registrert</li>}
          {!profile?.nextPayoutDate && <li>– Neste utbetalingsdato mangler</li>}
          {!profile?.adults && <li>– Antall voksne ikke satt</li>}
        </ul>
        <p>Oppdater husholdningsprofilen og saldoen for å aktivere budsjettplanleggeren.</p>
        <button onClick={onBack} className={layout.nextButton}>Tilbake</button>
      </div>
    );
  }

  if (!plan || !periodeStart || !periodeSlutt) return null;

  return (
    <div className={layout.stepContainer}>
      <h2>📐 Steg 6: Budsjettforslag</h2>
      <p><strong>Saldo:</strong> kr {plan.rawBalance}</p>
      <p><strong>Dager til neste utbetaling:</strong> {plan.daysLeft} dager</p>
      <p><strong>Månedlig sparing (justert):</strong> kr {plan.månedligSparing}</p>
      <p><strong>Disponibelt beløp etter sparing:</strong> kr {plan.available}</p>
      <p><strong>Daglig budsjett:</strong> kr {plan.daily}</p>
      <p><strong>Ukentlig budsjett:</strong> kr {plan.weekly}</p>

      <h4 style={{ marginTop: '20px' }}>📊 Fordeling</h4>
      <ul style={{ paddingLeft: '20px' }}>
        {Object.entries(plan.distribution).map(([key, value]) => (
          <li key={key}>{key}: kr {value}</li>
        ))}
      </ul>

      <div style={{ marginTop: '20px', fontStyle: 'italic', color: '#ccc' }}>
        💡 <strong>AI-kommentar:</strong> {plan.kommentar}
      </div>

      <div style={{ marginTop: '24px' }}>
        <button onClick={onBack} className={layout.nextButton}>Tilbake</button>
        <button onClick={onNext} className={layout.nextButton}>Fullfør</button>
      </div>
    </div>
  );
}

export default Step6Budget;
