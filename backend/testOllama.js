const fetch = require('node-fetch');

async function test() {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'mistral',
      prompt: 'jeg brukte 300 kr på mat',
      stream: false
    })
  });

  const result = await response.json();
  console.log('🧠 Modellens svar:', result.response);
}

test();
