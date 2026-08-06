/**
 * Budsjettmotor — ren logikk, ingen UI.
 * Bruker kun data som finnes på profilen.
 */

/** Samlede terskler — vurdering og sparetrapp bruker samme skala. */
export const BUDGET_THRESHOLDS = {
  /** Under dette: Stram økonomi */
  criticalDaily: 150,
  /** Under dette (eller høy andel forpliktelser): Litt stramt */
  tightDaily: 250,
  /** Fra dette og romslig disponibelt: God kontroll */
  goodDaily: 400,
  /**
   * Sparing trappes ned til daglig budsjett er minst dette.
   * Ligger mellom critical og tight, så sparing ikke skyver deg inn i «stram».
   */
  minDailyWithSavings: 200,
  /** Forpliktelser som andel av saldo → minst «litt stramt» */
  tightObligationsRatio: 0.5,
  /** Disponibelt som andel av saldo → «god kontroll» */
  goodDisposableRatio: 0.4,
  /** Buffer: stort nivå (kr / andel av saldo) */
  bufferLargeMax: 1200,
  bufferLargeRatio: 0.08,
  bufferLargeHeadroom: 2000,
  /** Buffer: lite nivå */
  bufferSmallMax: 600,
  bufferSmallRatio: 0.05,
  bufferSmallHeadroom: 800,
  /** Rom for ekstra sparing / nedbetaling (kr over mat+transport) */
  extraSavingSurplus: 2500,
};

