import React from 'react';

function BudgetAdvice({ profile, expenses, goals, balance, nextPayoutDate }) {
  const kostnadsfaktor = {
    vanlig: 1,
    vegetar: 0.9,
    vegan: 0.85,
    lavkarbo: 1.1
  };

  const dietFaktor = kostnadsfaktor[profile?.diet || 'vanlig'] || 1;
  const matbudsjett = Math.round(
    (profile?.adults || 1) * 3000 * dietFaktor +
    (profile?.children || 0) * 1800 * dietFaktor
  );

  const matUtgifter = expenses
    .filter(e => e.category === 'mat')
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const matProsent = matbudsjett > 0
    ? Math.round((matUtgifter / matbudsjett) * 100)
    : 0;

  const aktiveSparemål = goals.filter(g => (g.target || 0) > (g.saved || 0));

  const dagerIgjen = (() => {
    if (!nextPayoutDate) return null;
    const iDag = new Date();
    const neste = new Date(nextPayoutDate);
    const diff = Math.ceil((neste - iDag) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  })();

  const dagligRåd = dagerIgjen && balance
    ? Math.floor(balance / dagerIgjen)
    : null;

  const foreslåttSparing = dagligRåd && dagligRåd > 200
    ? Math.floor((dagligRåd - 200) * dagerIgjen)
    : 0;

  return (
    <div style={{
      padding: '16px',
      backgroundColor: '#2c2c2c',
      borderRadius: '8px',
      color: '#f0f0f0',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '24px',
      flexWrap: 'wrap'
    }}>
      <img
        src={`${process.env.PUBLIC_URL}/backend/ai-avatar.png`}
        alt="Mairim avatar"
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: '3px solid #888',
          objectFit: 'cover',
          flexShrink: 0
        }}
      />

      <div style={{ flex: 1 }}>
        <h3 style={{ marginTop: 0 }}>🧠 Mairims råd</h3>

        <p>✅ Du har brukt {matProsent}% av matbudsjettet ditt.</p>

        {aktiveSparemål.length === 0 ? (
          <p>🎯 Du har ingen aktive sparemål. Kanskje du vil sette et?</p>
        ) : (
          <p>🎯 Du har {aktiveSparemål.length} aktive sparemål. Fortsett sånn!</p>
        )}

        {dagerIgjen !== null && (
          <>
            <p>⏳ Det er {dagerIgjen} dager til neste utbetaling.</p>
            <p>💰 Nåværende saldo: kr {balance}</p>
            {dagligRåd !== null && (
              <p>📆 Du kan bruke ca. kr {dagligRåd} per dag.</p>
            )}
            {foreslåttSparing > 0 && (
              <p>💡 Hvis du setter av kr {foreslåttSparing} nå, har du fortsatt kr 200 per dag igjen.</p>
            )}
            {foreslåttSparing === 0 && dagligRåd < 200 && (
              <p>⚠️ Det er lite igjen per dag – vurder å holde igjen på utgifter.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default BudgetAdvice;


