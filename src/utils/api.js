export async function sendToMairim(message) {
  try {
    const response = await fetch('http://localhost:3001/api/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Klarte ikke kontakte Mairim-backend:', error);
    return { error: 'Ingen kontakt med Mairim-serveren' };
  }
}

