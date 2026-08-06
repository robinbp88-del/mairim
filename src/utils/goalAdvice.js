/**
 * Individuelle sparemål-råd basert på faktiske mål + budsjettplan.
 * Ingen oppdiktede tall.
 */

function toNumber(value, fallback = 0) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatKr(value) {
  return Math.round(toNumber(value)).toLocaleString('no-NO');
}

function formatDateNo(iso) {
  if (!iso) return '';
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(iso);
  return `${m[3]}.${m[2]}.${m[1]}`;
}

/**
 * Maks månedlig sparing økonomien tåler ifølge gjeldende plan
 * (plan.månedligSparing er for perioden frem til lønn).
 */
export function affordableMonthlyFromPlan(plan) {
  if (!plan || !plan.daysLeft) return 0;
  return Math.max(0, Math.round((toNumber(plan.månedligSparing) * 30) / plan.daysLeft));
}

/**
 * @param {object} goal
 * @param {{ plan?: object, today?: Date }} ctx
 */
export function analyzeGoal(goal, ctx = {}) {
  const today = ctx.today ? startOfDay(ctx.today) : startOfDay(new Date());
  const name = String(goal?.item || goal?.name || 'sparemålet').trim() || 'sparemålet';
  const price = toNumber(goal?.price);
  const saved = Math.max(0, toNumber(goal?.saved));
  const remaining = Math.max(0, price - saved);
  const active = goal?.active !== false;
  const priority = goal?.priority === true;

  const deadline = goal?.targetDate ? new Date(goal.targetDate) : null;
  const deadlineOk = deadline && !Number.isNaN(deadline.getTime());
  const daysLeft = deadlineOk
    ? Math.max(1, Math.ceil((startOfDay(deadline) - today) / (1000 * 60 * 60 * 24)))
    : null;
  const weeksLeft = daysLeft != null ? Math.max(1, Math.ceil(daysLeft / 7)) : null;
  const monthsLeft = daysLeft != null ? Math.max(1, Math.ceil(daysLeft / 30)) : null;

  const monthlyNeeded =
    remaining === 0 ? 0 : monthsLeft != null ? Math.ceil(remaining / monthsLeft) : null;
  const weeklyNeeded =
    remaining === 0 ? 0 : weeksLeft != null ? Math.ceil(remaining / weeksLeft) : null;

  const progressPct =
    price > 0 ? Math.min(100, Math.round((saved / price) * 100)) : 0;

  const affordableMonthly = affordableMonthlyFromPlan(ctx.plan);
  const daily = toNumber(ctx.plan?.daily);
  const assessmentLevel = ctx.plan?.assessment?.level;

  let realism = 'unknown';
  if (remaining === 0) {
    realism = 'done';
  } else if (monthlyNeeded == null) {
    realism = 'unknown';
  } else if (affordableMonthly <= 0 && monthlyNeeded > 0) {
    realism = 'unaffordable';
  } else if (monthlyNeeded > affordableMonthly * 1.15) {
    realism = 'tight';
  } else if (
    monthlyNeeded <= affordableMonthly * 0.7 &&
    (assessmentLevel === 'good' || assessmentLevel === 'ok' || daily >= 250)
  ) {
    realism = 'ahead';
  } else {
    realism = 'ok';
  }

  let weeksEarly = null;
  if (realism === 'ahead' && monthlyNeeded > 0 && affordableMonthly > monthlyNeeded) {
    const surplusMonthly = affordableMonthly - monthlyNeeded;
    const extra = surplusMonthly * (monthsLeft || 1);
    weeksEarly = Math.max(1, Math.floor(extra / Math.max(weeklyNeeded || 1, 1)));
  }

  return {
    name,
    price,
    saved,
    remaining,
    active,
    priority,
    targetDate: goal?.targetDate || '',
    daysLeft,
    weeksLeft,
    monthsLeft,
    monthlyNeeded,
    weeklyNeeded,
    progressPct,
    affordableMonthly,
    realism,
    weeksEarly,
  };
}

/**
 * Naturlig råd for ett sparemål.
 */
