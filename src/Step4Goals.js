// src/Step4Goals.js
import React, { useState } from 'react';
import layout from './Step.module.css';

function Step4Goals({ profile, setProfile, onNext, onBack }) {
  const [goals, setGoals] = useState(profile.goals || []);
  const [item, setItem] = useState('');
  const [price, setPrice] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [saved, setSaved] = useState('');

  const addGoal = () => {
    if (!item || !price || !targetDate) return;
    const newGoal = {
      item,
      price: parseFloat(price),
      targetDate,
      saved: parseFloat(saved) || 0,
      active: true
    };
    setGoals([...goals, newGoal]);
    setItem('');
    setPrice('');
    setTargetDate('');
    setSaved('');
  };

  const updateSavedAmount = (index, value) => {
    const updated = [...goals];
    updated[index].saved = parseFloat(value) || 0;
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
    return Math.min(100, Math.round((goal.saved / goal.price) * 100));
  };

  const calculateSavings = (goal) => {
    const today = new Date();
    const deadline = new Date(goal.targetDate);
    const daysLeft = Math.max(1, Math.ceil((deadline - today) / (1000 * 60 * 60 * 24)));
    const weeksLeft = Math.ceil(daysLeft / 7);
    const monthsLeft = Math.max(1, Math.ceil(daysLeft / 30));
    const remaining = Math.max(0, goal.price - (goal.saved || 0));
    return {
      remaining,
      monthly: Math.ceil(remaining / monthsLeft),
      weekly: Math.ceil(remaining / weeksLeft)
    };
  };

  const handleNext = () => {
    setProfile({ ...profile, goals });
    onNext(); // ✅ Gå videre til Step5Summary
  };

  return (
    <div className={layout.stepContainer}>
      <h2>🎯 Steg 4: Sparemål</h2>

      <label>Hva vil du spare til?</label>
      <input type="text" value={item} onChange={e => setItem(e.target.value)} placeholder="F.eks. ny sykkel" />

      <label>Pris (kr):</label>
      <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="F.eks. 4500" />

      <label>Ønsket dato:</label>
      <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />

      <label>Allerede spart (kr):</label>
      <input type="number" value={saved} onChange={e => setSaved(e.target.value)} placeholder="F.eks. 500" />

      <button onClick={addGoal} className={layout.nextButton} style={{ marginTop: '12px' }}>Legg til mål</button>

      <h4 style={{ marginTop: '24px' }}>🗂️ Dine sparemål</h4>
      {goals.length === 0 ? (
        <p>Ingen mål lagt til ennå.</p>
      ) : (
        <ul style={{ paddingLeft: '20px' }}>
          {goals.map((goal, index) => {
            const { remaining, monthly, weekly } = calculateSavings(goal);
            const progress = calculateProgress(goal);
            return (
              <li key={index} style={{ marginBottom: '20px' }}>
                <strong>{goal.item}</strong> – {formatCurrency(goal.price)} innen {goal.targetDate}
                <br />
                <label>
                  Allerede spart:
                  <input
                    type="number"
                    value={goal.saved}
                    onChange={e => updateSavedAmount(index, e.target.value)}
                    style={{ marginLeft: '8px', width: '100px' }}
                  />
                </label>
                <br />
                Gjenstår: {formatCurrency(remaining)}  
                <br />
                📆 Månedlig sparing: {formatCurrency(monthly)}  
                <br />
                📆 Ukentlig sparing: {formatCurrency(weekly)}
                <br />
                <label>
                  <input
                    type="checkbox"
                    checked={goal.active}
                    onChange={() => toggleGoalActive(index)}
                    style={{ marginRight: '6px' }}
                  />
                  Prioriter dette målet
                </label>
                <div style={{ background: '#ddd', height: '10px', borderRadius: '4px', marginTop: '6px' }}>
                  <div style={{
                    width: `${progress}%`,
                    background: '#4caf50',
                    height: '100%',
                    borderRadius: '4px'
                  }} />
                </div>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>{progress}% spart</p>
              </li>
            );
          })}
        </ul>
      )}

      <div style={{ marginTop: '24px' }}>
        <button onClick={onBack} className={layout.nextButton}>Tilbake</button>
        <button onClick={handleNext} className={layout.nextButton}>Neste</button>
      </div>
    </div>
  );
}

export default Step4Goals;
