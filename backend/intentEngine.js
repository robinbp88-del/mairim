const fetch = require('node-fetch');

async function interpretMessage(message) {
  const prompt = `
Du er en økonomisk assistent. Brukeren skriver meldinger som:

- "jeg brukte 300 kr på mat"
- "jeg fikk lønn på 25 000"
- "jeg vil spare 5000 til ferie"
- "vi er 2 voksne og 1 barn"
- "målet mitt er å bruke maks 5000 på mat"
- "jeg lastet opp kvittering på 120 kr for strøm"

Du skal alltid svare med et gyldig JSON-objekt som beskriver meldingen. Ikke forklar, ikke småprat. Ikke bruk emojis, kommentarer eller tekst utenfor JSON.

Svar kun med JSON. Her er eksempler:

Input: "jeg brukte 300 kr på mat"
Svar:
{
  "type": "utgift",
  "kategori": "mat",
  "beløp": 300
}

Input: "jeg fikk lønn på 25 000"
Svar:
{
  "type": "inntekt",
  "kilde": "lønn",
  "beløp": 25000
}

Input: "jeg vil spare 5000 til ferie"
Svar:
{
  "type": "sparemål",
  "mål": "ferie",
  "beløp": 5000
}

Input: "vi er 2 voksne og 1 barn"
Svar:
{
  "type": "profil",
  "voksne": 2,
  "barn": 1
}

Input: "målet mitt er å bruke maks 5000 på mat"
Svar:
{
  "type": "månedsmål",
  "kategori": "mat",
  "maksbeløp": 5000
}

Input: "jeg lastet opp kvittering på 120 kr for strøm"
Svar:
{
  "type": "kvittering",
  "kategori": "strøm",
  "beløp": 120
}

Input: "${message}"
Svar:
`;

  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'mistral',
      prompt,
      stream: false
    })
  });

  const result = await response.json();
  console.log('🧠 Modellens svar:', result.response);

  try {
    const jsonStart = result.response.indexOf('{');
    const jsonEnd = result.response.lastIndexOf('}') + 1;
    const jsonText = result.response.slice(jsonStart, jsonEnd);
    return JSON.parse(jsonText);
  } catch (err) {
    console.error('❌ Feil ved parsing av modellens svar:', result.response);
    throw err;
  }
}

module.exports = { interpretMessage };
