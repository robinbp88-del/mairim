// src/Step1Economy.js — husholdning + inntekt/saldo i ett steg
import React, { useState } from 'react';
import { Wallet } from 'lucide-react';
import DateInput from './components/DateInput';
import IconHeading from './components/ui/IconHeading';
import layout from './Step.module.css';
import { numberInputValue, parseNumberInput, toStoredNumber } from './utils/numbers';

function Step1Economy({ profile = {}, setProfile, onNext, onBack }) {
  const [adults, setAdults] = useState(
    profile.adults === 0 || profile.adults ? profile.adults : ''
  );
  const [children, setChildren] = useState(
    profile.children === 0 || profile.children ? profile.children : ''
  );
  const [income, setIncome] = useState(
    profile.income === 0 || profile.income ? profile.income : ''
  );
  const [balance, setBalance] = useState(
    profile.balance === 0 || profile.balance ? profile.balance : ''
  );
  const [nextPayoutDate, setNextPayoutDate] = useState(profile.nextPayoutDate || '');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (balance === '' || balance === null) {
      setError('Oppgi nåværende saldo.');
      return;
    }
    if (!nextPayoutDate) {
      setError('Oppgi neste utbetalingsdato (dd.mm.åååå).');
      return;
    }

    setProfile({
      ...profile,
      adults: toStoredNumber(adults, 1),
      children: toStoredNumber(children, 0),
      diet: profile.diet || 'vanlig',
      income: toStoredNumber(income, 0),
      balance: toStoredNumber(balance, 0),
      nextPayoutDate,
    });
    onNext();
  };

  return (
    <div className={layout.stepContainer}>
      <IconHeading icon={Wallet}>Din økonomi</IconHeading>
      <p className={layout.muted}>Fortell litt om husholdningen og pengene dine.</p>

      <label htmlFor="adults">Antall voksne</label>
      <input
        id="adults"
        type="number"
        min="0"
        placeholder="F.eks. 2"
        value={numberInputValue(adults)}
        onChange={e => setAdults(parseNumberInput(e.target.value))}
      />

      <label htmlFor="children">Antall barn</label>
      <input
        id="children"
        type="number"
        min="0"
        placeholder="F.eks. 1"
        value={numberInputValue(children)}
        onChange={e => setChildren(parseNumberInput(e.target.value))}
      />

      <label>Månedlig inntekt (valgfritt)</label>
      <input
        type="number"
        value={numberInputValue(income)}
        onChange={e => setIncome(parseNumberInput(e.target.value))}
        placeholder="F.eks. 32000"
      />

      <label>Nåværende saldo</label>
      <input
        type="number"
        value={numberInputValue(balance)}
        onChange={e => {
          setBalance(parseNumberInput(e.target.value));
          setError('');
        }}
        placeholder="F.eks. 8500"
      />

      <label>Neste utbetaling</label>
      <DateInput
        value={nextPayoutDate}
        onChange={(value) => {
          setNextPayoutDate(value);
          setError('');
        }}
        className={layout.field}
      />

      {error ? (
        <p style={{ color: 'var(--mairim-danger)', margin: 0, fontSize: 13 }}>{error}</p>
      ) : null}

      <div className={layout.buttonRow}>
        <button type="button" onClick={onBack} className={layout.secondaryButton}>Tilbake</button>
        <button type="button" onClick={handleNext} className={layout.nextButton}>Neste</button>
      </div>
    </div>
  );
}

export default Step1Economy;
