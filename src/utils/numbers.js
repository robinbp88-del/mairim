export function numberInputValue(value) {
  if (value === '' || value === null || value === undefined) return '';
  return value;
}

export function parseNumberInput(raw) {
  if (raw === '' || raw === null || raw === undefined) return '';
  const number = Number(raw);
  return Number.isNaN(number) ? '' : number;
}

export function toStoredNumber(value, fallback = 0) {
  if (value === '' || value === null || value === undefined) return fallback;
  const number = Number(value);
  return Number.isNaN(number) ? fallback : number;
}
