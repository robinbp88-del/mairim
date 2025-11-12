import { useState } from 'react';
import { sendToMairim } from '../utils/api';

function MairimTest() {
  const [userMessage, setUserMessage] = useState('');
  const [aiResponse, setAiResponse] = useState(null);

  async function handleSend() {
    const response = await sendToMairim(userMessage);
    setAiResponse(response);
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '500px' }}>
      <h2>Mairim Test</h2>
      <input
        type="text"
        value={userMessage}
        onChange={(e) => setUserMessage(e.target.value)}
        placeholder="Skriv til Mairim..."
        style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
      />
      <button onClick={handleSend}>Send</button>

      {aiResponse && (
        <div style={{ marginTop: '1rem' }}>
          <h4>Svar fra Mairim:</h4>
          <pre>{JSON.stringify(aiResponse, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default MairimTest;
