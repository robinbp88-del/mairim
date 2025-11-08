import React, { useState } from 'react';
import styles from '../Dashboard.module.css';

function BudgetManager({ balance, setBalance, expenses, setExpenses }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [savedMessage, setSavedMessage] = useState(false);

  const handleAdd = () => {
    if (!name || !amount || !category) return;

    const newExpense = {
      name,
      amount: parseFloat(amount),
      category,
      date: new Date().toISOString().split('T')[0],
    };

    setExpenses(prev => [...prev, newExpense]);
    setName('');
    setAmount('');
    setCategory('');
    setSavedMessage(true);

    setTimeout(() => {
      setSavedMessage(false);
    }, 3000);
  };

  const handleRemove = (indexToRemove) => {
    const updated = expenses.filter((_, i) => i !== indexToRemove);
    setExpenses(updated);
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const available = parseFloat(balance || 0) - total;

  return (
    <div className={styles.sectionBox}>
      <h2>Budsjettoversikt</h2>
      <label>Saldo:</label>
      <input
        type="number"
        value={balance}
        onChange={(e) => setBalance(e.target.value)}
        placeholder="F.eks. 10000"
      />

      <p><strong>Totale utgifter:</strong> kr {total}</p>
      <p><strong>Disponibelt beløp:</strong> kr {available}</p>

      <div style={{ marginTop: '20px' }}>
        <h3>Legg til utgift</h3>
        <input
          placeholder="Navn"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          placeholder="Beløp"
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        <input
          placeholder="Kategori"
          value={category}
          onChange={e => setCategory(e.target.value)}
        />
        <button onClick={handleAdd}>Legg til</button>

        {savedMessage && (
          <div style={{ marginTop: '12px', color: 'green' }}>
            ✅ Utgiften er lagret!
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Utgifter</h3>
        {expenses.length === 0 ? (
          <p>Ingen utgifter registrert.</p>
        ) : (
          expenses.map((exp, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              {exp.name} – kr {exp.amount} ({exp.category})
              <button
                onClick={() => handleRemove(index)}
                style={{
                  marginLeft: '10px',
                  backgroundColor: '#f44336',
                  color: 'white',
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
    </div>
  );
}

export default BudgetManager;
