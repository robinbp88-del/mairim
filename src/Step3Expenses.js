// src/Step3Expenses.js
import React, { useState } from 'react';
import ExpenseList from './components/ExpenseList';
import layout from './Step.module.css';

function Step3Expenses({ profile, setProfile, onNext, onBack }) {
  const [expenses, setExpenses] = useState(profile.expenses || []);

  const handleNext = () => {
    const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const unpaidExpenses = expenses.filter(e => !e.paid); // 👈 filtrer ubetalte
    setProfile({
      ...profile,
      expenses,
      expensesTotal: totalExpenses,
      unpaidExpenses // 👈 lagre separat
    });
    onNext();
  };

  const formatCurrency = (value) => {
    const number = parseFloat(value);
    return isNaN(number) ? '0 kr' : `${number.toLocaleString('no-NO')} kr`;
  };

  const available = parseFloat(profile.balance) || 0;

  return (
    <div className={layout.stepContainer}>
      <h2>📉 Steg 3: Utgifter</h2>

      <p style={{ marginBottom: '12px' }}>
        💰 <strong>Disponibelt beløp:</strong> {formatCurrency(available)}
      </p>

      <ExpenseList
        expenses={expenses}
        setExpenses={setExpenses}
        profile={profile}
      />

      <div style={{ marginTop: '24px' }}>
        <button onClick={onBack} className={layout.nextButton}>Tilbake</button>
        <button onClick={handleNext} className={layout.nextButton}>Neste</button>
      </div>
    </div>
  );
}

export default Step3Expenses;




