import React, { useState } from 'react';

function MairimChat({ profile, balance, goals }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    const aiResponse = generateAdvice(input, profile, balance, goals);

    setMessages([...messages, userMessage, { sender: 'mairim', text: aiResponse }]);
    setInput('');
  };

  const generateAdvice = (question, profile, balance, goals) => {
    // Enkel logikk – kan utvides med AI senere
    if (question.toLowerCase().includes('spare')) {
      return `Basert på din saldo på kr ${balance}, anbefaler jeg å sette av minst 10% til sparing.`;
    }
    if (question.toLowerCase().includes('mat')) {
      return `Med standard kosthold og ${profile?.adults || 0} voksne, bør du vurdere ukesplan for matinnkjøp.`;
    }
    return `Takk for spørsmålet! Jeg anbefaler å holde oversikt over utgifter og sette realistiske mål.`;
  };

  return (
    <div style={{ marginTop: '24px' }}>
      <h3>💬 Chat med Mairim</h3>
      <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '12px', border: '1px solid #ccc', padding: '12px', borderRadius: '6px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', marginBottom: '8px' }}>
            <strong>{msg.sender === 'user' ? 'Du' : 'Mairim'}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Spør Mairim om økonomiske råd..."
        style={{ width: '80%', padding: '8px', fontSize: '16px' }}
      />
      <button onClick={handleSend} style={{ marginLeft: '8px', padding: '8px 12px' }}>
        Send
      </button>
    </div>
  );
}

export default MairimChat;
