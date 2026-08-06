export function isoToNo(iso) {
  if (!iso) return '';
  const match = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return String(iso);
  return `${match[3]}.${match[2]}.${match[1]}`;
}

/** Lokal kalenderdato som YYYY-MM-DD (enhetens tidssone). */
export function toLocalIsoDate(value = new Date()) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Sammenlign to kalenderdatoer: -1 / 0 / 1 (a før / lik / etter b). */
export function compareLocalDates(a, b) {
  const aa = toLocalIsoDate(a);
  const bb = toLocalIsoDate(b);
  if (!aa || !bb) return 0;
  if (aa < bb) return -1;
  if (aa > bb) return 1;
  return 0;
}

/** Legg til hele måneder på en lokal ISO-dato (håndterer månedsslutt). */
export function addMonthsLocalIso(iso, months = 1) {
  const base = toLocalIsoDate(iso);
  if (!base) return '';
  const [y, m, d] = base.split('-').map(Number);
  const probe = new Date(y, m - 1 + months, 1);
  const lastDay = new Date(probe.getFullYear(), probe.getMonth() + 1, 0).getDate();
  const day = Math.min(d, lastDay);
  return toLocalIsoDate(new Date(probe.getFullYear(), probe.getMonth(), day));
}

/** Todelt årstall → firesifret (00–79 → 20xx, 80–99 → 19xx). */
export function expandYear(yy) {
  const n = parseInt(yy, 10);
  if (Number.isNaN(n) || n < 0 || n > 99) return '';
  return String(n >= 80 ? 1900 + n : 2000 + n);
}

/**
 * Tolk norsk dato-input fleksibelt:
 * - 15.08.2026 / 15/8/26 / 15-08-26 / 15 08 26
 * - 150826 / 15082026 (kun sifre)
 */
export function noToIso(value) {
  if (!value) return '';
  const trimmed = String(value).trim();

  const digits = trimmed.replace(/\D/g, '');
  if (/^\d{6}$/.test(digits) || /^\d{8}$/.test(digits)) {
    const day = digits.slice(0, 2);
    const month = digits.slice(2, 4);
    const year =
      digits.length === 6 ? expandYear(digits.slice(4, 6)) : digits.slice(4, 8);
    if (!year) return '';
    return `${year}-${month}-${day}`;
  }

  const match = trimmed.match(
    /^(\d{1,2})[./\-\s]+(\d{1,2})[./\-\s]+(\d{2}|\d{4})$/
  );
  if (!match) return '';

  const day = match[1].padStart(2, '0');
  const month = match[2].padStart(2, '0');
  const yearPart = match[3];
  const year = yearPart.length === 2 ? expandYear(yearPart) : yearPart;
  if (!year) return '';
  return `${year}-${month}-${day}`;
}

/**
 * Visningsformat mens brukeren skriver (kun sifre → dd.mm.åååå).
 */
export function formatDateTyping(raw) {
  const value = String(raw ?? '');
  if (!value) return '';

  if (/[./\-\s]/.test(value)) {
    return value;
  }

  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

export function isValidIsoDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  const [year, month, day] = iso.split('-').map(Number);
  return (
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day
  );
}
