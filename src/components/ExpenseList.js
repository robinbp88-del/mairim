// src/components/ExpenseList.js
import React from 'react';

function ExpenseList({ expenses, setExpenses }) {
  const [name, setName] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [savedMessage, setSavedMessage] = React.useState(false);

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

  return (
    <div style={{ backgroundColor: '#1e1e1e', padding: '16px', borderRadius: '8px' }}>
      <p style={{ color: '#f0f0f0' }}><strong>Totale utgifter:</strong> kr {total}</p>

      <h4 style={{ color: '#f0f0f0' }}>➕ Legg til utgift</h4>
      <input
        type="text"
        placeholder="Navn"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ marginRight: '8px', padding: '6px', backgroundColor: '#2c2c2c', color: '#f0f0f0', border: '1px solid #555', borderRadius: '4px' }}
      />
      <input
        type="number"
        placeholder="Beløp"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ marginRight: '8px', padding: '6px', backgroundColor: '#2c2c2c', color: '#f0f0f0', border: '1px solid #555', borderRadius: '4px' }}
      />
      <input
        type="text"
        placeholder="Kategori"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{ marginRight: '8px', padding: '6px', backgroundColor: '#2c2c2c', color: '#f0f0f0', border: '1px solid #555', borderRadius: '4px' }}
      />
      <button
        onClick={handleAdd}
        style={{ backgroundColor: '#4caf50', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
      >
        Legg til
      </button>

      {savedMessage && (
        <div style={{ marginTop: '12px', color: '#4caf50' }}>
          ✅ Utgiften er lagret!
        </div>
      )}

      <h4 style={{ marginTop: '24px', color: '#f0f0f0' }}>📌 Registrerte utgifter</h4>
      {expenses.length === 0 ? (
        <p style={{ color: '#aaa' }}>Ingen utgifter registrert.</p>
      ) : (
        <>
          <button
            onClick={handleMarkAllPaid}
            style={{ marginBottom: '12px', backgroundColor: '#2196f3', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
          >
            Merk alle som betalt
          </button>

          <ul style={{ listStyle: 'none', padding: 0 }}>
            {expenses.map((e, index) => (
              <li
                key={index}
                style={{
                  marginBottom: '10px',
                  padding: '12px',
                  backgroundColor: e.isPaid ? '#2e4d3f' : '#2c2c2c',
                  color: '#f0f0f0',
                  border: '1px solid #444',
                  borderRadius: '6px'
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
                    cursor: 'pointer'
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
                    cursor: 'pointer'
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
