import React, { useState } from 'react';

function GoalSetter({ goals, setGoals }) {
  const [text, setText] = useState('');
  const [savedMessage, setSavedMessage] = useState(false);

  const handleAddGoal = () => {
    if (!text.trim()) return;

    const newGoal = {
      title: text,
      type: 'monthly',
      date: new Date().toISOString().split('T')[0],
    };

    setGoals([...goals, newGoal]);
    setText('');
    setSavedMessage(true);

    setTimeout(() => {
      setSavedMessage(false);
    }, 3000);
  };

  const monthlyGoals = goals.filter((g) => g.type === 'monthly');

  return (
    <div>
      <h3>Nytt mål for måneden</h3>
      <input
        type="text"
        placeholder="F.eks. Handle kun 1 gang i uka"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={handleAddGoal}>Legg til</button>

      {savedMessage && (
        <div style={{ marginTop: '12px', color: 'green' }}>
          ✅ Målet er lagret!
        </div>
      )}

      <h4>Aktive mål</h4>
      <ul>
        {monthlyGoals.map((goal, index) => (
          <li key={index}>{goal.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default GoalSetter;
