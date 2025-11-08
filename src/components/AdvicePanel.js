import React from 'react';

function AdvicePanel({ balance, expenses, available, goals, wishlist }) {
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalWishlist = wishlist.reduce((sum, item) => sum + item.price, 0);
  const totalSaved = goals.reduce((sum, goal) => sum + goal.saved, 0);

  const tips = [];

  if (available < 0) {
    tips.push("Du har brukt mer enn du har – vurder å kutte faste utgifter.");
  } else if (available < 1000) {
    tips.push("Lav disponibel saldo – hold daglig forbruk under kr 100.");
  } else {
    tips.push("Du har god kontroll – vurder å øke sparingen.");
  }

  if (totalWishlist > available) {
    tips.push("Ønskelisten overstiger disponibelt beløp – vurder å prioritere.");
  }

  if (totalSaved < goals.reduce((sum, g) => sum + g.target, 0)) {
    tips.push("Du har ikke nådd alle sparemål – hold fokus på sparing.");
  }

  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h2>Økonomiske råd fra Mairim</h2>
      <ul>
        {tips.map((tip, index) => (
          <li key={index} style={{ marginBottom: '10px' }}>{tip}</li>
        ))}
      </ul>
    </div>
  );
}

export default AdvicePanel;

