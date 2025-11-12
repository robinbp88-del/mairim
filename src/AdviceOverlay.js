// src/AdviceOverlay.js
import React, { useState } from 'react';
import styles from './AdviceOverlay.module.css';

function AdviceOverlay({ onClose }) {
  const [advice, setAdvice] = useState('');

  function getAdvice(type) {
    switch (type) {
      case 'saldo':
        return 'Du har god kontroll på saldoen! Husk å sette av litt til sparing.';
      case 'regninger':
        return 'Betal regningene i tide for å unngå gebyrer. Sett opp varsler om forfall.';
      case 'handleturer':
        return 'Lag handleliste før du går i butikken – det reduserer impulskjøp.';
      case 'uforutsett':
        return 'Ha en bufferkonto for uforutsette utgifter. Start med 1000 kr.';
      default:
        return '';
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <img src="/mairim/mairim-overlay.png" alt="Mairim" className={styles.avatar} />
        <h2>Hei Robin 👋 Hva trenger du hjelp med?</h2>
        <div className={styles.options}>
          <button onClick={() => setAdvice(getAdvice('saldo'))}>💰 Saldo</button>
          <button onClick={() => setAdvice(getAdvice('regninger'))}>📬 Regninger</button>
          <button onClick={() => setAdvice(getAdvice('handleturer'))}>🛒 Handleturer</button>
          <button onClick={() => setAdvice(getAdvice('uforutsett'))}>⚠️ Uforutsette utgifter</button>
        </div>
        {advice && <p className={styles.advice}>{advice}</p>}
        <button onClick={onClose} className={styles.close}>Lukk</button>
      </div>
    </div>
  );
}

export default AdviceOverlay;


