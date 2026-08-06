// src/Step6Budget.js
import React, { useEffect, useState } from 'react';
import { AlertCircle, Lightbulb, PieChart } from 'lucide-react';
import IconHeading from './components/ui/IconHeading';
import { buildBudgetPlan } from './utils/budgetEngine';
import { ensureActivePeriod } from './utils/periodEngine';
import layout from './Step.module.css';

function Step6Budget({ profile, setProfile, onNext, onBack }) {
  const [plan, setPlan] = useState(null);
  const [periodeStart, setPeriodeStart] = useState(null);
  const [periodeSlutt, setPeriodeSlutt] = useState(null);
  const [balance, setBalance] = useState(profile.balance || '');

  useEffect(() => {
    if (!balance || !profile?.nextPayoutDate || !profile?.adults) return;

    const next = buildBudgetPlan(profile, balance);
    if (!next) return;

    setPeriodeStart(next.periodeStart);
    setPeriodeSlutt(next.periodeSlutt);
    setPlan(next);
  }, [balance, profile]);

  if (!balance || !profile?.nextPayoutDate || !profile?.adults) {
    return (
      <div className={layout.stepContainer}>
        <IconHeading icon={PieChart} as="h3">Budsjettforslag</IconHeading>
        <p className={layout.metaRow}>
          <AlertCircle size={20} strokeWidth={1.75} aria-hidden="true" />
          <span>Mangler nødvendig data</span>
        </p>
        <ul className={layout.list}>
          {!balance && <li className={layout.listItem}>Ingen saldo registrert</li>}
          {!profile?.nextPayoutDate && <li className={layout.listItem}>Neste utbetalingsdato mangler</li>}
          {!profile?.adults && <li className={layout.listItem}>Antall voksne ikke satt</li>}
        </ul>
        <p>Oppdater husholdningsprofilen og saldoen for å aktivere budsjettplanleggeren.</p>
        <button type="button" onClick={onBack} className={layout.secondaryButton}>Tilbake</button>
      </div>
    );
  }

  if (!plan || !periodeStart || !periodeSlutt) return null;

  const handleFinish = () => {
    const bal = parseFloat(balance) || 0;
    setProfile((prev) => {
      const merged = {
        ...prev,
        balance: bal,
        onboardingComplete: true,
        budgetPlan: plan,
      };
      return ensureActivePeriod(merged);
    });
    onNext();
  };

  return (
    <div className={layout.stepContainer}>
      <IconHeading icon={PieChart}>Budsjettforslag</IconHeading>
      <p><strong>Saldo:</strong> kr {plan.rawBalance}</p>
      <p><strong>Dager til neste utbetaling:</strong> {plan.daysLeft} dager</p>
      <p><strong>Sparing denne perioden:</strong> kr {plan.månedligSparing}</p>
      <p><strong>Disponibelt beløp etter sparing:</strong> kr {plan.available}</p>
      <p><strong>Daglig budsjett:</strong> kr {plan.daily}</p>
      <p><strong>Ukentlig budsjett:</strong> kr {plan.weekly}</p>
      <p><strong>Forventet saldo ved neste lønn:</strong> kr {plan.expectedAtPayday}</p>
      {plan.assessment && (
        <p><strong>{plan.assessment.title}:</strong> {plan.assessment.blurb}</p>
      )}

      <IconHeading icon={PieChart} as="h4">Fordeling</IconHeading>
      <ul className={layout.list}>
        {Object.entries(plan.distribution).map(([key, value]) => (
          <li key={key} className={layout.listItem}>{key}: kr {value}</li>
        ))}
      </ul>

      <p className={layout.hint}>
        <span className={layout.metaRow}>
          <Lightbulb size={20} strokeWidth={1.75} aria-hidden="true" />
          <strong>Kommentar:</strong>
        </span>
        {' '}{plan.kommentar}
      </p>

      <div className={layout.buttonRow}>
        <button type="button" onClick={onBack} className={layout.secondaryButton}>Tilbake</button>
        <button type="button" onClick={handleFinish} className={layout.nextButton}>Fullfør</button>
      </div>
    </div>
  );
}

export default Step6Budget;
