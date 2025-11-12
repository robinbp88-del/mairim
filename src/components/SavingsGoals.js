import React, { useState } from 'react';

function SavingsGoals({ goals, setGoals }) {
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [goalSaved, setGoalSaved] = useState('');
  const [goalDate, setGoalDate] = useState('');

  const handleAddGoal = () => {
    if (!goalName || !goalAmount) return;

    const newGoal = {
      name: goalName,
      target: parseFloat(goalAmount),
      saved: parseFloat(goalSaved || 0),
      deadline: goalDate || null
    };

    setGoals(prev => [...prev, newGoal]);
    setGoalName('');
    setGoalAmount('');
    setGoalSaved('');
    setGoalDate('');
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('no-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateMonthlySaving = (goal) => {
    if (!goal.deadline) return null;

    const today = new Date();
    const deadline = new Date(goal.deadline);
    const monthsLeft = Math.max(1, Math.ceil((deadline - today) / (1000 * 60 * 60 * 24 * 30)));
    const remaining = Math.max(0, goal.target - (goal.saved || 0));
    return Math.ceil(remaining / monthsLeft);
  };

  const totalSaved = goals.reduce((sum, g) => sum + (g.saved || 0), 0);

  return (
    <div>
      <h4>Legg til sparemål</h4>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <input
          type="text"
          placeholder="Mål (f.eks. Ny sykkel)"
          value={goalName}
          onChange={e => setGoalName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Målbeløp"
          value={goalAmount}
          onChange={e => setGoalAmount(e.target.value)}
        />
        <input
          type="number"
          placeholder="Allerede spart"
          value={goalSaved}
          onChange={e => setGoalSaved(e.target.value)}
        />
        <input
          type="date"
          value={goalDate}
          onChange={e => setGoalDate(e.target.value)}
        />
        <button onClick={handleAddGoal}>Legg til</button>
      </div>

      <h4>Sparemål</h4>
      <p>Totalt spart: kr {totalSaved}</p>

      {goals.length === 0 ? (
        <p>Ingen sparemål registrert.</p>
      ) : (
        <ul>
          {goals.map((goal, i) => (
            <li key={i} style={{ marginBottom: '12px' }}>
              <strong>{goal.name}</strong> – Mål: kr {goal.target}, Spart: kr {goal.saved || 0}
              {goal.deadline && (
                <div>
                  Frist: {formatDate(goal.deadline)}<br />
                  Månedlig sparing: kr {calculateMonthlySaving(goal)}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SavingsGoals;
