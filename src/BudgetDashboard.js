// src/BudgetDashboard.js
import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  FileText,
  History,
  LayoutDashboard,
  Lightbulb,
  RotateCcw,
  Settings,
  ShoppingCart,
  Target,
  TriangleAlert,
} from 'lucide-react';
import AdviceOverlay from './AdviceOverlay';
import DateInput from './components/DateInput';
import IconHeading from './components/ui/IconHeading';
import { AccordionSection, FormSheet, chromeStyles } from './components/ui/DashboardChrome';
import { ICON_SIZE, ICON_STROKE } from './components/ui/iconProps';
import layout from './Step.module.css';
import { buildBudgetPlan, summarizeBills } from './utils/budgetEngine';
import { getDashboardTotals } from './utils/budgetTotals';
import { analyzeGoals } from './utils/goalAdvice';
import {
  dismissPeriodNotice,
  ensureActivePeriod,
} from './utils/periodEngine';
import { isoToNo } from './utils/dates';
import { numberInputValue, parseNumberInput, toStoredNumber } from './utils/numbers';

function planSignature(plan) {
  if (!plan) return '';
  return [
    plan.rawBalance,
    plan.available,
    plan.daily,
    plan.weekly,
    plan.daysLeft,
    plan.månedligSparing,
    plan.obligations,
    plan.expectedAtPayday,
    plan.kommentar,
    plan.assessment?.level,
    plan.unpaidBillsBeforePayday,
    plan.paidBillsCount,
  ].join('|');
}

function adjustBalance(current, delta) {
  return Math.max(0, (parseFloat(current) || 0) + delta);
}

function formatKr(n) {
  return Math.round(parseFloat(n) || 0).toLocaleString('no-NO');
}

