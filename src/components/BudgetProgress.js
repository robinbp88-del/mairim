import React from 'react';

function BudgetProgress({ category, label, share, totalBudget, expenses, periodStart, periodEnd }) {
  const daysTotal = Math.max(1, Math.ceil((periodEnd - periodStart) / (1000 * 60 * 60 * 24)));
  const today = new Date();
  const daysPassed = Math.max(0, Math.min(daysTotal, Math.floor((today - periodStart) / (1000 * 60 * 60 * 24))));

  const expectedTotal = Math.round(totalBudget * share);
  const expectedSoFar = Math.round((daysPassed / daysTotal) * expectedTotal);

  const spent = expenses
    .filter(e => e.category === category)
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const percentSpent = Math.round((spent / expectedTotal) * 100);
  const percentExpected = Math.round((expectedSoFar / expectedTotal) * 100);

  const barColor = percentSpent <= percentExpected ? '#4caf50' : '#f44336';

  return (
    <div style={{ marginBottom: '16px' }}>
      <strong>{label}</strong>
      <p style={{ margin: '4px 0' }}>
        Brukt: kr {spent} | Forventet: kr {expectedSoFar}
      </p>
      <div style={{ background: '#333', borderRadius: '6px', overflow: 'hidden', height: '16px' }}>
        <div
          style={{
            width: `${Math.min(100, percentSpent)}%`,
            background: barColor,
            height: '100%',
            transition: 'width 0.5s'
          }}
        />
      </div>
      <p style={{ fontSize: '13px', marginTop: '4px' }}>
        {percentSpent}% brukt – {percentExpected}% forventet
      </p>
      {percentSpent > percentExpected && (
        <p style={{ color: '#f44336', fontSize: '13px', marginTop: '4px' }}>
          ⚠️ Du har brukt mer enn forventet på {label.toLowerCase()}
        </p>
      )}
    </div>
  );
}

export default BudgetProgress;
