// src/BudgetDashboard.js
import React, { useState } from 'react';
import layout from './Step.module.css';
import AdviceOverlay from './AdviceOverlay';

function BudgetDashboard({ profile, setProfile }) {
  const [shoppingDate, setShoppingDate] = useState('');
  const [shoppingAmount, setShoppingAmount] = useState('');
  const [shoppingLog, setShoppingLog] = useState(profile.shoppingLog || []);

  const [billName, setBillName] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDue, setBillDue] = useState('');
  const [bills, setBills] = useState(profile.bills || []);

  const [expenseNote, setExpenseNote] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [unexpected, setUnexpected] = useState(profile.unexpected || []);

  const [showOverlay, setShowOverlay] = useState(false);

  const handleBalanceChange = (e) => {
    const newBalance = parseFloat(e.target.value);
    setProfile(prev => ({ ...prev, balance: isNaN(newBalance) ? 0 : newBalance }));
  };

  const handleAddShopping = () => {
    if (!shoppingDate || !shoppingAmount) return;
    const newEntry = { date: shoppingDate, amount: parseFloat(shoppingAmount) };
    const updatedLog = [...shoppingLog, newEntry];
    setShoppingLog(updatedLog);
    setProfile(prev => ({ ...prev, shoppingLog: updatedLog }));
    setShoppingDate('');
    setShoppingAmount('');
  };

  const handleAddBill = () => {
    if (!billName || !billAmount || !billDue) return;
    const newBill = { name: billName, amount: parseFloat(billAmount), due: billDue };
    const updatedBills = [...bills, newBill];
    setBills(updatedBills);
    setProfile(prev => ({ ...prev, bills: updatedBills }));
    setBillName('');
    setBillAmount('');
    setBillDue('');
  };

  const handleAddUnexpected = () => {
    if (!expenseNote || !expenseAmount) return;
    const newExpense = { note: expenseNote, amount: parseFloat(expenseAmount) };
    const updated = [...unexpected, newExpense];
    setUnexpected(updated);
    setProfile(prev => ({ ...prev, unexpected: updated }));
    setExpenseNote('');
    setExpenseAmount('');
  };

  const handleReset = () => {
    setProfile({});
    window.location.reload();
  };

  const totalBudget = profile.balance ? parseFloat(profile.balance) : 0;

  const totalSpent = profile.income
    ? Math.max(0, profile.income - totalBudget)
    : shoppingLog.reduce((sum, e) => sum + e.amount, 0) +
      bills.reduce((sum, e) => sum + e.amount, 0) +
      unexpected.reduce((sum, e) => sum + e.amount, 0);

  const percentUsed = profile.income
    ? Math.round((totalSpent / profile.income) * 100)
    : totalBudget > 0
      ? Math.min(100, Math.round((totalSpent / totalBudget) * 100))
      : 0;

  const remaining = Math.max(0, totalBudget);

  const unpaidExpenses = (profile.expenses || []).filter(e => !e.paid);

  const markExpenseAsPaid = (index) => {
    const updatedExpenses = [...(profile.expenses || [])];
    const unpaid = updatedExpenses.filter(e => !e.paid);
    const target = unpaid[index];
    const originalIndex = updatedExpenses.findIndex(e =>
      e.name === target.name &&
      e.amount === target.amount &&
      e.due === target.due
    );
    if (originalIndex !== -1) {
      updatedExpenses[originalIndex].paid = true;
      setProfile(prev => ({ ...prev, expenses: updatedExpenses }));
    }
  };

  return (
    <div className={layout.stepContainer}>
      <h2>📊 Budsjettoversikt</h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <strong>Saldo:</strong>
        <input
          type="number"
          value={profile.balance || ''}
          onChange={handleBalanceChange}
          style={{ width: '120px' }}
        />
        <span>kr</span>
      </div>

      {profile.income && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <strong>Inntekt:</strong>
          <input
            type="number"
            value={profile.income || ''}
            onChange={e => {
              const newIncome = parseFloat(e.target.value);
              setProfile(prev => ({ ...prev, income: isNaN(newIncome) ? 0 : newIncome }));
            }}
            style={{ width: '120px' }}
          />
          <span>kr</span>
        </div>
      )}

      <p><strong>Brukt totalt:</strong> kr {totalSpent}</p>
      <p><strong>Gjenstår:</strong> kr {remaining}</p>

      <div style={{ background: '#333', borderRadius: '6px', overflow: 'hidden', height: '16px', marginBottom: '12px' }}>
        <div
          style={{
            width: `${percentUsed}%`,
            background: percentUsed < 90 ? '#4caf50' : '#f44336',
            height: '100%',
            transition: 'width 0.5s'
          }}
        />
      </div>
      <p style={{ fontSize: '13px' }}>{percentUsed}% av budsjettet er brukt</p>

      {/* 🧠 Få råd-knapp */}
      <section style={{ marginTop: '24px' }}>
        <button onClick={() => setShowOverlay(true)} className={layout.nextButton}>🧠 Få råd</button>
      </section>

      {/* 📌 Ubetalte faste utgifter */}
      <section style={{ marginTop: '24px' }}>
        <h3>📌 Ubetalte faste utgifter</h3>
        {unpaidExpenses.length === 0 ? (
          <p>Ingen ubetalte utgifter registrert.</p>
        ) : (
          <ul>
            {unpaidExpenses.map((exp, i) => (
              <li key={i}>
                {exp.name} – kr {exp.amount}
                <button
                  style={{ marginLeft: '12px' }}
                  onClick={() => markExpenseAsPaid(i)}
                >
                  Marker som betalt
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Handleturer */}
      <section style={{ marginTop: '24px' }}>
        <h3>🛒 Handleturer</h3>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <input type="date" value={shoppingDate} onChange={e => setShoppingDate(e.target.value)} />
          <input type="number" placeholder="Beløp" value={shoppingAmount} onChange={e => setShoppingAmount(e.target.value)} />
          <button onClick={handleAddShopping}>Legg til</button>
        </div>
        <ul>
          {shoppingLog.map((entry, i) => (
            <li key={i}>{entry.date}: kr {entry.amount}</li>
          ))}
        </ul>
      </section>

      {/* Regninger */}
      <section style={{ marginTop: '24px' }}>
        <h3>📬 Regninger</h3>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <input type="text" placeholder="Navn" value={billName} onChange={e => setBillName(e.target.value)} />
          <input type="number" placeholder="Beløp" value={billAmount} onChange={e => setBillAmount(e.target.value)} />
          <input type="date" value={billDue} onChange={e => setBillDue(e.target.value)} />
          <button onClick={handleAddBill}>Legg til</button>
        </div>
        <ul>
          {bills.map((bill, i) => (
            <li key={i}>{bill.name} – kr {bill.amount} (forfaller {bill.due})</li>
          ))}
        </ul>
      </section>

      {/* Uforutsette utgifter */}
      <section style={{ marginTop: '24px' }}>
        <h3>⚠️ Uforutsette utgifter</h3>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
               <input type="text" placeholder="Beskrivelse" value={expenseNote} onChange={e => setExpenseNote(e.target.value)} />
          <input type="number" placeholder="Beløp" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} />
          <button onClick={handleAddUnexpected}>Legg til</button>
        </div>
        <ul>
          {unexpected.map((exp, i) => (
            <li key={i}>{exp.note}: kr {exp.amount}</li>
          ))}
        </ul>
      </section>

      {/* Tilbake / nullstill */}
      <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
        <button onClick={handleReset} className={layout.nextButton}>Tilbake til start</button>
      </div>

      {/* Rådgivningsfane med Mairim */}
      {showOverlay && (
        <AdviceOverlay
          onClose={() => setShowOverlay(false)}
          onSelect={(type) => {
            console.log('Valgt rådtype:', type);
            setShowOverlay(false);
            // Her kan du koble til generateAdvice(type) hvis ønskelig
          }}
        />
      )}
    </div>
  );
}

export default BudgetDashboard;