function BudgetDashboard({ profile, setProfile, onReset }) {
  const [shoppingLog, setShoppingLog] = useState(profile.shoppingLog || []);
  const [bills, setBills] = useState(profile.bills || []);
  const [unexpected, setUnexpected] = useState(profile.unexpected || []);
  const [expenses, setExpenses] = useState(profile.expenses || []);
  const [goals, setGoals] = useState(profile.goals || []);

  const [openSection, setOpenSection] = useState(null);
  const [sheet, setSheet] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [formError, setFormError] = useState('');
  const [summaryView, setSummaryView] = useState(null); // summary object or null

  // Shared form drafts for sheets
  const [draft, setDraft] = useState({});

  const lastPlanSig = useRef('');

  useEffect(() => {
    setBills(profile.bills || []);
  }, [profile.bills]);
  useEffect(() => {
    setShoppingLog(profile.shoppingLog || []);
  }, [profile.shoppingLog]);
  useEffect(() => {
    setUnexpected(profile.unexpected || []);
  }, [profile.unexpected]);
  useEffect(() => {
    setExpenses(profile.expenses || []);
  }, [profile.expenses]);
  useEffect(() => {
    setGoals(profile.goals || []);
  }, [profile.goals]);

  useEffect(() => {
    if (!profile?.nextPayoutDate) return;
    if (!profile.adults && profile.adults !== 0) return;
    // Tom saldo under redigering → behandle som 0, ikke hopp over omregning
    if (profile.balance === null || profile.balance === undefined) return;

    const next = buildBudgetPlan(profile);
    if (!next) return;

    const sig = planSignature(next);
    if (sig === lastPlanSig.current && profile.budgetPlan) return;
    lastPlanSig.current = sig;

    setProfile((prev) => {
      const withPlan = {
        ...prev,
        onboardingComplete: true,
        budgetPlan: next,
      };
      const ensured = ensureActivePeriod(withPlan);
      const bp = ensured.budgetPeriod || {};
      return {
        ...ensured,
        budgetPeriod: {
          ...bp,
          availableAtStart: Number.isFinite(bp.availableAtStart)
            ? bp.availableAtStart
            : next.available,
          plannedSavings: Number.isFinite(bp.plannedSavings)
            ? bp.plannedSavings
            : next.månedligSparing,
        },
      };
    });
  }, [
    profile.balance,
    profile.nextPayoutDate,
    profile.bills,
    profile.expenses,
    profile.goals,
    profile.adults,
    profile.children,
    profile.diet,
    profile.income,
    setProfile,
  ]);

  const plan = profile.budgetPlan;
  const billSummary = summarizeBills(profile);
  const goalReport = analyzeGoals(goals, plan);

  const toggleSection = (id) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  const closeSheet = () => {
    setSheet(null);
    setDraft({});
    setFormError('');
  };

  const openSheet = (type, index = null, initial = {}) => {
    setFormError('');
    setDraft(initial);
    setSheet({ type, index });
  };

  const persistShopping = (updated, balanceDelta = 0) => {
    setShoppingLog(updated);
    setProfile((prev) => ({
      ...prev,
      shoppingLog: updated,
      balance: balanceDelta === 0 ? prev.balance : adjustBalance(prev.balance, balanceDelta),
    }));
  };

  const persistUnexpected = (updated, balanceDelta = 0) => {
    setUnexpected(updated);
    setProfile((prev) => ({
      ...prev,
      unexpected: updated,
      balance: balanceDelta === 0 ? prev.balance : adjustBalance(prev.balance, balanceDelta),
    }));
  };

  const persistBills = (updated, balanceDelta = 0) => {
    setBills(updated);
    setProfile((prev) => ({
      ...prev,
      bills: updated,
      balance: balanceDelta === 0 ? prev.balance : adjustBalance(prev.balance, balanceDelta),
    }));
  };

  const persistExpenses = (updated, balanceDelta = 0) => {
    setExpenses(updated);
    setProfile((prev) => ({
      ...prev,
      expenses: updated,
      balance: balanceDelta === 0 ? prev.balance : adjustBalance(prev.balance, balanceDelta),
    }));
  };

  const persistGoals = (updated) => {
    setGoals(updated);
    setProfile((prev) => ({ ...prev, goals: updated }));
  };

  const handleBalanceChange = (e) => {
    setProfile((prev) => ({ ...prev, balance: parseNumberInput(e.target.value) }));
  };

  const submitSheet = () => {
    if (!sheet) return;
    const { type, index } = sheet;

    if (type === 'addBill' || type === 'editBill') {
      if (!draft.name?.trim() || draft.amount === '' || draft.amount == null || !draft.due) {
        setFormError('Fyll inn navn, beløp og forfallsdato.');
        return;
      }
      const amount = Number(draft.amount);
      if (!Number.isFinite(amount) || amount < 0) {
        setFormError('Ugyldig beløp.');
        return;
      }
      if (type === 'addBill') {
        persistBills([
          ...bills,
          { name: draft.name.trim(), amount, due: draft.due, paid: false },
        ]);
      } else {
        const old = bills[index];
        const updated = bills.map((b, i) =>
          i === index
            ? { ...b, name: draft.name.trim(), amount, due: draft.due }
            : b
        );
        const delta = old?.paid === true ? (parseFloat(old.amount) || 0) - amount : 0;
        persistBills(updated, delta);
      }
      closeSheet();
      return;
    }

    if (type === 'addShopping' || type === 'editShopping') {
      if (!draft.date || draft.amount === '' || draft.amount == null) {
        setFormError('Fyll inn dato og beløp.');
        return;
      }
      const amount = Number(draft.amount);
      if (!Number.isFinite(amount) || amount < 0) {
        setFormError('Ugyldig beløp.');
        return;
      }
      if (type === 'addShopping') {
        persistShopping([...shoppingLog, { date: draft.date, amount }], -amount);
      } else {
        const oldAmount = parseFloat(shoppingLog[index]?.amount) || 0;
        const updated = shoppingLog.map((e, i) =>
          i === index ? { date: draft.date, amount } : e
        );
        persistShopping(updated, oldAmount - amount);
      }
      closeSheet();
      return;
    }

    if (type === 'addUnexpected' || type === 'editUnexpected') {
      if (!draft.note?.trim() || draft.amount === '' || draft.amount == null) {
        setFormError('Fyll inn beskrivelse og beløp.');
        return;
      }
      const amount = Number(draft.amount);
      if (!Number.isFinite(amount) || amount < 0) {
        setFormError('Ugyldig beløp.');
        return;
      }
      if (type === 'addUnexpected') {
        persistUnexpected(
          [...unexpected, { note: draft.note.trim(), amount }],
          -amount
        );
      } else {
        const oldAmount = parseFloat(unexpected[index]?.amount) || 0;
        const updated = unexpected.map((e, i) =>
          i === index ? { note: draft.note.trim(), amount } : e
        );
        persistUnexpected(updated, oldAmount - amount);
      }
      closeSheet();
      return;
    }

    if (type === 'addFixed' || type === 'editFixed') {
      if (!draft.name?.trim() || draft.amount === '' || draft.amount == null) {
        setFormError('Fyll inn navn og beløp.');
        return;
      }
      const amount = Number(draft.amount);
      if (!Number.isFinite(amount) || amount < 0) {
        setFormError('Ugyldig beløp.');
        return;
      }
      if (type === 'addFixed') {
        persistExpenses([
          ...expenses,
          { name: draft.name.trim(), amount, paid: false, category: 'annet' },
        ]);
      } else {
        const old = expenses[index];
        const updated = expenses.map((e, i) =>
          i === index ? { ...e, name: draft.name.trim(), amount } : e
        );
        const delta = old?.paid === true ? (parseFloat(old.amount) || 0) - amount : 0;
        persistExpenses(updated, delta);
      }
      closeSheet();
      return;
    }

    if (type === 'addGoal' || type === 'editGoal') {
      if (!draft.item?.trim()) {
        setFormError('Skriv inn hva du vil spare til.');
        return;
      }
      if (draft.price === '' || draft.price == null) {
        setFormError('Oppgi målbeløp.');
        return;
      }
      if (!draft.targetDate) {
        setFormError('Oppgi måldato.');
        return;
      }
      const goal = {
        item: draft.item.trim(),
        price: toStoredNumber(draft.price, 0),
        targetDate: draft.targetDate,
        saved: toStoredNumber(draft.saved, 0),
        active: draft.active !== false,
        priority: draft.priority === true,
      };
      if (type === 'addGoal') {
        persistGoals([
          ...goals,
          {
            ...goal,
            active: true,
            priority: goals.every((g) => !g.priority),
          },
        ]);
      } else {
        persistGoals(goals.map((g, i) => (i === index ? { ...g, ...goal } : g)));
      }
      closeSheet();
      return;
    }

    if (type === 'settings') {
      setProfile((prev) => ({
        ...prev,
        balance:
          draft.balance === '' || draft.balance == null
            ? prev.balance
            : parseNumberInput(String(draft.balance)),
        income:
          draft.income === '' || draft.income == null
            ? prev.income
            : parseNumberInput(String(draft.income)),
        nextPayoutDate: draft.nextPayoutDate || prev.nextPayoutDate,
        adults: toStoredNumber(draft.adults, prev.adults ?? 1),
        children: toStoredNumber(draft.children, prev.children ?? 0),
      }));
      closeSheet();
    }
  };

  const toggleBillPaid = (index) => {
    const bill = bills[index];
    if (!bill) return;
    const amount = parseFloat(bill.amount) || 0;
    const becomingPaid = bill.paid !== true;
    persistBills(
      bills.map((b, i) => (i === index ? { ...b, paid: becomingPaid } : b)),
      becomingPaid ? -amount : amount
    );
  };

  const deleteBill = (index) => {
    const bill = bills[index];
    if (!bill) return;
    const amount = parseFloat(bill.amount) || 0;
    persistBills(
      bills.filter((_, i) => i !== index),
      bill.paid === true ? amount : 0
    );
  };

  const toggleExpensePaid = (index) => {
    const exp = expenses[index];
    if (!exp) return;
    const amount = parseFloat(exp.amount) || 0;
    const becomingPaid = exp.paid !== true;
    persistExpenses(
      expenses.map((e, i) => (i === index ? { ...e, paid: becomingPaid } : e)),
      becomingPaid ? -amount : amount
    );
  };

  const deleteExpense = (index) => {
    const exp = expenses[index];
    if (!exp) return;
    const amount = parseFloat(exp.amount) || 0;
    persistExpenses(
      expenses.filter((_, i) => i !== index),
      exp.paid ? amount : 0
    );
  };

  const deleteShopping = (index) => {
    const amount = parseFloat(shoppingLog[index]?.amount) || 0;
    persistShopping(
      shoppingLog.filter((_, i) => i !== index),
      amount
    );
  };

  const deleteUnexpected = (index) => {
    const amount = parseFloat(unexpected[index]?.amount) || 0;
    persistUnexpected(
      unexpected.filter((_, i) => i !== index),
      amount
    );
  };

  const deleteGoal = (index) => {
    persistGoals(goals.filter((_, i) => i !== index));
  };

  const toggleGoalActive = (index) => {
    persistGoals(
      goals.map((g, i) => (i === index ? { ...g, active: g.active === false } : g))
    );
  };

  const setGoalPriority = (index) => {
    persistGoals(
      goals.map((g, i) => ({
        ...g,
        priority: i === index,
        active: i === index ? true : g.active,
      }))
    );
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setConfirmReset(false);
    if (typeof onReset === 'function') onReset();
    else setProfile({});
  };

  const {
    totalSpent,
    remaining,
    percentUsed,
    available,
    unpaidFixed,
  } = getDashboardTotals({
    balance: profile.balance,
    budgetPlan: profile.budgetPlan,
    shoppingLog,
    bills,
    unexpected,
    expenses,
  });

  const unpaidBillsCount = bills.filter((b) => b.paid !== true).length;
  const activeGoals = goals.filter((g) => g.active !== false);
  const shoppingTotal = shoppingLog.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const unexpectedTotal = unexpected.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const fixedTotal = expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const primaryGoal = activeGoals[0];

  const sheetTitle = {
    addBill: 'Legg til regning',
    editBill: 'Rediger regning',
    addShopping: 'Legg til handletur',
    editShopping: 'Rediger handletur',
    addUnexpected: 'Legg til uforutsett',
    editUnexpected: 'Rediger uforutsett',
    addFixed: 'Legg til fast utgift',
    editFixed: 'Rediger fast utgift',
    addGoal: 'Legg til sparemål',
    editGoal: 'Rediger sparemål',
    settings: 'Grunnopplysninger',
  }[sheet?.type] || '';

  return (
    <div className={layout.stepContainer}>
      <IconHeading icon={LayoutDashboard}>Budsjettoversikt</IconHeading>

      <div className={layout.inlineField}>
        <strong>Saldo</strong>
        <input
          type="number"
          value={numberInputValue(profile.balance)}
          onChange={handleBalanceChange}
          placeholder="Beløp"
        />
        <span className={layout.muted}>kr</span>
      </div>

      {plan ? (
        <>
          <p>
            <strong>Dager til neste utbetaling:</strong> {plan.daysLeft} dager
          </p>
          <p>
            <strong>Disponibelt beløp:</strong> kr {plan.available}
          </p>
          <p>
            <strong>Daglig budsjett:</strong> kr {plan.daily}
          </p>
          <p>
            <strong>Ukentlig budsjett:</strong> kr {plan.weekly}
          </p>
          {plan.assessment && (
            <p>
              <strong>{plan.assessment.title}:</strong> {plan.assessment.blurb}
            </p>
          )}
          {plan.kommentar && <p className={layout.hint}>{plan.kommentar}</p>}
        </>
      ) : (
        <p className={layout.muted}>
          Budsjettforslag mangler — oppdater saldo og utbetalingsdato.
        </p>
      )}

      {profile.showPeriodNotice && profile.latestPeriodSummary && (
        <div
          className={layout.listItem}
          style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}
        >
          <strong>Ny budsjettperiode er startet</strong>
          <p className={layout.muted} style={{ margin: 0 }}>
            Forrige periode ({isoToNo(profile.latestPeriodSummary.start)} –{' '}
            {isoToNo(profile.latestPeriodSummary.end)}) er arkivert. Oppdater
            gjerne saldoen når lønnen er inne — den legges ikke til automatisk.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button
              type="button"
              className={layout.secondaryButton}
              onClick={() => setSummaryView(profile.latestPeriodSummary)}
            >
              Se oppsummering fra forrige periode
            </button>
            <button
              type="button"
              className={layout.ghostButton}
              onClick={() => setProfile((prev) => dismissPeriodNotice(prev))}
            >
              Skjul
            </button>
          </div>
        </div>
      )}

      {profile.latestPeriodSummary?.advice && (
        <p className={layout.hint}>
          <strong>Råd etter forrige periode:</strong>{' '}
          {profile.latestPeriodSummary.advice}
        </p>
      )}

      <button type="button" onClick={() => setShowOverlay(true)} className={layout.nextButton}>
        <Lightbulb size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden="true" />
        Få råd
      </button>

      <p className={layout.muted} style={{ marginTop: -8 }}>
        Loggført brukt kr {formatKr(totalSpent)} · Gjenstår kr {formatKr(remaining)}
        {unpaidFixed > 0 ? ` · Ubetalte faste kr ${formatKr(unpaidFixed)}` : ''}
        {available > 0 ? ` · ${percentUsed}% brukt` : ''}
      </p>

      <div className={chromeStyles.accordion}>
        <AccordionSection
          id="bills"
          icon={FileText}
          title="Regninger"
          summary={
            unpaidBillsCount > 0
              ? `${unpaidBillsCount} ubetalte · kr ${formatKr(billSummary.unpaidBeforePaydayAmount)} før neste lønn${
                  billSummary.nextDueBill
                    ? ` · Neste: ${isoToNo(billSummary.nextDueBill.due)}`
                    : ''
                }`
              : bills.length > 0
                ? `${bills.length} registrert · ingen ubetalte`
                : 'Ingen registrert'
          }
          open={openSection === 'bills'}
          onToggle={toggleSection}
        >
          <button
            type="button"
            className={layout.secondaryButton}
            onClick={() => openSheet('addBill', null, { name: '', amount: '', due: '' })}
          >
            Legg til regning
          </button>
          {bills.length === 0 ? (
            <p className={layout.muted}>Ingen regninger ennå.</p>
          ) : (
            <ul className={layout.list}>
              {bills.map((bill, i) => (
                <li key={`bill-${i}`} className={layout.listItem} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <span>
                    {bill.name} – kr {bill.amount} ({isoToNo(bill.due)}) ·{' '}
                    {bill.paid === true ? 'Betalt' : 'Ubetalt'}
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <button type="button" className={layout.ghostButton} onClick={() => toggleBillPaid(i)}>
                      {bill.paid === true ? 'Ubetalt' : 'Betalt'}
                    </button>
                    <button
                      type="button"
                      className={layout.ghostButton}
                      onClick={() =>
                        openSheet('editBill', i, {
                          name: bill.name,
                          amount: bill.amount,
                          due: bill.due,
                        })
                      }
                    >
                      Rediger
                    </button>
                    <button type="button" className={layout.ghostButton} onClick={() => deleteBill(i)}>
                      Slett
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AccordionSection>

        <AccordionSection
          id="goals"
          icon={Target}
          title="Sparemål"
          summary={
            activeGoals.length > 0
              ? `${activeGoals.length} aktiv${activeGoals.length === 1 ? 't' : 'e'} mål · ${
                  primaryGoal
                    ? `${primaryGoal.item} · ${formatKr(primaryGoal.saved)} av ${formatKr(primaryGoal.price)} kr`
                    : ''
                }`
              : goals.length > 0
                ? `${goals.length} pauset`
                : 'Ingen registrert'
          }
          open={openSection === 'goals'}
          onToggle={toggleSection}
        >
          {goalReport.priorityAdvice ? (
            <p className={layout.hint}>{goalReport.priorityAdvice}</p>
          ) : null}
          <button
            type="button"
            className={layout.secondaryButton}
            onClick={() =>
              openSheet('addGoal', null, {
                item: '',
                price: '',
                targetDate: '',
                saved: '',
              })
            }
          >
            Legg til sparemål
          </button>
          {goals.length === 0 ? (
            <p className={layout.muted}>Ingen sparemål ennå.</p>
          ) : (
            <ul className={layout.list}>
              {goalReport.goals.map(({ index, analysis, advice }) => {
                const goal = goals[index];
                return (
                  <li
                    key={`goal-${index}`}
                    className={layout.listItem}
                    style={{ flexDirection: 'column', alignItems: 'stretch' }}
                  >
                    <strong>
                      {goal.item}
                      {goal.priority ? ' · Prioritert' : ''}
                      {goal.active === false ? ' · Pauset' : ''}
                    </strong>
                    <span className={layout.muted}>
                      {formatKr(analysis.saved)} av {formatKr(analysis.price)} kr · Mangler{' '}
                      {formatKr(analysis.remaining)} · Frist {isoToNo(goal.targetDate)}
                    </span>
                    {analysis.monthlyNeeded != null && (
                      <span className={layout.muted}>
                        Ca. {formatKr(analysis.monthlyNeeded)} kr/mnd ·{' '}
                        {formatKr(analysis.weeklyNeeded)} kr/uke
                      </span>
                    )}
                    <div className={layout.progressTrack}>
                      <div
                        className={layout.progressFill}
                        style={{ width: `${analysis.progressPct}%` }}
                      />
                    </div>
                    <p className={layout.hint}>{advice}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <button
                        type="button"
                        className={layout.ghostButton}
                        onClick={() => toggleGoalActive(index)}
                      >
                        {goal.active === false ? 'Aktiver' : 'Deaktiver'}
                      </button>
                      <button
                        type="button"
                        className={layout.ghostButton}
                        onClick={() => setGoalPriority(index)}
                      >
                        Prioriter
                      </button>
                      <button
                        type="button"
                        className={layout.ghostButton}
                        onClick={() =>
                          openSheet('editGoal', index, {
                            item: goal.item,
                            price: goal.price,
                            targetDate: goal.targetDate,
                            saved: goal.saved,
                            active: goal.active,
                            priority: goal.priority,
                          })
                        }
                      >
                        Rediger
                      </button>
                      <button
                        type="button"
                        className={layout.ghostButton}
                        onClick={() => deleteGoal(index)}
                      >
                        Slett
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </AccordionSection>

        <AccordionSection
          id="fixed"
          icon={Check}
          title="Faste utgifter"
          summary={
            expenses.length > 0
              ? `kr ${formatKr(fixedTotal)} · ${expenses.filter((e) => !e.paid).length} ubetalte`
              : 'Ingen registrert'
          }
          open={openSection === 'fixed'}
          onToggle={toggleSection}
        >
          <button
            type="button"
            className={layout.secondaryButton}
            onClick={() => openSheet('addFixed', null, { name: '', amount: '' })}
          >
            Legg til fast utgift
          </button>
          {expenses.length === 0 ? (
            <p className={layout.muted}>Ingen faste utgifter.</p>
          ) : (
            <ul className={layout.list}>
              {expenses.map((exp, i) => (
                <li
                  key={`exp-${i}`}
                  className={layout.listItem}
                  style={{ flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <span>
                    {exp.name} – kr {exp.amount} · {exp.paid ? 'Betalt' : 'Ubetalt'}
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <button
                      type="button"
                      className={layout.ghostButton}
                      onClick={() => toggleExpensePaid(i)}
                    >
                      {exp.paid ? 'Ubetalt' : 'Betalt'}
                    </button>
                    <button
                      type="button"
                      className={layout.ghostButton}
                      onClick={() =>
                        openSheet('editFixed', i, { name: exp.name, amount: exp.amount })
                      }
                    >
                      Rediger
                    </button>
                    <button
                      type="button"
                      className={layout.ghostButton}
                      onClick={() => deleteExpense(i)}
                    >
                      Slett
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AccordionSection>

        <AccordionSection
          id="shopping"
          icon={ShoppingCart}
          title="Handleturer"
          summary={
            shoppingLog.length > 0
              ? `${shoppingLog.length} registrert · kr ${formatKr(shoppingTotal)} brukt`
              : 'Ingen registrert'
          }
          open={openSection === 'shopping'}
          onToggle={toggleSection}
        >
          <button
            type="button"
            className={layout.secondaryButton}
            onClick={() => openSheet('addShopping', null, { date: '', amount: '' })}
          >
            Legg til handletur
          </button>
          {shoppingLog.length === 0 ? (
            <p className={layout.muted}>Ingen handleturer.</p>
          ) : (
            <ul className={layout.list}>
              {shoppingLog.map((entry, i) => (
                <li
                  key={`shop-${i}`}
                  className={layout.listItem}
                  style={{ flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <span>
                    {isoToNo(entry.date)}: kr {entry.amount}
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <button
                      type="button"
                      className={layout.ghostButton}
                      onClick={() =>
                        openSheet('editShopping', i, {
                          date: entry.date,
                          amount: entry.amount,
                        })
                      }
                    >
                      Rediger
                    </button>
                    <button
                      type="button"
                      className={layout.ghostButton}
                      onClick={() => deleteShopping(i)}
                    >
                      Slett
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AccordionSection>

        <AccordionSection
          id="unexpected"
          icon={TriangleAlert}
          title="Uforutsette utgifter"
          summary={
            unexpected.length > 0
              ? `${unexpected.length} registrert · kr ${formatKr(unexpectedTotal)}`
              : 'kr 0'
          }
          open={openSection === 'unexpected'}
          onToggle={toggleSection}
        >
          <button
            type="button"
            className={layout.secondaryButton}
            onClick={() => openSheet('addUnexpected', null, { note: '', amount: '' })}
          >
            Legg til uforutsett
          </button>
          {unexpected.length === 0 ? (
            <p className={layout.muted}>Ingen uforutsette utgifter.</p>
          ) : (
            <ul className={layout.list}>
              {unexpected.map((exp, i) => (
                <li
                  key={`unexp-${i}`}
                  className={layout.listItem}
                  style={{ flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <span>
                    {exp.note}: kr {exp.amount}
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <button
                      type="button"
                      className={layout.ghostButton}
                      onClick={() =>
                        openSheet('editUnexpected', i, {
                          note: exp.note,
                          amount: exp.amount,
                        })
                      }
                    >
                      Rediger
                    </button>
                    <button
                      type="button"
                      className={layout.ghostButton}
                      onClick={() => deleteUnexpected(i)}
                    >
                      Slett
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AccordionSection>

        <AccordionSection
          id="history"
          icon={History}
          title="Tidligere perioder"
          summary={
            (profile.periodHistory || []).length > 0
              ? `${profile.periodHistory.length} arkivert${
                  profile.periodHistory.length === 1 ? '' : 'e'
                }`
              : 'Ingen historikk ennå'
          }
          open={openSection === 'history'}
          onToggle={toggleSection}
        >
          {(profile.periodHistory || []).length === 0 ? (
            <p className={layout.muted}>Ingen avsluttede perioder ennå.</p>
          ) : (
            <ul className={layout.list}>
              {(profile.periodHistory || []).slice(0, 6).map((s) => (
                <li
                  key={s.id || `${s.start}-${s.end}`}
                  className={layout.listItem}
                  style={{ flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <span>
                    {isoToNo(s.start)} – {isoToNo(s.end)} · Brukt kr{' '}
                    {formatKr(s.totalSpent)}
                    {s.withinBudget ? ' · Innenfor budsjett' : ' · Over budsjett'}
                  </span>
                  <button
                    type="button"
                    className={layout.ghostButton}
                    onClick={() => setSummaryView(s)}
                  >
                    Vis oppsummering
                  </button>
                </li>
              ))}
            </ul>
          )}
        </AccordionSection>

        <AccordionSection
          id="settings"
          icon={Settings}
          title="Innstillinger"
          summary="Grunnopplysninger og nullstilling"
          open={openSection === 'settings'}
          onToggle={toggleSection}
        >
          <button
            type="button"
            className={layout.secondaryButton}
            onClick={() =>
              openSheet('settings', null, {
                balance: profile.balance,
                income: profile.income,
                nextPayoutDate: profile.nextPayoutDate || '',
                adults: profile.adults,
                children: profile.children,
              })
            }
          >
            Rediger grunnopplysninger
          </button>

          {!confirmReset ? (
            <button type="button" onClick={handleReset} className={layout.ghostButton}>
              <RotateCcw size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden="true" />
              Start oppsett på nytt
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p className={chromeStyles.dangerText}>
                Dette sletter all lagret data for Mairim på denne enheten. Er du sikker?
              </p>
              <div className={layout.buttonRow}>
                <button
                  type="button"
                  className={layout.secondaryButton}
                  onClick={() => setConfirmReset(false)}
                >
                  Avbryt
                </button>
                <button type="button" className={layout.nextButton} onClick={handleReset}>
                  Ja, slett alt
                </button>
              </div>
            </div>
          )}
          <p className={layout.muted}>
            Data lagres kun lokalt i nettleseren.
          </p>
        </AccordionSection>
      </div>

      {summaryView && (
        <FormSheet
          title="Periodoppsummering"
          onClose={() => setSummaryView(null)}
          footer={
            <button
              type="button"
              className={layout.nextButton}
              onClick={() => setSummaryView(null)}
            >
              Lukk
            </button>
          }
        >
          <p className={layout.muted} style={{ margin: 0 }}>
            {isoToNo(summaryView.start)} – {isoToNo(summaryView.end)}
          </p>
          <p>
            <strong>Totalt brukt:</strong> kr {formatKr(summaryView.totalSpent)}
          </p>
          <p>
            <strong>Handleturer:</strong> kr {formatKr(summaryView.shoppingTotal)}
          </p>
          <p>
            <strong>Uforutsett:</strong> kr {formatKr(summaryView.unexpectedTotal)}
          </p>
          <p>
            <strong>Betalte regninger:</strong> kr {formatKr(summaryView.paidBillsTotal)}
          </p>
          <p>
            <strong>Betalte faste:</strong> kr {formatKr(summaryView.paidFixedTotal)}
          </p>
          <p>
            <strong>Spart / satt av:</strong> kr {formatKr(summaryView.savedAmount)}
          </p>
          <p>
            <strong>Saldo start:</strong> kr {formatKr(summaryView.openingBalance)}
          </p>
          <p>
            <strong>Saldo slutt:</strong> kr {formatKr(summaryView.closingBalance)}
          </p>
          <p>
            <strong>Disponibelt budsjett:</strong> kr{' '}
            {formatKr(summaryView.availableBudget)}
          </p>
          <p>
            <strong>Budsjettstatus:</strong>{' '}
            {summaryView.withinBudget
              ? 'Innenfor disponibelt'
              : `Over med kr ${formatKr(summaryView.overBy)}`}
          </p>
          <p>
            <strong>Snitt per dag:</strong> kr {formatKr(summaryView.avgPerDay)}
          </p>
          {summaryView.largestExpense && (
            <p>
              <strong>Største utgift:</strong> {summaryView.largestExpense.label}{' '}
              (kr {formatKr(summaryView.largestExpense.amount)})
            </p>
          )}
          {summaryView.goalProgress?.length > 0 && (
            <>
              <p>
                <strong>Sparemål med fremgang:</strong>
              </p>
              <ul className={layout.list}>
                {summaryView.goalProgress.map((g) => (
                  <li key={g.item} className={layout.listItem}>
                    {g.item}: +{formatKr(g.delta)} kr
                  </li>
                ))}
              </ul>
            </>
          )}
          {summaryView.advice && (
            <p className={layout.hint}>{summaryView.advice}</p>
          )}
        </FormSheet>
      )}

      {sheet && (
        <FormSheet
          title={sheetTitle}
          onClose={closeSheet}
          footer={
            <>
              <button type="button" className={layout.secondaryButton} onClick={closeSheet}>
                Avbryt
              </button>
              <button type="button" className={layout.nextButton} onClick={submitSheet}>
                Lagre
              </button>
            </>
          }
        >
          {(sheet.type === 'addBill' || sheet.type === 'editBill') && (
            <>
              <label>Navn</label>
              <input
                type="text"
                value={draft.name || ''}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
              <label>Beløp</label>
              <input
                type="number"
                value={numberInputValue(draft.amount)}
                onChange={(e) =>
                  setDraft({ ...draft, amount: parseNumberInput(e.target.value) })
                }
              />
              <label>Forfall</label>
              <DateInput
                value={draft.due || ''}
                onChange={(v) => setDraft({ ...draft, due: v })}
                className={layout.field}
              />
            </>
          )}

          {(sheet.type === 'addShopping' || sheet.type === 'editShopping') && (
            <>
              <label>Dato</label>
              <DateInput
                value={draft.date || ''}
                onChange={(v) => setDraft({ ...draft, date: v })}
                className={layout.field}
              />
              <label>Beløp</label>
              <input
                type="number"
                value={numberInputValue(draft.amount)}
                onChange={(e) =>
                  setDraft({ ...draft, amount: parseNumberInput(e.target.value) })
                }
              />
            </>
          )}

          {(sheet.type === 'addUnexpected' || sheet.type === 'editUnexpected') && (
            <>
              <label>Beskrivelse</label>
              <input
                type="text"
                value={draft.note || ''}
                onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              />
              <label>Beløp</label>
              <input
                type="number"
                value={numberInputValue(draft.amount)}
                onChange={(e) =>
                  setDraft({ ...draft, amount: parseNumberInput(e.target.value) })
                }
              />
            </>
          )}

          {(sheet.type === 'addFixed' || sheet.type === 'editFixed') && (
            <>
              <label>Navn</label>
              <input
                type="text"
                value={draft.name || ''}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
              <label>Beløp</label>
              <input
                type="number"
                value={numberInputValue(draft.amount)}
                onChange={(e) =>
                  setDraft({ ...draft, amount: parseNumberInput(e.target.value) })
                }
              />
            </>
          )}

          {(sheet.type === 'addGoal' || sheet.type === 'editGoal') && (
            <>
              <label>Hva sparer du til?</label>
              <input
                type="text"
                value={draft.item || ''}
                onChange={(e) => setDraft({ ...draft, item: e.target.value })}
              />
              <label>Målbeløp</label>
              <input
                type="number"
                value={numberInputValue(draft.price)}
                onChange={(e) =>
                  setDraft({ ...draft, price: parseNumberInput(e.target.value) })
                }
              />
              <label>Måldato</label>
              <DateInput
                value={draft.targetDate || ''}
                onChange={(v) => setDraft({ ...draft, targetDate: v })}
                className={layout.field}
              />
              <label>Allerede spart</label>
              <input
                type="number"
                value={numberInputValue(draft.saved)}
                onChange={(e) =>
                  setDraft({ ...draft, saved: parseNumberInput(e.target.value) })
                }
              />
            </>
          )}

          {sheet.type === 'settings' && (
            <>
              <label>Saldo</label>
              <input
                type="number"
                value={numberInputValue(draft.balance)}
                onChange={(e) =>
                  setDraft({ ...draft, balance: parseNumberInput(e.target.value) })
                }
              />
              <label>Neste utbetaling</label>
              <DateInput
                value={draft.nextPayoutDate || ''}
                onChange={(v) => setDraft({ ...draft, nextPayoutDate: v })}
                className={layout.field}
              />
              <label>Inntekt</label>
              <input
                type="number"
                value={numberInputValue(draft.income)}
                onChange={(e) =>
                  setDraft({ ...draft, income: parseNumberInput(e.target.value) })
                }
              />
              <label>Voksne</label>
              <input
                type="number"
                min="0"
                value={numberInputValue(draft.adults)}
                onChange={(e) =>
                  setDraft({ ...draft, adults: parseNumberInput(e.target.value) })
                }
              />
              <label>Barn</label>
              <input
                type="number"
                min="0"
                value={numberInputValue(draft.children)}
                onChange={(e) =>
                  setDraft({ ...draft, children: parseNumberInput(e.target.value) })
                }
              />
            </>
          )}

          {formError ? (
            <p className={chromeStyles.dangerText}>{formError}</p>
          ) : null}
        </FormSheet>
      )}

      {showOverlay && (
        <AdviceOverlay profile={profile} onClose={() => setShowOverlay(false)} />
      )}
    </div>
  );
}

export default BudgetDashboard;
