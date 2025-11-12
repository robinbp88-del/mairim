// src/BudgetAdvicePanel.js
import React, { useState } from 'react';
import layout from './Budget.module.css';
import avatarImage from './assets/ai-mairim.png';

function BudgetAdvicePanel({ onAdviceSelect }) {
  const [showAdvice, setShowAdvice] = useState(false);

  return (
    <div className={layout.adviceContainer}>
      {!showAdvice ? (
        <button className={layout.adviceButton} onClick={() => setShowAdvice(true)}>
          🧠 Få råd
        </button>
      ) : (
        <div className={layout.advicePanel}>
          <img src={avatarImage} alt="Mairim" className={layout.adviceAvatar} />
          <h3>Hva vil du ha råd om?</h3>
          <div className={layout.adviceOptions}>
            <button onClick={() => onAdviceSelect('saldo')}>💰 Saldo</button>
            <button onClick={() => onAdviceSelect('regninger')}>📬 Regninger</button>
            <button onClick={() => onAdviceSelect('handleturer')}>🛒 Handleturer</button>
            <button onClick={() => onAdviceSelect('uforutsett')}>⚠️ Uforutsette utgifter</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BudgetAdvicePanel;
