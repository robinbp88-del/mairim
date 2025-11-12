import React, { useState } from 'react';

function HouseholdProfile({ profile, setProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [localProfile, setLocalProfile] = useState({
    adults: profile.adults || 1,
    children: profile.children || 0,
    diet: profile.diet || 'vanlig',
    income: profile.income || '',
    nextPayoutDate: profile.nextPayoutDate || ''
  });

  const kostnadsfaktor = {
    vanlig: 1,
    vegetar: 0.9,
    vegan: 0.85,
    lavkarbo: 1.1
  };

  const dietFaktor = kostnadsfaktor[localProfile.diet] || 1;
  const matPerVoksen = 3000 * dietFaktor;
  const matPerBarn = 1800 * dietFaktor;
  const matUtgiftAnbefalt = Math.round(localProfile.adults * matPerVoksen + localProfile.children * matPerBarn);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setProfile(localProfile);
    setIsEditing(false);
  };

  return (
    <div style={{ padding: '16px', backgroundColor: '#1e1e1e', borderRadius: '8px' }}>
      <h3>👨‍👩‍👧 Husholdningsprofil</h3>

      {isEditing ? (
        <>
          <div>
            <label>Voksne:</label>
            <input
              type="number"
              name="adults"
              value={localProfile.adults}
              onChange={handleChange}
              style={{ marginLeft: '8px' }}
            />
          </div>
          <div>
            <label>Barn:</label>
            <input
              type="number"
              name="children"
              value={localProfile.children}
              onChange={handleChange}
              style={{ marginLeft: '8px' }}
            />
          </div>
          <div>
            <label>Kosthold:</label>
            <select
              name="diet"
              value={localProfile.diet}
              onChange={handleChange}
              style={{ marginLeft: '8px' }}
            >
              <option value="vanlig">Vanlig</option>
              <option value="vegetar">Vegetar</option>
              <option value="vegan">Vegan</option>
              <option value="lavkarbo">Lavkarbo</option>
            </select>
          </div>
          <div>
            <label>Inntekt:</label>
            <input
              type="number"
              name="income"
              value={localProfile.income}
              onChange={handleChange}
              style={{ marginLeft: '8px' }}
            />
          </div>
          <div>
            <label>Neste utbetaling:</label>
            <input
              type="date"
              name="nextPayoutDate"
              value={localProfile.nextPayoutDate}
              onChange={handleChange}
              style={{ marginLeft: '8px' }}
            />
          </div>
          <button onClick={handleSave} style={{ marginTop: '12px' }}>Lagre profil</button>
        </>
      ) : (
        <>
          <p><strong>Voksne:</strong> {localProfile.adults}</p>
          <p><strong>Barn:</strong> {localProfile.children}</p>
          <p><strong>Kosthold:</strong> {localProfile.diet}</p>
          <p><strong>Inntekt:</strong> kr {localProfile.income}</p>
          <p><strong>Neste utbetaling:</strong> {localProfile.nextPayoutDate}</p>

          <p style={{ marginTop: '12px' }}>
            🍽️ <strong>Anbefalt matbudsjett:</strong> kr {matUtgiftAnbefalt}
          </p>

          <button onClick={() => setIsEditing(true)} style={{ marginTop: '12px' }}>Rediger profil</button>
        </>
      )}
    </div>
  );
}

export default HouseholdProfile;

