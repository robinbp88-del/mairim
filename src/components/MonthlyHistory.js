import React from 'react';

function MonthlyHistory({ history }) {
  return (
    <div style={{ marginBottom: '30px' }}>
      <h2>Målhistorikk</h2>
      {history.length === 0 ? (
        <p>Ingen tidligere mål registrert.</p>
      ) : (
        <ul style={{ paddingLeft: '20px' }}>
          {history.map((entry, index) => (
            <li key={index} style={{ marginBottom: '8px' }}>
              📅 {entry.month} – 🎯 kr {entry.target} – 
              {entry.achieved ? (
                <span style={{ color: '#00ff88' }}> ✅ Nådd</span>
              ) : (
                <span style={{ color: '#ff4444' }}> ❌ Ikke nådd</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MonthlyHistory;
