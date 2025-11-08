import React from 'react';

function AssistantAdvice({ balance, expenses }) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const available = balance - total;

  return (
    <div style={{
      background: '#fff8dc',
      padding: '15px',
      borderRadius: '8px',
      border: '1px solid #ccc',
      marginTop: '20px'
    }}>
      <h3>🤖 Råd fra Mairim</h3>
      {available < 100 ? (
        <p>Lav disponibel saldo – hold daglig forbruk under kr 100.</p>
      ) : (
        <p>Du har kr {available.toFixed(2)} tilgjengelig. Fortsett å følge budsjettet!</p>
      )}
    </div>
  );
}

export default AssistantAdvice;
