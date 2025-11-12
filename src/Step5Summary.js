// src/Step5Summary.js
import React from 'react';
import layout from './Step.module.css';

function Step5Summary({ profile, onBack, onNext }) {
  const formatCurrency = (value) => {
    const number = parseFloat(value);
    return isNaN(number) ? '0 kr' : `${number.toLocaleString('no-NO')} kr`;
  };

  const calculateProgress = (goal) => {
    return Math.min(100, Math.round((goal.saved / goal.price) * 100));
  };

  const totalGoalAmount = (profile.goals || []).reduce((sum, g) => sum + g.price, 0);

  return (
    <div className={layout.stepContainer}>
      <h2>📊 Steg 5: Oppsummering</h2>
      <ul style={{ paddingLeft: '20px' }}>
        <li>Voksne: {profile.adults || 1}</li>
        <li>Barn: {profile.children || 1}</li>
        <li>Kosthold: {profile.diet || 'vanlig'}</li>
        <li>Saldo: {formatCurrency(profile.balance || 0)}</li>
        <li>Faste utgifter: {formatCurrency(profile.expensesTotal || 0)}</li>
        <li>Sparemål:</li>
        <ul>
          {(profile.goals || []).map((goal, index) => {
            const progress = calculateProgress(goal);
            return (
              <li key={index}>
                {goal.item} – {formatCurrency(goal.price)} innen {goal.targetDate} ({progress}% spart)
              </li>
            );
          })}
          <li><strong>Totalt:</strong> {formatCurrency(totalGoalAmount)}</li>
        </ul>
      </ul>

      <div style={{ marginTop: '24px' }}>
        <button onClick={onBack} className={layout.nextButton}>Tilbake</button>
        <button onClick={onNext} className={layout.nextButton}>Fullfør</button>
      </div>
    </div>
  );
}

export default Step5Summary;
