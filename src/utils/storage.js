const STORAGE_KEY = 'mairim-state';

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      profile: parsed.profile && typeof parsed.profile === 'object' ? parsed.profile : {},
      step: typeof parsed.step === 'number' ? parsed.step : 0,
    };
  } catch (error) {
    console.error('Klarte ikke lese lagret Mairim-data:', error);
    return null;
  }
}

export function saveState({ profile, step }) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        profile: profile || {},
        step: typeof step === 'number' ? step : 0,
      })
    );
  } catch (error) {
    console.error('Klarte ikke lagre Mairim-data:', error);
  }
}

export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Klarte ikke slette Mairim-data:', error);
  }
}
