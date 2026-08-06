// src/Step4Goals.js
import React, { useRef, useState } from 'react';
import { ListTodo, Target } from 'lucide-react';
import DateInput from './components/DateInput';
import IconHeading from './components/ui/IconHeading';
import layout from './Step.module.css';
import { isoToNo, isValidIsoDate, noToIso } from './utils/dates';
import { numberInputValue, parseNumberInput, toStoredNumber } from './utils/numbers';

function Step4Goals({ profile, setProfile, onNext, onBack }) {
  const [goals, setGoals] = useState(profile.goals || []);
  const [item, setItem] = useState('');
  const [price, setPrice] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [saved, setSaved] = useState('');
  const [formError, setFormError] = useState('');
  const dateInputRef = useRef(null);

  const addGoal = () => {
    const committedDate = dateInputRef.current?.commit?.() || targetDate;
    const resolvedDate =
      committedDate ||
      (isValidIsoDate(noToIso(targetDate)) ? noToIso(targetDate) : targetDate);

    if (!item.trim()) {
      setFormError('Skriv inn hva du vil spare til.');
      return;
    }
    if (price === '' || price === null) {
      setFormError('Oppgi en pris.');
      return;
    }
    if (!resolvedDate) {
      setFormError('Oppgi ønsket dato som dd.mm.åååå (f.eks. 01.09.2026).');
      return;
    }

    const newGoal = {
      item: item.trim(),
      price: toStoredNumber(price, 0),
      targetDate: resolvedDate,
      saved: toStoredNumber(saved, 0),
      active: true
    };
    setGoals([...goals, newGoal]);
    setItem('');
    setPrice('');
    setTargetDate('');
    setSaved('');
    setFormError('');
  };

  const updateSavedAmount = (index, value) => {
    const updated = [...goals];
    updated[index].saved = value === '' ? '' : parseNumberInput(value);
    setGoals(updated);
  };

  const toggleGoalActive = (index) => {
    const updated = [...goals];
    updated[index].active = !updated[index].active;
    setGoals(updated);
  };

  const formatCurrency = (value) => {
    const number = parseFloat(value);
    return isNaN(number) ? '0 kr' : `${number.toLocaleString('no-NO')} kr`;
  };

  const calculateProgress = (goal) => {
    const savedAmount = toStoredNumber(goal.saved, 0);
    return Math.min(100, Math.round((savedAmount / goal.price) * 100));
  };

  const calculateSavings = (goal) => {
    const today = new Date();
    const deadline = new Date(goal.targetDate);
    const daysLeft = Math.max(1, Math.ceil((deadline - today) / (1000 * 60 * 60 * 24)));
    const weeksLeft = Math.ceil(daysLeft / 7);
    const monthsLeft = Math.max(1, Math.ceil(daysLeft / 30));
    const remaining = Math.max(0, goal.price - toStoredNumber(goal.saved, 0));
    return {
      remaining,
      monthly: Math.ceil(remaining / monthsLeft),
      weekly: Math.ceil(remaining / weeksLeft)
    };
  };

  const handleNext = () => {
    const normalized = goals.map(goal => ({
      ...goal,
      saved: toStoredNumber(goal.saved, 0),
    }));
    setProfile({ ...profile, goals: normalized });
    onNext();
  };

  return (
    <div className={layout.stepContainer}>
      <IconHeading icon={Target}>Sparemål</IconHeading>
      <p className={layout.muted}>Legg til mål du sparer til, eller hopp over.</p>

      <label>Hva vil du spare til?</label>
      <input
        type="text"
        value={item}
        onChange={e => {
          setItem(e.target.value);
          setFormError('');
        }}
        placeholder="F.eks. ny sykkel"
      />

      <label>Pris (kr)</label>
      <input
        type="number"
        value={numberInputValue(price)}
        onChange={e => {
          setPrice(parseNumberInput(e.target.value));
          setFormError('');
        }}
        placeholder="F.eks. 4500"
      />

      <label>Ønsket dato</label>
      <DateInput
        ref={dateInputRef}
        value={targetDate}
        onChange={(value) => {
          setTargetDate(value);
          setFormError('');
        }}
        className={layout.field}
      />

      <label>Allerede spart (kr)</label>
      <input
        type="number"
        value={numberInputValue(saved)}
        onChange={e => setSaved(parseNumberInput(e.target.value))}
        placeholder="F.eks. 500"
      />

      {formError ? (
        <p style={{ color: 'var(--mairim-danger)', margin: 0, fontSize: 13 }}>{formError}</p>
      ) : null}

      <button type="button" onClick={addGoal} className={layout.secondaryButton}>
        Legg til mål
      </button>

      <IconHeading icon={ListTodo} as="h4">Dine sparemål</IconHeading>
      {goals.length === 0 ? (
        <p className={layout.muted}>Ingen mål lagt til ennå.</p>
      ) : (
        <ul className={layout.list}>
          {goals.map((goal, index) => {
            const { remaining, monthly, weekly } = calculateSavings(goal);
            const progress = calculateProgress(goal);
            return (
              <li key={index} className={layout.listItem} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <strong>{goal.item}</strong>
                <span className={layout.muted}>
                  {formatCurrency(goal.price)} innen {isoToNo(goal.targetDate)}
                </span>
                <label>
                  Allerede spart
                  <input
                    type="number"
                    value={numberInputValue(goal.saved === 0 ? '' : goal.saved)}
                    onChange={e => updateSavedAmount(index, e.target.value)}
                    placeholder="0"
                    style={{ marginTop: 8 }}
                  />
                </label>
                <p className={layout.muted}>Gjenstår: {formatCurrency(remaining)}</p>
                <p className={layout.muted}>Månedlig sparing: {formatCurrency(monthly)}</p>
                <p className={layout.muted}>Ukentlig sparing: {formatCurrency(weekly)}</p>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 0 }}>
                  <input
                    type="checkbox"
                    checked={goal.active}
                    onChange={() => toggleGoalActive(index)}
                    style={{ width: 'auto' }}
                  />
                  Prioriter dette målet
                </label>
                <div className={layout.progressTrack}>
                  <div
                    className={layout.progressFill}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className={layout.muted}>{progress}% spart</p>
              </li>
            );
          })}
        </ul>
      )}

      <div className={layout.buttonRow}>
        <button type="button" onClick={onBack} className={layout.secondaryButton}>Tilbake</button>
        <button type="button" onClick={handleNext} className={layout.secondaryButton}>Hopp over</button>
        <button type="button" onClick={handleNext} className={layout.nextButton}>Neste</button>
      </div>
    </div>
  );
}

export default Step4Goals;