export function adviceForGoal(analysis) {
  if (!analysis) return '';

  const { name, remaining, targetDate, monthlyNeeded, weeklyNeeded, realism, weeksEarly, affordableMonthly } =
    analysis;
  const dateLabel = formatDateNo(targetDate);

  if (analysis.remaining === 0 && analysis.price > 0) {
    return `Du har allerede nådd målet for ${name}. Flott jobbet — vurder å deaktivere målet eller sette et nytt.`;
  }

  if (monthlyNeeded == null) {
    return `Sett en måldato for ${name} så Mairim kan beregne nødvendig sparing.`;
  }

  const base = `Du mangler ${formatKr(remaining)} kr til ${name}. For å nå målet${
    dateLabel ? ` innen ${dateLabel}` : ''
  } må du spare omtrent ${formatKr(monthlyNeeded)} kr per måned (ca. ${formatKr(weeklyNeeded)} kr per uke).`;

  if (realism === 'unaffordable') {
    return `${base} Med dagens disponible beløp og kommende forpliktelser er det ikke rom til sparing uten å gå på akkord med nødvendige utgifter. Prioriter faste utgifter, mat og transport først, eller juster målbeløp/måldato.`;
  }

  if (realism === 'tight') {
    const suggest = Math.max(0, affordableMonthly);
    return `${base} Med dagens disponible beløp virker dette målet stramt. Du kan enten redusere månedlig sparing til omtrent ${formatKr(
      suggest
    )} kr og flytte måldatoen, eller redusere målbeløpet.`;
  }

  if (realism === 'ahead' && weeksEarly) {
    return `${base} Du ligger godt an. Hvis du fortsetter innenfor det økonomien tåler, kan du nå målet omtrent ${weeksEarly} uke${
      weeksEarly === 1 ? '' : 'r'
    } tidligere.`;
  }

  return `${base} Med dagens økonomi ser dette ut til å være innen rekkevidde, så lenge du holder deg til dagsbudsjettet.`;
}

/**
 * Vurder alle mål + prioriteringsråd.
 */
export function analyzeGoals(goals = [], plan) {
  const list = (goals || []).map((g, index) => ({
    index,
    goal: g,
    analysis: analyzeGoal(g, { plan }),
    advice: '',
  }));

  list.forEach((row) => {
    row.advice = adviceForGoal(row.analysis);
  });

  const active = list.filter((r) => r.analysis.active && r.analysis.remaining > 0);
  const prioritized = active.find((r) => r.analysis.priority);
  const byDeadline = [...active].sort((a, b) => {
    const da = a.analysis.daysLeft ?? Infinity;
    const db = b.analysis.daysLeft ?? Infinity;
    return da - db;
  });

  const suggested = prioritized || byDeadline[0] || null;
  const affordableMonthly = affordableMonthlyFromPlan(plan);
  const totalMonthlyNeeded = active.reduce(
    (sum, r) => sum + (r.analysis.monthlyNeeded || 0),
    0
  );

  let priorityAdvice = '';
  if (active.length === 0) {
    priorityAdvice = '';
  } else if (active.length === 1) {
    priorityAdvice = `Aktive sparemål: ${active[0].analysis.name}.`;
  } else if (totalMonthlyNeeded > affordableMonthly && suggested) {
    priorityAdvice = `Du har ${active.length} aktive sparemål som til sammen krever ca. ${formatKr(
      totalMonthlyNeeded
    )} kr/mnd, mens økonomien tåler omtrent ${formatKr(
      affordableMonthly
    )} kr/mnd til sparing. Prioriter «${suggested.analysis.name}» først${
      suggested.analysis.priority ? '' : ' (tidligste måldato)'
    }, og sett de andre midlertidig som lavere prioritet.`;
  } else if (suggested) {
    priorityAdvice = `Med flere aktive mål: start med «${suggested.analysis.name}»${
      suggested.analysis.priority ? ' (valgt prioritet)' : ' (tidligste måldato)'
    }. Samlet nødvendig sparing er ca. ${formatKr(totalMonthlyNeeded)} kr/mnd.`;
  }

  return {
    goals: list,
    suggestedIndex: suggested ? suggested.index : null,
    priorityAdvice,
    totalMonthlyNeeded,
    affordableMonthly,
  };
}
