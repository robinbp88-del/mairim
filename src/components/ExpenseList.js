// src/components/ExpenseList.js
import React from 'react';
import { Check, List, Plus, Trash2 } from 'lucide-react';
import IconHeading from './ui/IconHeading';
import { ICON_SIZE, ICON_STROKE } from './ui/iconProps';
import layout from '../Step.module.css';
import { numberInputValue, parseNumberInput } from '../utils/numbers';

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
      paid: false,
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
    updated[index].paid = !updated[index].paid;
    setExpenses(updated);
  };

  const handleMarkAllPaid = () => {
    const updated = expenses.map((e) => ({ ...e, paid: true }));
    setExpenses(updated);
  };

  const handleRemove = (indexToRemove) => {
    const updated = expenses.filter((_, i) => i !== indexToRemove);
    setExpenses(updated);
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p><strong>Totale utgifter:</strong> kr {total}</p>

      <IconHeading icon={Plus} as="h4">Legg til utgift</IconHeading>
      <div className={layout.formRow}>
        <input
          type="text"
          placeholder="Navn"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Beløp"
          value={numberInputValue(amount)}
          onChange={(e) => setAmount(parseNumberInput(e.target.value))}
        />
        <input
          type="text"
          placeholder="Kategori"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>
      <button type="button" onClick={handleAdd} className={layout.secondaryButton}>
        <Plus size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden="true" />
        Legg til
      </button>

      {savedMessage && (
        <p className={layout.metaRow}>
          <Check size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden="true" />
          Utgiften er lagret
        </p>
      )}

      <IconHeading icon={List} as="h4">Registrerte utgifter</IconHeading>
      {expenses.length === 0 ? (
        <p className={layout.muted}>Ingen utgifter registrert.</p>
      ) : (
        <>
          <button type="button" onClick={handleMarkAllPaid} className={layout.ghostButton}>
            Merk alle som betalt
          </button>
          <ul className={layout.list}>
            {expenses.map((e, index) => (
              <li key={index} className={layout.listItem}>
                <span>
                  <strong>{e.name}</strong> – kr {e.amount} ({e.category})
                </span>
                <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleTogglePaid(index)}
                    className={layout.ghostButton}
                  >
                    {e.paid ? 'Betalt' : 'Ubetalt'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className={layout.ghostButton}
                    aria-label="Fjern utgift"
                  >
                    <Trash2 size={ICON_SIZE} strokeWidth={ICON_STROKE} />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default ExpenseList;
