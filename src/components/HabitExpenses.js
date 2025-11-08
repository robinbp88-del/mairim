import React from 'react';
import styles from './Dashboard.module.css';

function HabitExpenses({ expenses, setExpenses }) {
  const habitCategories = ['Alkohol', 'Nikotin', 'Snus', 'Sigaretter'];

  const habitExpenses = expenses.filter(e =>
    habitCategories.includes(e.category)
  );

  const totalHabit = habitExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleRemove = (indexToRemove) => {
    const globalIndex = expenses.findIndex((e, i) => e === habitExpenses[indexToRemove]);
    const updated = expenses.filter((_, i) => i !== globalIndex);
    setExpenses(updated);
  };

  return (
    <div className={styles.sectionBox}>
      <h2>🚬 Uvaner: Alkohol og Nikotin</h2>
      <p><strong>Totalt brukt:</strong> kr {totalHabit}</p>

      {habitExpenses.length === 0 ? (
        <p>Ingen registrerte utgifter på uvaner.</p>
      ) : (
        habitExpenses.map((exp, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            {exp.name} – kr {exp.amount} ({exp.category})
            <button
              onClick={() => handleRemove(index)}
              style={{
                marginLeft: '10px',
                backgroundColor: '#ff9800',
                color: 'black',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Fjern
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default HabitExpenses;
