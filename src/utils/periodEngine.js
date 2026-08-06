/**
 * Periodeskifte og oppsummering — ren logikk.
 * Saldo oppdateres IKKE automatisk med inntekt (brukeren eier saldoen).
 */

import { buildBudgetPlan } from './budgetEngine.js';
import {
  addMonthsLocalIso,
  compareLocalDates,
  isoToNo,
  toLocalIsoDate,
} from './dates.js';

function toNumber(value, fallback = 0) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}

function sumAmounts(items = []) {
  return items.reduce((sum, item) => sum + toNumber(item?.amount), 0);
}

function formatKr(value) {
  return Math.round(toNumber(value)).toLocaleString('no-NO');
}

function daysInclusive(startIso, endIso) {
  const a = toLocalIsoDate(startIso);
  const b = toLocalIsoDate(endIso);
  if (!a || !b) return 1;
  const start = new Date(`${a}T00:00:00`);
  const end = new Date(`${b}T00:00:00`);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
}

function snapshotGoals(goals = []) {
  return (goals || []).map((g) => ({
    item: g.item,
    saved: toNumber(g.saved),
    price: toNumber(g.price),
    active: g.active !== false,
  }));
}

/**
 * Opprett aktiv periode-meta dersom den mangler.
 */
export function ensureActivePeriod(profile = {}, today = new Date()) {
  const payday = toLocalIsoDate(profile.nextPayoutDate);
  if (!payday) return profile;

  if (profile.budgetPeriod?.id && profile.budgetPeriod?.end) {
    return profile;
  }

  const todayIso = toLocalIsoDate(today);
  const start =
    toLocalIsoDate(profile.budgetPeriod?.start) ||
    addMonthsLocalIso(payday, -1) ||
    todayIso;
  const plan = profile.budgetPlan || buildBudgetPlan(profile);

  return {
    ...profile,
    budgetPeriod: {
      id: `${start}_${payday}`,
      start,
      end: payday,
      openingBalance: toNumber(
        profile.budgetPeriod?.openingBalance ?? profile.balance
      ),
      availableAtStart: toNumber(
        profile.budgetPeriod?.availableAtStart ?? plan?.available
      ),
      plannedSavings: toNumber(
        profile.budgetPeriod?.plannedSavings ?? plan?.månedligSparing
      ),
      goalsAtStart: profile.budgetPeriod?.goalsAtStart || snapshotGoals(profile.goals),
    },
  };
}

export function isPaydayReached(profile = {}, today = new Date()) {
  const payday = toLocalIsoDate(profile.nextPayoutDate);
  if (!payday) return false;
  return compareLocalDates(today, payday) >= 0;
}

export function alreadyClosedPeriod(profile = {}, periodEndIso) {
  const end = toLocalIsoDate(periodEndIso);
  if (!end) return true;
  if (profile.lastClosedPeriodEnd === end) return true;
  return (profile.periodHistory || []).some((p) => p.end === end);
}

export function shouldClosePeriod(profile = {}, today = new Date()) {
  if (!isPaydayReached(profile, today)) return false;
  const end = toLocalIsoDate(profile.nextPayoutDate);
  return !alreadyClosedPeriod(profile, end);
}

function findLargestExpense(profile) {
  const candidates = [];
  (profile.shoppingLog || []).forEach((e) =>
    candidates.push({
      label: `Handletur ${isoToNo(e.date)}`,
      amount: toNumber(e.amount),
      kind: 'shopping',
    })
  );
  (profile.unexpected || []).forEach((e) =>
    candidates.push({
      label: e.note || 'Uforutsett',
      amount: toNumber(e.amount),
      kind: 'unexpected',
    })
  );
  (profile.bills || [])
    .filter((b) => b.paid === true)
    .forEach((b) =>
      candidates.push({
        label: b.name || 'Regning',
        amount: toNumber(b.amount),
        kind: 'bill',
      })
    );
  (profile.expenses || [])
    .filter((e) => e.paid)
    .forEach((e) =>
      candidates.push({
        label: e.name || 'Fast utgift',
        amount: toNumber(e.amount),
        kind: 'fixed',
      })
    );

  if (candidates.length === 0) return null;
  return candidates.reduce((best, cur) =>
    cur.amount > best.amount ? cur : best
  );
}

