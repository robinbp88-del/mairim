import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function MonthlyGoal({ monthlyGoal, setMonthlyGoal, goals, setHistory, history }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (monthlyGoal && monthlyGoal.target > 0) {
      const totalSaved = goals.reduce((sum, g) => sum + g.saved, 0);
      const percent = Math.min((totalSaved / monthlyGoal.target) * 100, 100);
      setProgress(percent);
    }
  }, [monthlyGoal, goals]);

  const handleSetGoal = () => {
    const target = parseFloat(prompt("Hvor mye vil du spare denne måneden?"));
    if (!isNaN(target) && target > 0) {
      const month = new Date().toLocaleString('default', { month: 'long' });

      // Hvis det finnes et tidligere mål, legg det til i historikken
      if (monthlyGoal) {
        const totalSaved = goals.reduce((sum, g) => sum + g.saved, 0);
        const achieved = totalSaved >= monthlyGoal.target;
        setHistory(prev => [
          ...prev,
          {
            month: monthlyGoal.month,
            target: monthlyGoal.target,
            achieved
          }
        ]);
      }

      setMonthlyGoal({ target, month });
    }
  };

  const handleDeleteFromHistory = (indexToRemove) => {
    const updated = history.filter((_, index) => index !== indexToRemove);
    setHistory(updated);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Målhistorikk', 14, 20);

    const rows = history.map(entry => [
      entry.month,
      `kr ${entry.target}`,
      entry.achieved ? '✅ Nådd' : '❌ Ikke nådd'
    ]);

    autoTable(doc, {
      head: [['Måned', 'Målbeløp', 'Status']],
      body: rows,
      startY: 30
    });

    doc.save('maalhistorikk.pdf');
  };

  return (
    <div style={{ marginBottom: '30px' }}>
      <h2>Mål for måneden</h2>
      {monthlyGoal ? (
        <>
          <p>🎯 Mål: Spare kr {monthlyGoal.target} i {monthlyGoal.month}</p>
          <p>📈 Fremdrift: {Math.round(progress)}%</p>
          <div style={{
            background: '#333',
            borderRadius: '5px',
            overflow: 'hidden',
            height: '12px',
            width: '100%',
            marginBottom: '10px'
          }}>
            <div style={{
              width: `${progress}%`,
              background: progress >= 100 ? '#00ff88' : '#00ffff',
              height: '100%',
              transition: 'width 0.5s ease'
            }} />
          </div>
          {progress >= 100 && (
            <p style={{ color: '#00ff88', fontWeight: 'bold' }}>
              🎉 Du har nådd målet for måneden!
            </p>
          )}
        </>
      ) : (
        <p>Ingen mål satt for denne måneden.</p>
      )}
      <button
        onClick={handleSetGoal}
        style={{
          background: '#00ffff',
          color: '#000',
          padding: '8px 16px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Sett nytt mål
      </button>

      <h3>Tidligere mål</h3>
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
              <button
                onClick={() => handleDeleteFromHistory(index)}
                style={{
                  marginLeft: '10px',
                  background: '#444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  cursor: 'pointer'
                }}
              >
                Slett
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={handleExportPDF}
        style={{
          marginTop: '20px',
          background: '#ffaa00',
          color: '#000',
          padding: '8px 16px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Eksportér som PDF
      </button>
    </div>
  );
}

export default MonthlyGoal;
