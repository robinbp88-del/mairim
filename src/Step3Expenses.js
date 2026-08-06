// src/Step3Expenses.js
import React, { useState } from 'react';
import { Banknote, Receipt } from 'lucide-react';
import ExpenseList from './components/ExpenseList';
import IconHeading from './components/ui/IconHeading';
import { ICON_SIZE, ICON_STROKE } from './components/ui/iconProps';
import layout from './Step.module.css';

function Step3Expenses({ profile, setProfile, onNext, onBack }) {
  const [expenses, setExpenses] = useState(profile.expenses || []);

  const handleNext = () => {
    const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const unpaidExpenses = expenses.filter(e => !e.paid);
    setProfile({
      ...profile,
      expenses,
      expensesTotal: totalExpenses,
      unpaidExpenses
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
      <IconHeading icon={Receipt}>Utgifter</IconHeading>
      <p className={layout.muted}>Legg til faste utgifter, eller hopp over.</p>

      <p className={layout.metaRow}>
        <Banknote size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden="true" />
        <span>
          <strong>Disponibelt beløp:</strong> {formatCurrency(available)}
        </span>
      </p>

      <ExpenseList
        expenses={expenses}
        setExpenses={setExpenses}
        profile={profile}
      />

      <div className={layout.buttonRow}>
        <button type="button" onClick={onBack} className={layout.secondaryButton}>Tilbake</button>
        <button type="button" onClick={handleNext} className={layout.secondaryButton}>Hopp over</button>
        <button type="button" onClick={handleNext} className={layout.nextButton}>Neste</button>
      </div>
    </div>
  );
}

export default Step3Expenses;
