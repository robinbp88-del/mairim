// src/Step2Income.js
import React, { useState } from 'react';
import layout from './Step.module.css';

function Step2Income({ profile, setProfile, onNext, onBack }) {
  const [income, setIncome] = useState(profile.income || '');
  const [balance, setBalance] = useState(profile.balance || '');
  const [nextPayoutDate, setNextPayoutDate] = useState(profile.nextPayoutDate || '');

  const kostnadsfaktor = {
    vanlig: 1,
    vegetar: 0.9,
    vegan: 0.85,
    lavkarbo: 1.1
  };

  const dietFaktor = kostnadsfaktor[profile.diet] || 1;
  const matPerVoksen = 3000 * dietFaktor;
  const matPerBarn = 1800 * dietFaktor;
  const matUtgiftAnbefalt = Math.round(profile.adults * matPerVoksen + profile.children * matPerBarn);

  const handleNext = () => {
    setProfile({ ...profile, income, balance, nextPayoutDate });
    onNext();
  };

  return (
    <div className={layout.stepContainer}>
      <h2>💰 Steg 2: Inntekt og saldo</h2>

      <label>Månedlig inntekt:</label>
      <input
        type="number"
        value={income}
        onChange={e => setIncome(e.target.value)}
        placeholder="F.eks. 32000"
      />

      <label>Nåværende bankkonto-saldo:</label>
      <input
        type="number"
        value={balance}
        onChange={e => setBalance(e.target.value)}
        placeholder="F.eks. 8500"
      />

      <label>Neste utbetaling:</label>
      <input
        type="date"
        value={nextPayoutDate}
        onChange={e => setNextPayoutDate(e.target.value)}
      />

      <p style={{ marginTop: '16px' }}>
        🍽️ <strong>Anbefalt matbudsjett:</strong> kr {matUtgiftAnbefalt}
      </p>

      <div style={{ marginTop: '24px' }}>
        <button onClick={onBack} className={layout.nextButton}>Tilbake</button>
        <button onClick={handleNext} className={layout.nextButton}>Neste</button>
      </div>
    </div>
  );
}

export default Step2Income;

