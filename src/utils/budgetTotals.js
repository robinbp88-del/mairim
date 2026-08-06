export function sumAmounts(items = []) {
  return items.reduce((sum, item) => sum + (parseFloat(item?.amount) || 0), 0);
}

/**
 * Dashboard-tall:
 * - Saldo trekkes ved handletur, uforutsett og når regning/fast utgift markeres betalt.
 * - Budsjettplan.available er derfor allerede basert på oppdatert saldo.
 * - «Loggført brukt» viser historikk; «gjenstår» = disponibelt (ikke dobbelttelling).
 */
export function getDashboardTotals({
  balance = 0,
  budgetPlan,
  shoppingLog = [],
  bills = [],
  unexpected = [],
  expenses = [],
} = {}) {
  const safeBalance = parseFloat(balance) || 0;
  const paidBills = (bills || []).filter((b) => b?.paid === true);
  const loggedSpent =
    sumAmounts(shoppingLog) +
    sumAmounts(paidBills) +
    sumAmounts(unexpected);

  const paidFixed = sumAmounts((expenses || []).filter((e) => e.paid));
  const unpaidFixed = sumAmounts((expenses || []).filter((e) => !e.paid));
  const totalSpent = loggedSpent + paidFixed;

  const available =
    budgetPlan && budgetPlan.available != null
      ? parseFloat(budgetPlan.available) || 0
      : safeBalance;

  // Saldo er allerede justert for loggførte utgifter — ikke trekk på nytt
  const remaining = Math.max(0, available);
  const periodBase = available + totalSpent;
  const percentUsed =
    periodBase > 0 ? Math.min(100, Math.round((totalSpent / periodBase) * 100)) : 0;

  return {
    balance: safeBalance,
    available,
    totalSpent,
    remaining,
    percentUsed,
    unpaidFixed,
    loggedSpent,
    paidFixed,
  };
}
