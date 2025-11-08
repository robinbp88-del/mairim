import React from 'react';

function GoalTracker({ goals, expenses }) {
  return (
    <div>
      <h3>🎯 Målhistorikk</h3>
      <p>Antall mål: {goals.length}</p>
      <p>Antall utgifter: {expenses.length}</p>
    </div>
  );
}

export default GoalTracker;
