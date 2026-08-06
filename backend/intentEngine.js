/**
 * Regelbasert tolking av økonomiske meldinger.
 * Ingen LLM / Ollama — kun mønstre og tall.
 */

function parseAmount(text) {
  const match = String(text).replace(/\s/g, ' ').match(/(\d[\d\s]*)(?:\s*kr)?/i);
  if (!match) return null;
  const amount = parseInt(match[1].replace(/\s/g, ''), 10);
  return Number.isNaN(amount) ? null : amount;
}

function interpretMessage(message) {
  const text = String(message || '').trim().toLowerCase();
  if (!text) {
    return { type: 'feltering', error: 'Tom melding' };
  }

  // Utgift: "brukte 300 kr på mat", "betalte 120 for strøm"
  const expenseMatch = text.match(/(?:brukte|betalte|kjøpte|la ut)\s+(\d[\d\s]*)\s*(?:kr)?\s*(?:på|for|til)?\s*(.+)?/i);
  if (expenseMatch) {
    const beløp = parseInt(expenseMatch[1].replace(/\s/g, ''), 10);
    const kategori = (expenseMatch[2] || 'annet').trim().replace(/\.$/, '') || 'annet';
    return { type: 'utgift', kategori, beløp };
  }

  // Kvittering
  if (text.includes('kvittering')) {
    const beløp = parseAmount(text);
    const kategoriMatch = text.match(/(?:for|på)\s+([a-zæøå]+)/i);
    return {
      type: 'kvittering',
      kategori: kategoriMatch ? kategoriMatch[1] : 'annet',
      beløp: beløp || 0,
    };
  }

  // Inntekt / lønn
  if (/(?:lønn|inntekt|fikk|tjente)/.test(text)) {
    const beløp = parseAmount(text);
    if (beløp != null) {
      return { type: 'inntekt', kilde: text.includes('lønn') ? 'lønn' : 'inntekt', beløp };
    }
  }

  // Sparemål: "spare 5000 til ferie"
  const saveMatch = text.match(/(?:spare|sparemål|spare til)\s+(\d[\d\s]*)\s*(?:kr)?\s*(?:til|på)?\s*(.+)?/i);
  if (saveMatch || (text.includes('spare') && parseAmount(text) != null)) {
    const beløp = saveMatch
      ? parseInt(saveMatch[1].replace(/\s/g, ''), 10)
      : parseAmount(text);
    const mål = (saveMatch && saveMatch[2] ? saveMatch[2] : 'sparemål').trim().replace(/\.$/, '');
    return { type: 'sparemål', mål: mål || 'sparemål', beløp: beløp || 0 };
  }

  // Profil: "2 voksne og 1 barn"
  const adultsMatch = text.match(/(\d+)\s*voksne/);
  const childrenMatch = text.match(/(\d+)\s*barn/);
  if (adultsMatch || childrenMatch) {
    return {
      type: 'profil',
      voksne: adultsMatch ? parseInt(adultsMatch[1], 10) : 1,
      barn: childrenMatch ? parseInt(childrenMatch[1], 10) : 0,
    };
  }

  // Månedsmål: "maks 5000 på mat"
  const monthMatch = text.match(/(?:maks|månedsmål|bruke maks)\s+(\d[\d\s]*)\s*(?:kr)?\s*(?:på|til)?\s*(.+)?/i);
  if (monthMatch) {
    return {
      type: 'månedsmål',
      kategori: (monthMatch[2] || 'annet').trim() || 'annet',
      maksbeløp: parseInt(monthMatch[1].replace(/\s/g, ''), 10),
    };
  }

  // Generelt beløp med kategori-hint
  const beløp = parseAmount(text);
  if (beløp != null && /(mat|strøm|transport|husleie|bolig)/.test(text)) {
    const kategori = text.match(/(mat|strøm|transport|husleie|bolig)/)[1];
    return { type: 'utgift', kategori, beløp };
  }

  return {
    type: 'ikke-relatert',
    melding: 'Klarte ikke tolke meldingen. Bruk skjemaene, eller skriv f.eks. «brukte 300 kr på mat».',
  };
}

module.exports = { interpretMessage };
