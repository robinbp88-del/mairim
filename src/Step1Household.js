// src/Step1Household.js
import React, { useState } from 'react';
import layout from './Step.module.css';

function Step1Household({ profile = {}, setProfile, onNext, onBack }) {
  const [adults, setAdults] = useState(profile.adults ?? 1);
  const [children, setChildren] = useState(profile.children ?? 0);
  const [diet, setDiet] = useState(profile.diet ?? 'vanlig');

  const handleNext = () => {
    setProfile({ ...profile, adults, children, diet });
    onNext();
  };

  return (
    <div className={layout.stepContainer}>
      <h2>👨‍👩‍👧‍👦 Steg 1: Husholdning</h2>

      <label htmlFor="adults">Antall voksne:</label>
      <input
        id="adults"
        type="number"
        value={adults}
        onChange={e => setAdults(Number(e.target.value))}
      />

      <label htmlFor="children">Antall barn:</label>
      <input
        id="children"
        type="number"
        value={children}
        onChange={e => setChildren(Number(e.target.value))}
      />

      <label htmlFor="diet">Kostholdstype:</label>
      <select
        id="diet"
        value={diet}
        onChange={e => setDiet(e.target.value)}
      >
        <option value="vanlig">Vanlig</option>
        <option value="vegetar">Vegetar</option>
        <option value="vegan">Vegan</option>
        <option value="lavkarbo">Lavkarbo</option>
      </select>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={onBack} className={layout.nextButton}>Tilbake</button>
        <button onClick={handleNext} className={layout.nextButton}>Neste</button>
      </div>
    </div>
  );
}

export default Step1Household;


