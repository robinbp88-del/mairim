import React, { useState } from 'react';
import styles from '../Dashboard.module.css';

function MairimAssistant({ onMessage }) {
  const [message, setMessage] = useState('');
  const [lastResponse, setLastResponse] = useState(null);

  async function handleSend() {
    if (!message.trim()) return;
    const result = await onMessage(message);
    setLastResponse(result);
    setMessage('');
  }

  function interpretResponse(response) {
    if (!response || typeof response !== 'object') return '🤔 Jeg er litt usikker på hva du mente.';

    switch (response.type) {
      case 'inntektsmelding':
        return '✅ Inntekt registrert!';
      case 'utgift':
        return `🧾 Jeg har lagt til utgiften "${response.kategori}" på kr ${response.beløp}.`;
      case 'sparemål':
        return `🎯 Sparemålet "${response.mål}" på kr ${response.beløp} er registrert.`;
      case 'profil':
        return '👤 Husholdningsprofilen er oppdatert.';
      case 'utbetalingsdato':
        return `📅 Neste utbetalingsdato er satt til ${response.dato}.`;
      case 'månedsmål':
        return `📌 Månedsmål for "${response.kategori}" er satt til kr ${response.maksbeløp}.`;
      case 'kvittering':
        return `📸 Kvittering lagt til: ${response.kategori} – kr ${response.beløp}.`;
      case 'feltering':
        return '⚠️ Jeg fant ikke noe relevant i meldingen.';
      case 'ikke-relatert':
        return '🤷‍♀️ Meldingen virker ikke relatert til budsjett eller økonomi.';
      default:
        return '✅ Meldingen er registrert.';
    }
  }

  return (
    <div className={styles.mairimCard}>
      {/* 🖼️ Mairim-avatar og tittel */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <img
          src="http://localhost:3001/ai-avatar.png"
          alt="Mairim"
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            marginRight: '12px',
            objectFit: 'cover',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
          }}
        />
        <h2 style={{ margin: 0 }}>Mairim-assistent</h2>
      </div>

      {/* 💬 Inputfelt og send-knapp */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="F.eks. Jeg brukte 300 kr på mat"
          style={{
            flex: 1,
            padding: '10px',
            fontSize: '16px',
            borderRadius: '6px',
            border: '1px solid #444',
            backgroundColor: '#1e1e1e',
            color: '#e0e0e0'
          }}
        />
        <button
          onClick={handleSend}
          style={{
            padding: '10px 16px',
            fontSize: '16px',
            backgroundColor: '#0078D4',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          📨 Send
        </button>
      </div>

      {/* 🧠 Siste svar */}
      {lastResponse && (
        <div className={styles.mairimResponse}>
          <strong>Mairim:</strong>
          <p style={{ marginTop: '6px' }}>{interpretResponse(lastResponse)}</p>
        </div>
      )}
    </div>
  );
}

export default MairimAssistant;