function toNumber(value, fallback = 0) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysBetween(from, to) {
  const ms = startOfDay(to) - startOfDay(from);
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function recommendedMonthlyFood(profile = {}) {
  const factors = { vanlig: 1, vegetar: 0.9, vegan: 0.85, lavkarbo: 1.1 };
  const factor = factors[profile.diet] || 1;
  const adults = toNumber(profile.adults, 1);
  const children = toNumber(profile.children, 0);
  return Math.round(adults * 3000 * factor + children * 1800 * factor);
}

function desiredMonthlySavings(goals = [], today = new Date()) {
  return (goals || [])
    .filter((g) => g.active !== false)
    .reduce((sum, goal) => {
      const deadline = goal.targetDate ? new Date(goal.targetDate) : null;
      const monthsLeft = deadline && !Number.isNaN(deadline.getTime())
        ? Math.max(
            1,
            (deadline.getFullYear() - today.getFullYear()) * 12 +
              (deadline.getMonth() - today.getMonth())
          )
        : 1;
      const remaining = Math.max(0, toNumber(goal.price) - toNumber(goal.saved));
      return sum + Math.ceil(remaining / monthsLeft);
    }, 0);
}

/** Skaler ønsket månedlig sparing ned til antall dager igjen i perioden. */
function scaleSavingsToPeriod(monthlyDesired, daysLeft) {
  if (monthlyDesired <= 0) return 0;
  return Math.ceil(monthlyDesired * (daysLeft / 30));
}

function isBillUnpaid(bill) {
  return bill?.paid !== true;
}

function isDueOnOrBefore(dueValue, payday) {
  if (!dueValue) return true;
  const due = new Date(dueValue);
  if (Number.isNaN(due.getTime())) return true;
  return startOfDay(due) <= startOfDay(payday);
}

/**
 * Oppsummering av regninger for UI (kun reelle data).
 */
export function summarizeBills(profile = {}) {
  const bills = profile.bills || [];
  const payday = profile.nextPayoutDate ? new Date(profile.nextPayoutDate) : null;
  const paydayOk = payday && !Number.isNaN(payday.getTime());

  const unpaid = bills.filter(isBillUnpaid);
  const paid = bills.filter((b) => b?.paid === true);

  const unpaidBeforePayday = paydayOk
    ? unpaid.filter((b) => isDueOnOrBefore(b.due, payday))
    : unpaid;

  const unpaidBeforePaydayAmount = unpaidBeforePayday.reduce(
    (sum, b) => sum + toNumber(b.amount),
    0
  );

  const nextDueBill = unpaid
    .map((b) => {
      const due = b.due ? new Date(b.due) : null;
      if (!due || Number.isNaN(due.getTime())) return null;
      return { name: b.name, due: b.due, amount: toNumber(b.amount), dueDate: due };
    })
    .filter(Boolean)
    .sort((a, b) => a.dueDate - b.dueDate)[0] || null;

  return {
    unpaidBeforePaydayAmount: Math.round(unpaidBeforePaydayAmount),
    paidBillsCount: paid.length,
    nextDueBill: nextDueBill
      ? { name: nextDueBill.name, due: nextDueBill.due, amount: nextDueBill.amount }
      : null,
  };
}

/**
 * Forpliktelser før neste lønn:
 * - ubetalte faste utgifter
 * - ubetalte regninger med forfall på eller før utbetalingsdato
 */
function sumObligationsBeforePayday(profile = {}, payday) {
  const unpaidFixed = (profile.expenses || [])
    .filter((e) => !e.paid)
    .reduce((sum, e) => sum + toNumber(e.amount), 0);

  const unpaidBills = (profile.bills || [])
    .filter(isBillUnpaid)
    .filter((bill) => isDueOnOrBefore(bill.due, payday))
    .reduce((sum, bill) => sum + toNumber(bill.amount), 0);

  return {
    total: unpaidFixed + unpaidBills,
    unpaidFixed,
    bills: unpaidBills,
  };
}

function pickAssessment({ daily, disposable, obligations, balance }) {
  const t = BUDGET_THRESHOLDS;

  if (disposable <= 0 || daily < t.criticalDaily) {
    return {
      level: 'critical',
      title: 'Stram økonomi',
      blurb: 'Prioriter nødvendige utgifter frem til neste lønn.',
    };
  }
  if (
    daily < t.tightDaily ||
    (balance > 0 && obligations > balance * t.tightObligationsRatio)
  ) {
    return {
      level: 'tight',
      title: 'Litt stramt',
      blurb: 'Hold deg omtrent innenfor dagsbudsjettet for å unngå å bruke opp saldoen.',
    };
  }
  if (
    daily >= t.goodDaily &&
    (balance <= 0 || disposable > balance * t.goodDisposableRatio)
  ) {
    return {
      level: 'good',
      title: 'God kontroll',
      blurb: 'Du ligger godt an denne perioden.',
    };
  }
  return {
    level: 'ok',
    title: 'God kontroll',
    blurb: 'Du ligger godt an denne perioden.',
  };
}

function buildComment({
  daysLeft,
  daily,
  adjustedSavings,
  desiredPeriodSavings,
  assessment,
  assumptions,
  roomForExtraSaving,
}) {
  const parts = [];

  parts.push(`Det er ${daysLeft} dager til neste lønning.`);
  parts.push(
    `Etter at nødvendige utgifter er tatt høyde for, anbefales et dagsbudsjett på omtrent ${daily.toLocaleString('no-NO')} kr.`
  );

  if (desiredPeriodSavings > 0 && adjustedSavings < desiredPeriodSavings) {
    if (adjustedSavings === 0) {
      parts.push(
        'Sparingen er satt på pause denne perioden for å sikre at saldoen varer frem til lønn.'
      );
    } else {
      parts.push(
        `Sparingen er midlertidig redusert til ${adjustedSavings.toLocaleString('no-NO')} kr denne perioden for å sikre at saldoen varer frem til lønn.`
      );
    }
  } else if (adjustedSavings > 0) {
    parts.push(
      `Det er rom for å sette av ${adjustedSavings.toLocaleString('no-NO')} kr til sparing i perioden.`
    );
  }

  if (roomForExtraSaving) {
    parts.push(
      'Økonomien ser romslig ut — vurder ekstra sparing eller nedbetaling av gjeld hvis du har det.'
    );
  } else if (assessment.level === 'critical' || assessment.level === 'tight') {
    parts.push(
      'Prioriter faste utgifter, mat og transport før sparing og fritid frem til neste lønn.'
    );
  }

  if (assumptions.length > 0) {
    parts.push(assumptions.join(' '));
  }

  return parts.join(' ');
}

/**
 * @param {object} profile
 * @param {number|string} balanceOverride
 */
export function buildBudgetPlan(profile = {}, balanceOverride) {
  const assumptions = [];
  const balance = toNumber(
    balanceOverride !== undefined && balanceOverride !== ''
      ? balanceOverride
      : profile.balance,
    0
  );

  if (!profile.nextPayoutDate) {
    return null;
  }

  const today = new Date();
  const payday = new Date(profile.nextPayoutDate);
  if (Number.isNaN(payday.getTime())) {
    return null;
  }

  const daysLeft = daysBetween(today, payday);
  const obligations = sumObligationsBeforePayday(profile, payday);

  if (!(profile.expenses || []).length && !(profile.bills || []).length) {
    assumptions.push(
      'Ingen faste utgifter eller regninger er registrert ennå, så det er ikke trukket fra forpliktelser.'
    );
  }

  const monthlyFood = recommendedMonthlyFood(profile);
  const periodFood = Math.round(monthlyFood * (daysLeft / 30));
  // Mat-estimat brukes internt til prioritering; nevnes bare hvis ingen utgifter er registrert
  if (!(profile.expenses || []).length) {
    assumptions.push(
      `Mat er estimert til ca. ${periodFood.toLocaleString('no-NO')} kr for perioden basert på husholdningen.`
    );
  }

  // Etter forpliktelser
  let remaining = balance - obligations.total;

  // Sikkerhetsbuffer bare hvis det er rom (etter mat-behov for perioden)
  const t = BUDGET_THRESHOLDS;
  const minLiving = periodFood + Math.round(periodFood * 0.15); // mat + litt transport
  let buffer = 0;
  if (remaining > minLiving + t.bufferLargeHeadroom) {
    buffer = Math.min(t.bufferLargeMax, Math.round(balance * t.bufferLargeRatio));
    remaining -= buffer;
  } else if (remaining > minLiving + t.bufferSmallHeadroom) {
    buffer = Math.min(t.bufferSmallMax, Math.round(balance * t.bufferSmallRatio));
    remaining -= buffer;
  }

  const monthlyDesired = desiredMonthlySavings(profile.goals || [], today);
  const desiredPeriodSavings = scaleSavingsToPeriod(monthlyDesired, daysLeft);

  // Aldri spare slik at det ikke er nok til mat/transport i perioden.
  // Uten registrerte utgifter: mer konservativt gulv (ukjent forpliktelse).
  const hasExpenseData =
    (profile.expenses || []).length > 0 || (profile.bills || []).length > 0;
  const floorForLiving = hasExpenseData
    ? Math.max(periodFood, daysLeft * 80)
    : Math.max(Math.round(periodFood * 1.4), daysLeft * 150);
  let adjustedSavings = 0;

  if (desiredPeriodSavings > 0 && remaining > floorForLiving) {
    const maxSavings = Math.max(0, remaining - floorForLiving);
    adjustedSavings = Math.min(desiredPeriodSavings, maxSavings);

    // Trapp ned gradvis hvis daglig budsjett blir for lavt
    const step = Math.max(50, Math.ceil(desiredPeriodSavings * 0.1));
    let disposableProbe = remaining - adjustedSavings;
    let dailyProbe = Math.floor(disposableProbe / daysLeft);
    while (adjustedSavings > 0 && dailyProbe < BUDGET_THRESHOLDS.minDailyWithSavings) {
      adjustedSavings = Math.max(0, adjustedSavings - step);
      disposableProbe = remaining - adjustedSavings;
      dailyProbe = Math.floor(Math.max(0, disposableProbe) / daysLeft);
    }
  }

  const disposable = Math.max(0, remaining - adjustedSavings);
  const daily = Math.floor(disposable / daysLeft);
  const weekly = Math.min(daily * 7, disposable);

  // Fordeling: nødvendigheter først (mat, transport), deretter fritid. Sparing egen post.
  // Bolig i fordelingen = registrerte forpliktelser (allerede trukket fra saldo).
  const transportTarget = Math.min(
    Math.round(disposable * 0.12),
    Math.round(periodFood * 0.25)
  );
  let mat = Math.min(periodFood, disposable);
  let transport = Math.min(transportTarget, Math.max(0, disposable - mat));
  // Hvis mat tok for mye og transport ble 0, juster litt
  if (disposable > 0 && transport === 0 && disposable > mat) {
    transport = Math.min(transportTarget, disposable - mat);
  }
  // Stram inn mat hvis total overstiger
  if (mat + transport > disposable) {
    transport = Math.max(0, Math.min(transport, disposable));
    mat = Math.max(0, disposable - transport);
  }
  const fritid = Math.max(0, disposable - mat - transport);

  const distribution = {
    Bolig: Math.round(obligations.total),
    Mat: Math.round(mat),
    Transport: Math.round(transport),
    Sparing: Math.round(adjustedSavings),
    Fritid: Math.round(fritid),
  };

  // Forventet saldo ved lønn hvis planen følges (≈ sikkerhetsbuffer)
  const expectedAtPayday = Math.round(
    balance - obligations.total - disposable - adjustedSavings
  );

  const assessment = pickAssessment({
    daily,
    disposable,
    obligations: obligations.total,
    balance,
  });

  const roomForExtraSaving =
    assessment.level === 'good' &&
    daily >= BUDGET_THRESHOLDS.goodDaily &&
    disposable - periodFood - transportTarget > BUDGET_THRESHOLDS.extraSavingSurplus;

  const kommentar = buildComment({
    daysLeft,
    daily,
    adjustedSavings: Math.round(adjustedSavings),
    desiredPeriodSavings,
    assessment,
    assumptions,
    roomForExtraSaving,
  });

  const payoutDate = payday;
  const start = new Date(payoutDate);
  start.setMonth(start.getMonth() - 1);

  const billSummary = summarizeBills(profile);

  return {
    rawBalance: balance,
    månedligSparing: Math.round(adjustedSavings),
    desiredMonthlySavings: monthlyDesired,
    desiredPeriodSavings,
    available: Math.round(disposable),
    daily,
    weekly,
    distribution,
    daysLeft,
    kommentar,
    assessment,
    obligations: obligations.total,
    unpaidBillsBeforePayday: billSummary.unpaidBeforePaydayAmount,
    paidBillsCount: billSummary.paidBillsCount,
    nextDueBill: billSummary.nextDueBill,
    buffer,
    expectedAtPayday,
    assumptions,
    periodeStart: start,
    periodeSlutt: payoutDate,
  };
}
