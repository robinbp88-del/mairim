import React from 'react';

function MairimLog({ log }) {
  if (!log || log.length === 0) return null;

  return (
    <div style={{ marginTop: '20px', maxHeight: '240px', overflowY: 'auto' }}>
      <h3>🧠 Svar fra Mairim:</h3>
      {log.map((entry, index) => (
        <div
          key={index}
          style={{
            marginBottom: '12px',
            padding: '10px',
            background: '#f9f9f9',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ marginBottom: '6px' }}>
            <strong>Du:</strong> {entry.message}
          </div>
          <div>
            <strong>Mairim:</strong>{' '}
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(entry.response, null, 2)}
            </pre>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MairimLog;
