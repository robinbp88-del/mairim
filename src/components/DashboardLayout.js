import React from 'react';
import layout from './Dashboard.module.css';
import HouseholdProfile from './HouseholdProfile';
import BudgetPlanner from './BudgetPlanner';
import ExpenseList from './ExpenseList';
import ReceiptScanner from './ReceiptScanner';
import GoalSetter from './GoalSetter';
import GoalHistory from './GoalHistory';
import SavingsGoals from './SavingsGoals';
import BudgetChart from './BudgetChart';
import CollapsibleSection from './CollapsibleSection';

function DashboardLayout({
  profile,
  setProfile,
  initialBalance,
  setInitialBalance,
  expenses,
  setExpenses,
  goals,
  setGoals,
  dailyBudget
}) {
  return (
    <div className={layout.dashboard}>
      <header className={layout.stickyHeader}>
        <img src="/backend/ai-avatar.png" alt="Mairim" className={layout.avatar} />
        <div className={layout.advice}>
          <h2>🧠 Råd fra Mairim</h2>
          <p>⚠️ Lav disponibel saldo – vurder å kutte i fritidsutgifter.</p>
          <input
            type="number"
            placeholder="F.eks. 10000"
            value={initialBalance}
            onChange={e => setInitialBalance(e.target.value)}
            className={layout.balanceInput}
          />
        </div>
      </header>

      <main className={layout.sections}>
        <CollapsibleSection title="🏠 Husholdningsprofil" defaultOpen={true}>
          <HouseholdProfile
            profile={profile}
            setProfile={setProfile}
            setBalance={setInitialBalance}
            expenses={expenses}
          />
          {dailyBudget !== null && (
            <p style={{ marginTop: '12px' }}>
              Anbefalt daglig forbruk: kr {dailyBudget}
            </p>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="📐 Budsjettplanlegger" defaultOpen={false}>
          <BudgetPlanner
            balance={initialBalance}
            goals={goals}
            profile={profile}
            expenses={expenses}
          />
        </CollapsibleSection>

        <CollapsibleSection title="📋 Utgifter" defaultOpen={true}>
          <ExpenseList expenses={expenses} setExpenses={setExpenses} />
          <div className={layout.expenseActions}>
            <button className={layout.addButton}>➕ Legg til</button>
            <button className={layout.scanButton}>📸 Skann kvittering</button>
          </div>
          <ReceiptScanner setExpenses={setExpenses} />
        </CollapsibleSection>

        <CollapsibleSection title="🎯 Mål for måneden" defaultOpen={false}>
          <GoalSetter goals={goals} setGoals={setGoals} />
        </CollapsibleSection>

        <CollapsibleSection title="📅 Tidligere mål" defaultOpen={false}>
          <GoalHistory goals={goals} />
        </CollapsibleSection>

        <CollapsibleSection title="💸 Sparemål" defaultOpen={false}>
          <SavingsGoals goals={goals} setGoals={setGoals} />
        </CollapsibleSection>

        <CollapsibleSection title="📊 Budsjettdiagram" defaultOpen={false}>
          <BudgetChart expenses={expenses} />
        </CollapsibleSection>
      </main>
    </div>
  );
}

export default DashboardLayout;
