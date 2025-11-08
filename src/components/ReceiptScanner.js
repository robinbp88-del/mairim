import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import styles from '../Dashboard.module.css';


function ReceiptScanner({ setExpenses }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const habitKeywords = {
    Alkohol: [
      'corona', 'tuborg', 'ringnes', 'heineken', 'smirnoff',
      'baileys', 'vin', 'øl', 'cider', 'brennevin', 'captain morgan'
    ],
    Nikotin: [
      'prince', 'marlboro', 'general', 'epok', 'zyn',
      'skruf', 'ld', 'camel', 'sigaretter', 'snus', 'tobakk'
    ]
  };

  const detectHabitCategory = (line) => {
    const lower = line.toLowerCase();
    for (const [category, keywords] of Object.entries(habitKeywords)) {
      if (keywords.some(k => lower.includes(k))) {
        return category;
      }
    }
    return null;
  };

  const handleFileUpload = async (e) => {
    const uploaded = e.target.files[0];
    if (!uploaded) return;

    setFile(uploaded);
    setMessage('');
    setLoading(true);

    try {
      const result = await Tesseract.recognize(uploaded, 'eng', {
        logger: m => console.log(m)
      });

      const text = result.data.text;
      const lines = text.split('\n');
      const newExpenses = [];

      lines.forEach(line => {
        const match = line.match(/(\d+)\s*kr/i);
        if (match) {
          const amount = parseFloat(match[1]);
          const category = detectHabitCategory(line) || 'Annet';

          newExpenses.push({
            name: 'Skannet kvittering',
            amount,
            category
          });
        }
      });

      if (newExpenses.length > 0) {
        setExpenses(prev => [...prev, ...newExpenses]);
        setMessage(`✅ Lagt til ${newExpenses.length} utgift(er) fra bilde.`);
      } else {
        setMessage('⚠️ Fant ingen gjenkjennelige utgifter i kvitteringen.');
      }
    } catch (error) {
      console.error(error);
      setMessage('❌ Klarte ikke å lese kvitteringen.');
    }

    setLoading(false);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setMessage('');
  };

  return (
    <div className={styles.sectionBox}>
      <h2>📸 Kvitteringsskanner</h2>
      <p>Last opp et bilde av kvittering for å automatisk legge til utgifter.</p>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ marginBottom: '10px' }}
      />

      {file && (
        <div style={{ marginBottom: '10px' }}>
          <p><strong>Valgt fil:</strong> {file.name}</p>
          <button
            onClick={handleRemoveFile}
            style={{
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🗑️ Fjern kvittering
          </button>
        </div>
      )}

      {loading && <p>🔄 Leser kvittering med OCR...</p>}
      {message && <p style={{ fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
}

export default ReceiptScanner;
