import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

function ReceiptScanner({ setExpenses }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [preview, setPreview] = useState(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setLoading(true);

    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      setResult(text);
      setLoading(false);

      const match = text.match(/(?:Total|Sum)\s*[:\-]?\s*(\d+[.,]?\d*)/i);
      const amount = match ? parseFloat(match[1].replace(',', '.')) : null;

      if (amount) {
        const confirmed = window.confirm(`Fant beløp: kr ${amount}. Legge til som utgift?`);
        if (confirmed) {
          setExpenses(prev => [...prev, { name: 'Kvittering', amount }]);
        }
      } else {
        alert("Fant ikke noe beløp i kvitteringen.");
      }
    } catch (error) {
      console.error("OCR-feil:", error);
      alert("Kunne ikke lese kvitteringen.");
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: '30px' }}>
      <h2>📸 Skann kvittering</h2>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {preview && (
        <img
          src={preview}
          alt="Forhåndsvisning"
          style={{ marginTop: '10px', maxWidth: '100%', borderRadius: '8px' }}
        />
      )}
      {loading && <p>Leser kvittering…</p>}
      {result && (
        <pre style={{
          background: '#111',
          color: '#0f0',
          padding: '10px',
          whiteSpace: 'pre-wrap',
          borderRadius: '5px',
          marginTop: '10px'
        }}>
          {result}
        </pre>
      )}
    </div>
  );
}

export default ReceiptScanner;