function goalProgress(profile) {
  const startSnap = profile.budgetPeriod?.goalsAtStart || [];
  const byName = Object.fromEntries(startSnap.map((g) => [g.item, g]));
  return (profile.goals || [])
    .map((g) => {
      const before = toNumber(byName[g.item]?.saved);
      const after = toNumber(g.saved);
      const delta = after - before;
      return {
        item: g.item,
        before,
        after,
        delta,
        price: toNumber(g.price),
      };
    })
    .filter((g) => g.delta > 0);
}

function buildPeriodAdvice(summary, profile) {
  const variants = [];
  const activeGoal =
    (profile.goals || []).find((g) => g.priority) ||
    (profile.goals || []).find((g) => g.active !== false);

  const under =
    summary.availableBudget > 0
      ? summary.availableBudget - summary.totalSpent
      : 0;

  if (summary.withinBudget && under >= 200) {
    const boost = Math.min(Math.round(under * 0.6), under);
    if (activeGoal?.item) {
      variants.push(
        `Du brukte ${formatKr(under)} kr mindre enn det disponible budsjettet forrige periode. Det kan være rom for å øke sparingen til ${activeGoal.item} med omtrent ${formatKr(boost)} kr denne perioden.`
      );
    } else {
      variants.push(
        `Du brukte ${formatKr(under)} kr mindre enn det disponible budsjettet forrige periode. Vurder å øke bufferen eller starte et sparemål denne perioden.`
      );
    }
  }

  if (!summary.withinBudget && summary.overBy > 0) {
    variants.push(
      `Du gikk ${formatKr(summary.overBy)} kr over det disponible budsjettet. Mairim anbefaler å redusere fritidsforbruket eller sette av en større buffer denne perioden.`
    );
  }

  if (
    summary.shoppingTotal > 0 &&
    summary.shoppingTotal >= summary.totalSpent * 0.45 &&
    summary.totalSpent > 0
  ) {
    const weeklyFood = Math.round(summary.shoppingTotal / Math.max(1, summary.weeksApprox));
    variants.push(
      `Handleturene utgjorde mesteparten av forbruket ditt (${formatKr(summary.shoppingTotal)} kr). Et ukentlig matbudsjett på omtrent ${formatKr(weeklyFood)} kr kan gjøre neste periode lettere å følge.`
    );
  }

  if (
    summary.unexpectedTotal > 0 &&
    summary.unexpectedTotal >= summary.totalSpent * 0.25 &&
    summary.totalSpent > 0
  ) {
    variants.push(
      `Uforutsette utgifter sto for ${formatKr(summary.unexpectedTotal)} kr. En litt større buffer neste periode kan dempe svingningene.`
    );
  }

  if (summary.goalProgress?.length > 0) {
    const top = summary.goalProgress.slice().sort((a, b) => b.delta - a.delta)[0];
    variants.push(
      `Du satte av ${formatKr(top.delta)} kr ekstra til ${top.item} forrige periode. Fortsett i samme tempo hvis økonomien tillater det.`
    );
  }

  if (variants.length === 0) {
    variants.push(
      `Forrige periode er arkivert. Oppdater saldoen når lønnen er inne, og hold deg til dagsbudsjettet frem til neste utbetaling.`
    );
  }

  // Varier råd: velg ut fra periodens slutt-dato (stabilt, ikke tilfeldig hver refresh)
  const seed = (summary.end || '').replace(/\D/g, '');
  const idx = seed ? parseInt(seed.slice(-2), 10) % variants.length : 0;
  return variants[idx] || variants[0];
}

/**
 * Bygg oppsummering for perioden som avsluttes (før nullstilling).
 */
