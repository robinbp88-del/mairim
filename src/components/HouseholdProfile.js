import React, { useState } from 'react';

function HouseholdProfile({ profile, setProfile, setBalance }) {
  const [adults, setAdults] = useState(profile.adults || 0);
  const [children, setChildren] = useState(profile.children || 0);
  const [diet, setDiet] = useState(profile.diet || 'standard');
  const [income, setIncome] = useState(profile.income || '');
  const [nextPayoutDate, setNextPayoutDate] = useState(profile.nextPayoutDate || '');
  const [savedMessage, setSavedMessage] = useState(false);
const handleIncomeChange = (e) => {
  const value = e.target.value;
  setProfile(prev => ({ ...prev, income: value }));
  setBalance(value); // ← dette er viktig!
};

  const handleSave = () => {
    const updatedProfile = {
      adults,
      children,
      diet,
      income,
      nextPayoutDate,
    };

    setProfile(updatedProfile);
    setSavedMessage(true);

    setTimeout(() => {
      setSavedMessage(false);
    }, 3000); // Fader bort etter 3 sekunder
  };

  return (
    <div>
      <h3>Husholdningsprofil</h3>
      <label>Antall voksne:</label>
      <input
        type="number"
        value={adults}
        onChange={(e) => setAdults(parseInt(e.target.value))}
      />

      <label>Antall barn:</label>
      <input
        type="number"
        value={children}
        onChange={(e) => setChildren(parseInt(e.target.value))}
      />
<input
  type="number"
  value={profile.income || ''}
  onChange={handleIncomeChange}
/>

      <label>Kosthold:</label>
      <select value={diet} onChange={(e) => setDiet(e.target.value)}>
        <option value="standard">Standard</option>
        <option value="vegetar">Vegetar</option>
        <option value="lavbudsjett">Lavbudsjett</option>
      </select>

      <label>Månedlig inntekt (valgfritt):</label>
      <input
        type="number"
        value={income}
        onChange={(e) => setIncome(e.target.value)}
      />

      <label>Neste utbetalingsdato (valgfritt):</label>
      <input
        type="date"
        value={nextPayoutDate}
        onChange={(e) => setNextPayoutDate(e.target.value)}
      />

      <button onClick={handleSave}>Lagre profil</button>

      {savedMessage && (
        <div style={{ marginTop: '12px', color: 'green', transition: 'opacity 0.5s' }}>
          ✅ Profilen er lagret!
        </div>
      )}
    </div>
  );
}

export default HouseholdProfile;
