import React, { useState } from 'react';

function SavingsGoals({ goals, setGoals }) {
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [saved, setSaved] = useState('');

  const handleAddGoal = () => {
    if (!title || !target) return;

    const newGoal = {
      title,
      target: parseFloat(target),
      saved: parseFloat(saved) || 0,
      date: new Date().toISOString().split('T')[0],
    };

    setGoals([...goals, newGoal]);
    setTitle('');
    setTarget('');
    setSaved('');
  };

  const totalSaved = goals.reduce((sum, g) => sum + (g.saved || 0), 0);

  return (
    <div>
      <h3>Legg til sparemål</h3>
      <input
        type="text"
        placeholder="Mål (f.eks. Ny sykkel)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="number"
        placeholder="Målbeløp"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
      />
      <input
        type="number"
        placeholder="Allerede spart"
        value={saved}
        onChange={(e) => setSaved(e.target.value)}
      />
      <button onClick={handleAddGoal}>Legg til</button>

      <h4>Sparemål</h4>
      <p>Totalt spart: kr {totalSaved}</p>
      <ul>
        {goals.map((goal, index) => (
          <li key={index}>
            {goal.title} – kr {goal.saved} / {goal.target}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SavingsGoals;
