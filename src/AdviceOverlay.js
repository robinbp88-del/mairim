// src/AdviceOverlay.js
import React, { useState } from 'react';
import { FileText, ShoppingCart, TriangleAlert, Wallet } from 'lucide-react';
import styles from './AdviceOverlay.module.css';
import { ICON_SIZE, ICON_STROKE } from './components/ui/iconProps';

function formatKr(value) {
  const number = Number(value);
  if (Number.isNaN(number)) return '0';
  return number.toLocaleString('no-NO');
}

function daysUntil(dateString) {
  if (!dateString) return null;
  const target = new Date(dateString);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

function getAdvice(type, profile = {}) {
  const balance = parseFloat(profile.balance) || 0;
  const income = parseFloat(profile.income) || 0;
  const plan = profile.budgetPlan || {};
  const unpaid = (profile.expenses || []).filter(e => !e.paid);
  const unpaidTotal = unpaid.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const unpaidBills = (profile.bills || []).filter(b => b?.paid !== true);
  const paidBills = (profile.bills || []).filter(b => b?.paid === true);
  const unpaidBillsTotal = unpaidBills.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const shopping = profile.shoppingLog || [];
  const shoppingTotal = shopping.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const unexpected = profile.unexpected || [];
  const unexpectedTotal = unexpected.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const goals = (profile.goals || []).filter(g => g.active !== false);
  const daysLeft = daysUntil(profile.nextPayoutDate);
  const daily = plan.daily ?? (daysLeft > 0 ? Math.floor(Math.max(0, balance - unpaidTotal) / daysLeft) : null);

  switch (type) {
    case 'saldo': {
      const parts = [`Saldoen din er kr ${formatKr(balance)}.`];
      if (income) parts.push(`Månedlig inntekt er satt til kr ${formatKr(income)}.`);
      if (daysLeft != null) {
        if (daysLeft > 0) {
          parts.push(`Det er ${daysLeft} dager til neste utbetaling.`);
        } else {
          parts.push('Utbetalingsdatoen er i dag eller har passert — oppdater neste utbetaling.');
        }
      }
      if (daily != null) {
        parts.push(`Anbefalt daglig forbruk: ca. kr ${formatKr(daily)}.`);
      }
      if (balance < 1000) {
        parts.push('Saldoen er lav — prioriter nødvendige utgifter og hold igjen på fritid.');
      } else if (unpaidTotal > balance) {
        parts.push(`Ubetalte faste utgifter (kr ${formatKr(unpaidTotal)}) overstiger saldoen. Vurder å utsette noe.`);
      } else if (plan.månedligSparing > 0) {
        parts.push(`Du har rom til å sette av kr ${formatKr(plan.månedligSparing)} til sparing denne perioden.`);
      } else {
        parts.push('Du har god oversikt — husk å sette av litt til sparing når du kan.');
      }
      if (goals.length > 0) {
        parts.push(`Du har ${goals.length} aktive sparemål.`);
      }
      return parts.join(' ');
    }

    case 'regninger': {
      if (unpaidBills.length === 0 && unpaid.length === 0) {
        if (paidBills.length > 0) {
          return `Alle registrerte regninger er markert som betalt (${paidBills.length} stk). Ingen ubetalte faste utgifter.`;
        }
        return 'Du har ingen registrerte ubetalte regninger eller faste utgifter. Legg dem inn på dashboardet for mer treffsikre råd.';
      }
      const parts = [];
      if (unpaid.length > 0) {
        parts.push(
          `Du har ${unpaid.length} ubetalte faste utgifter til sammen kr ${formatKr(unpaidTotal)}.`
        );
        const top = unpaid
          .slice()
          .sort((a, b) => (b.amount || 0) - (a.amount || 0))
          .slice(0, 3)
          .map(e => `${e.name} (kr ${formatKr(e.amount)})`)
          .join(', ');
        parts.push(`Største: ${top}.`);
      }
      if (unpaidBills.length > 0) {
        const upcoming = unpaidBills
          .map(b => ({ ...b, days: daysUntil(b.due) }))
          .filter(b => b.days != null)
          .sort((a, b) => a.days - b.days);
        parts.push(
          `Du har ${unpaidBills.length} ubetalte regninger på totalt kr ${formatKr(unpaidBillsTotal)}.`
        );
        if (upcoming.length > 0) {
          const nextBill = upcoming[0];
          if (nextBill.days < 0) {
            parts.push(`${nextBill.name} forfalt for ${Math.abs(nextBill.days)} dager siden — betal snart for å unngå gebyr.`);
          } else if (nextBill.days === 0) {
            parts.push(`${nextBill.name} forfaller i dag (kr ${formatKr(nextBill.amount)}).`);
          } else if (nextBill.days <= 7) {
            parts.push(`Neste forfall: ${nextBill.name} om ${nextBill.days} dager (kr ${formatKr(nextBill.amount)}).`);
          } else {
            parts.push(`Neste forfall: ${nextBill.name} om ${nextBill.days} dager.`);
          }
        }
      }
      if (paidBills.length > 0) {
        parts.push(`${paidBills.length} regning${paidBills.length === 1 ? '' : 'er'} er allerede markert som betalt.`);
      }
      if (unpaidBillsTotal + unpaidTotal > balance) {
        parts.push('Samlet ubetalt beløp er høyere enn saldoen — prioriter det som forfaller først.');
      } else {
        parts.push('Betal i tide og merk regninger som betalt når de er gjort.');
      }
      return parts.join(' ');
    }

    case 'handleturer': {
      const matBudget = plan.distribution?.Mat;
      if (shopping.length === 0) {
        const hint = matBudget != null
          ? ` Matbudsjettet i planen er kr ${formatKr(matBudget)}.`
          : '';
        return `Ingen handleturer er loggført ennå.${hint} Lag handleliste før du går i butikken — det reduserer impulskjøp.`;
      }
      const avg = Math.round(shoppingTotal / shopping.length);
      const parts = [
        `Du har logget ${shopping.length} handleturer på totalt kr ${formatKr(shoppingTotal)} (snitt kr ${formatKr(avg)}).`,
      ];
      if (matBudget != null) {
        const usedPct = matBudget > 0 ? Math.round((shoppingTotal / matBudget) * 100) : 0;
        parts.push(`Det er ${usedPct}% av matbudsjettet på kr ${formatKr(matBudget)}.`);
        if (usedPct >= 90) {
          parts.push('Du er nær eller over matbudsjettet — planlegg enkle måltider resten av perioden.');
        } else if (usedPct >= 70) {
          parts.push('Du nærmer deg matbudsjettet. Hold deg til listen neste gang.');
        } else {
          parts.push('Du er innenfor matbudsjettet så langt.');
        }
      } else if (daily != null && avg > daily) {
        parts.push(`Snitthandelen er høyere enn daglig budsjett (kr ${formatKr(daily)}). Vurder færre, mer planlagte turer.`);
      } else {
        parts.push('Lag handleliste før du går — det holder forbruket mer forutsigbart.');
      }
      return parts.join(' ');
    }

    case 'uforutsett': {
      const bufferTarget = Math.max(1000, Math.round(balance * 0.1));
      if (unexpected.length === 0) {
        return `Du har ingen uforutsette utgifter registrert. Prøv å ha en buffer på minst kr ${formatKr(bufferTarget)} (ca. 10% av saldo, minimum 1000 kr).`;
      }
      const parts = [
        `Du har ${unexpected.length} uforutsette utgifter på totalt kr ${formatKr(unexpectedTotal)}.`,
      ];
      const latest = unexpected[unexpected.length - 1];
      if (latest?.note) {
        parts.push(`Siste: «${latest.note}» på kr ${formatKr(latest.amount)}.`);
      }
      if (unexpectedTotal > bufferTarget) {
        parts.push(`Det overstiger en fornuftig buffer (kr ${formatKr(bufferTarget)}). Stram inn andre poster midlertidig.`);
      } else if (balance - unexpectedTotal < 1000) {
        parts.push('Saldoen er stram etter uforutsette utgifter — unngå nye ikke-nødvendige kjøp.');
      } else {
        parts.push(`Mål å bygge bufferen opp til minst kr ${formatKr(bufferTarget)} igjen.`);
      }
      return parts.join(' ');
    }

    default:
      return '';
  }
}

function AdviceOverlay({ onClose, profile = {} }) {
  const [advice, setAdvice] = useState('');
  const avatarSrc = `${process.env.PUBLIC_URL || ''}/mairim-overlay.png`;

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <img src={avatarSrc} alt="Mairim" className={styles.avatar} />
        <h2>Hei! Hva trenger du hjelp med?</h2>
        <div className={styles.options}>
          <button type="button" onClick={() => setAdvice(getAdvice('saldo', profile))}>
            <Wallet size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden="true" />
            Saldo
          </button>
          <button type="button" onClick={() => setAdvice(getAdvice('regninger', profile))}>
            <FileText size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden="true" />
            Regninger
          </button>
          <button type="button" onClick={() => setAdvice(getAdvice('handleturer', profile))}>
            <ShoppingCart size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden="true" />
            Handleturer
          </button>
          <button type="button" onClick={() => setAdvice(getAdvice('uforutsett', profile))}>
            <TriangleAlert size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden="true" />
            Uforutsette utgifter
          </button>
        </div>
        {advice && <p className={styles.advice}>{advice}</p>}
        <button type="button" onClick={onClose} className={styles.close}>Lukk</button>
      </div>
    </div>
  );
}

export default AdviceOverlay;