export function buildPeriodSummary(profile = {}, today = new Date()) {
  const end = toLocalIsoDate(profile.nextPayoutDate);
  const start =
    toLocalIsoDate(profile.budgetPeriod?.start) ||
    addMonthsLocalIso(end, -1) ||
    toLocalIsoDate(today);

  const shoppingTotal = sumAmounts(profile.shoppingLog);
  const unexpectedTotal = sumAmounts(profile.unexpected);
  const paidBillsTotal = sumAmounts(
    (profile.bills || []).filter((b) => b.paid === true)
  );
  const paidFixedTotal = sumAmounts(
    (profile.expenses || []).filter((e) => e.paid)
  );
  const totalSpent =
    shoppingTotal + unexpectedTotal + paidBillsTotal + paidFixedTotal;

  const openingBalance = toNumber(
    profile.budgetPeriod?.openingBalance ?? profile.balance
  );
  const closingBalance = toNumber(profile.balance);
  const availableBudget = toNumber(
    profile.budgetPeriod?.availableAtStart ?? profile.budgetPlan?.available
  );
  const plannedSavings = toNumber(
    profile.budgetPeriod?.plannedSavings ?? profile.budgetPlan?.månedligSparing
  );
  const goalProgressList = goalProgress(profile);
  const savedFromGoals = goalProgressList.reduce((s, g) => s + g.delta, 0);
  // Faktisk sparing: fremgang på mål hvis registrert, ellers planlagt sparing i perioden
  const savedAmount = savedFromGoals > 0 ? savedFromGoals : plannedSavings;

  const dayCount = daysInclusive(start, end);
  const avgPerDay = Math.round(totalSpent / dayCount);
  const largest = findLargestExpense(profile);
  const withinBudget = availableBudget <= 0 ? true : totalSpent <= availableBudget;
  const overBy = withinBudget ? 0 : Math.round(totalSpent - availableBudget);

  const summary = {
    id: `${start}_${end}`,
    start,
    end,
    openingBalance: Math.round(openingBalance),
    closingBalance: Math.round(closingBalance),
    availableBudget: Math.round(availableBudget),
    totalSpent: Math.round(totalSpent),
    shoppingTotal: Math.round(shoppingTotal),
    unexpectedTotal: Math.round(unexpectedTotal),
    paidBillsTotal: Math.round(paidBillsTotal),
    paidFixedTotal: Math.round(paidFixedTotal),
    savedAmount: Math.round(savedAmount),
    plannedSavings: Math.round(plannedSavings),
    withinBudget,
    overBy,
    avgPerDay,
    dayCount,
    weeksApprox: Math.max(1, Math.round(dayCount / 7)),
    largestExpense: largest
      ? { label: largest.label, amount: Math.round(largest.amount), kind: largest.kind }
      : null,
    goalProgress: goalProgressList.map((g) => ({
      item: g.item,
      delta: Math.round(g.delta),
      after: Math.round(g.after),
      price: Math.round(g.price),
    })),
    closedAt: toLocalIsoDate(today),
  };

  summary.advice = buildPeriodAdvice(summary, profile);
  return summary;
}

/**
 * Avslutt periode, arkiver, start ny — uten å legge inntekt på saldo.
 */
export function closeAndRolloverPeriod(profile = {}, today = new Date()) {
  const withPeriod = ensureActivePeriod(profile, today);
  const periodEnd = toLocalIsoDate(withPeriod.nextPayoutDate);
  if (!periodEnd || alreadyClosedPeriod(withPeriod, periodEnd)) {
    return withPeriod;
  }

  const summary = buildPeriodSummary(withPeriod, today);
  const nextPayday = addMonthsLocalIso(periodEnd, 1);
  const todayIso = toLocalIsoDate(today);

  // Faste utgifter er typisk månedlige → klar for ny periode
  const expenses = (withPeriod.expenses || []).map((e) => ({
    ...e,
    paid: false,
  }));

  const history = [summary, ...(withPeriod.periodHistory || [])].slice(0, 24);

  let nextProfile = {
    ...withPeriod,
    nextPayoutDate: nextPayday,
    lastClosedPeriodEnd: periodEnd,
    periodHistory: history,
    latestPeriodSummary: summary,
    showPeriodNotice: true,
    // Arkivert i summary — nullstill periodelogg
    shoppingLog: [],
    unexpected: [],
    expenses,
    budgetPeriod: {
      id: `${todayIso}_${nextPayday}`,
      start: todayIso,
      end: nextPayday,
      openingBalance: toNumber(withPeriod.balance),
      availableAtStart: 0,
      plannedSavings: 0,
      goalsAtStart: snapshotGoals(withPeriod.goals),
    },
  };

  const plan = buildBudgetPlan(nextProfile);
  if (plan) {
    nextProfile = {
      ...nextProfile,
      budgetPlan: plan,
      budgetPeriod: {
        ...nextProfile.budgetPeriod,
        availableAtStart: plan.available,
        plannedSavings: plan.månedligSparing,
        end: toLocalIsoDate(nextPayday),
      },
      budgetPeriodMeta: undefined,
    };
  }

  return nextProfile;
}

/**
 * Kjør eventuelle manglende periodeskifter (også hvis flere måneder er passert).
 */
export function applyDuePeriodRollovers(profile = {}, today = new Date()) {
  let current = ensureActivePeriod(profile, today);
  let guard = 0;
  while (shouldClosePeriod(current, today) && guard < 36) {
    current = closeAndRolloverPeriod(current, today);
    guard += 1;
  }
  return current;
}

export function dismissPeriodNotice(profile = {}) {
  return { ...profile, showPeriodNotice: false };
}
