import React, { useState, useEffect } from 'react';
import ReceiptScanner from './ReceiptScanner';

function ExpenseList({ expenses, setExpenses }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [balance, setBalance] = useState('');
  const [savedMessage, setSavedMessage] = useState(false);

  // Sikrer at alle utgifter har isPaid-felt
  useEffect(() => {
    const updated = expenses.map((e) =>
      e.hasOwnProperty('isPaid') ? e : { ...e, isPaid: false }
    );
    setExpenses(updated);
  }, []);

  const handleAdd = () => {
    if (!name || !amount || !category) return;

    const newExpense = {
      name,
      amount: parseFloat(amount),
      category,
      isPaid: false,
      date: new Date().toISOString().split('T')[0],
    };

    setExpenses([...expenses, newExpense]);
    setName('');
    setAmount('');
    setCategory('');
    setSavedMessage(true);

    setTimeout(() => {
      setSavedMessage(false);
    }, 3000);
  };

  const handleTogglePaid = (index) => {
    const updated = [...expenses];
    updated[index].isPaid = !updated[index].isPaid;
    setExpenses(updated);
  };

  const handleMarkAllPaid = () => {
    const updated = expenses.map((e) => ({ ...e, isPaid: true }));
    setExpenses(updated);
  };

  const handleRemove = (indexToRemove) => {
    const updated = expenses.filter((_, i) => i !== indexToRemove);
    setExpenses(updated);
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const unpaidTotal = expenses
    .filter((e) => !e.isPaid)
    .reduce((sum, e) => sum + e.amount, 0);
  const available = parseFloat(balance || 0) - unpaidTotal;

  return (
    <div>
      <h3>📋 Utgifter</h3>

      <label>💰 Nåværende saldo:</label>
      <input
        type="number"
        value={balance}
        onChange={(e) => setBalance(e.target.value)}
        placeholder="F.eks. 10000"
      />

      <p><strong>Totale utgifter:</strong> kr {total}</p>
      <p><strong>Disponibelt beløp:</strong> kr {available}</p>

      <h4>➕ Legg til utgift</h4>
      <input
        type="text"
        placeholder="Navn"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="number"
        placeholder="Beløp"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <input
        type="text"
        placeholder="Kategori"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <button onClick={handleAdd}>Legg til</button>

      {savedMessage && (
        <div style={{ marginTop: '12px', color: 'green' }}>
          ✅ Utgiften er lagret!
        </div>
      )}

      <h4>📌 Registrerte utgifter</h4>
      {expenses.length === 0 ? (
        <p>Ingen utgifter registrert.</p>
      ) : (
        <>
          <button
            onClick={handleMarkAllPaid}
            style={{
              marginBottom: '12px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Merk alle som betalt
          </button>

          <ul style={{ listStyle: 'none', padding: 0 }}>
            {expenses.map((e, index) => (
              <li
                key={index}
                style={{
                  marginBottom: '10px',
                  padding: '8px',
                  backgroundColor: e.isPaid ? '#e0f7e9' : '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                }}
              >
                <strong>{e.name}</strong> – kr {e.amount} ({e.category})
                <button
                  onClick={() => handleTogglePaid(index)}
                  style={{
                    marginLeft: '12px',
                    backgroundColor: e.isPaid ? '#4caf50' : '#f44336',
                    color: 'white',
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {e.isPaid ? 'Betalt' : 'Ubetalt'}
                </button>
                <button
                  onClick={() => handleRemove(index)}
                  style={{
                    marginLeft: '8px',
                    backgroundColor: '#9e9e9e',
                    color: 'white',
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Fjern
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default ExpenseList;
