import React, { useEffect, useState } from 'react';

function AIAdvisor({ goals, tips, balance, expenses, profile }) {
  const [advice, setAdvice] = useState([]);

  useEffect(() => {
    const newAdvice = [];

    // Sikre at arrays er definert
    const safeExpenses = Array.isArray(expenses) ? expenses : [];
    const safeGoals = Array.isArray(goals) ? goals : [];

    // Filtrer ut kun ubetalte utgifter
    const unpaidExpenses = safeExpenses.filter(e => !e.paid);
    const totalExpenses = unpaidExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const totalSavingsGoal = safeGoals.reduce(
      (sum, g) => sum + ((g.target || 0) - (g.saved || 0)),
      0
    );

    const rawBalance = parseFloat(balance || 0);
    const available = Math.max(0, rawBalance - totalExpenses - totalSavingsGoal);

    const payoutDate = profile?.nextPayoutDate
      ? new Date(profile.nextPayoutDate)
      : null;

    const today = new Date();
    const daysLeft = payoutDate && payoutDate > today
      ? Math.ceil((payoutDate - today) / (1000 * 60 * 60 * 24))
      : null;

    const daily = daysLeft ? Math.floor(available / daysLeft) : null;

    // Dynamiske råd
    if (available < 1000) {
      newAdvice.push('⚠️ Lav disponibel saldo – vurder å kutte i fritidsutgifter.');
    }

    if (daily && daily < 150) {
      newAdvice.push(`📉 Daglig budsjett er kr ${daily} – hold deg til enkle måltider og gratis aktiviteter.`);
    }

    if (safeGoals.length > 0) {
      newAdvice.push(`🎯 Du har ${safeGoals.length} aktive sparemål – vurder å prioritere de viktigste.`);
    }

    if (totalExpenses > rawBalance) {
      newAdvice.push('🚨 Ubetalte utgifter overstiger saldoen – vurder å utsette enkelte kjøp.');
    }

    if (newAdvice.length === 0) {
      newAdvice.push('✅ Budsjettet ditt ser balansert ut – fortsett med god kontroll!');
    }

    setAdvice(newAdvice);
  }, [goals, balance, expenses, profile]);

  return (
    <div>
      <h4 style={{ marginBottom: '8px' }}>💬 Råd fra Mairim</h4>
      <ul style={{ paddingLeft: '20px' }}>
        {advice.map((tip, index) => (
          <li key={index} style={{ marginBottom: '6px' }}>{tip}</li>
        ))}
      </ul>
    </div>
  );
}

export default AIAdvisor;
