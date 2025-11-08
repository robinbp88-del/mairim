import React, { useState, useEffect } from 'react';
import layout from './Dashboard.module.css';
import BudgetManager from './components/BudgetManager';
import ExpenseList from './components/ExpenseList';
import ReceiptScanner from './components/ReceiptScanner';
import GoalSetter from './components/GoalSetter';
import GoalHistory from './components/GoalHistory';
import SavingsGoals from './components/SavingsGoals';
import Wishlist from './components/Wishlist';
import BudgetChart from './components/BudgetChart';
import BudgetPieChart from './components/BudgetPieChart';
import AIAdvisor from './components/AIAdvisor';
import CollapsibleSection from './components/CollapsibleSection';
import HouseholdProfile from './components/HouseholdProfile';
import BudgetPlanner from './components/BudgetPlanner';

function App() {
  const [initialBalance, setInitialBalance] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [profile, setProfile] = useState({});
  const [dailyBudget, setDailyBudget] = useState(null);

  const unpaidExpenses = Array.isArray(expenses)
    ? expenses.filter(e => !e.paid)
    : [];

  const totalUnpaid = unpaidExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const actualBalance = Math.max(0, parseFloat(initialBalance || 0) - totalUnpaid);

  useEffect(() => {
    if (profile.income && !initialBalance) {
      setInitialBalance(profile.income);
    }
  }, [profile.income, initialBalance]);

  useEffect(() => {
    if (!actualBalance || !profile?.nextPayoutDate) return;

    const today = new Date();
    const payoutDate = new Date(profile.nextPayoutDate);
    const daysLeft = Math.max(1, Math.ceil((payoutDate - today) / (1000 * 60 * 60 * 24)));

    const totalSavingsGoal = Array.isArray(goals)
      ? goals.reduce((sum, g) => sum + ((g.target || 0) - (g.saved || 0)), 0)
      : 0;

    const availableAfterSavings = Math.max(0, actualBalance - totalSavingsGoal);
    const realisticDaily = Math.floor(availableAfterSavings / daysLeft);

    setDailyBudget(realisticDaily);
  }, [actualBalance, profile?.nextPayoutDate, goals]);

  return (
    <div className={layout.wrapper}>
      <div className={layout.adviceTop}>
        <img
          src="/ai-avatar.png"
          alt="Mairim – KI-assistent"
          className={layout.avatarImage}
        />
        <AIAdvisor
          tips={[]}
          goals={goals}
          balance={actualBalance}
          expenses={expenses}
          profile={profile || {}}
        />
      </div>

      <div className={layout.section}>
        <CollapsibleSection title="🏠 Husholdningsprofil" defaultOpen={true}>
          <HouseholdProfile
            profile={profile}
            setProfile={setProfile}
            setBalance={setInitialBalance}
          />
          {dailyBudget !== null && (
            <p style={{ marginTop: '12px' }}>
              Anbefalt daglig forbruk: kr {dailyBudget}
            </p>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="📐 Budsjettplanlegger" defaultOpen={false}>
          <BudgetPlanner
            balance={actualBalance}
            goals={goals}
            profile={profile}
          />
        </CollapsibleSection>

        <CollapsibleSection title="📋 Utgifter" defaultOpen={true}>
          <ExpenseList expenses={expenses} setExpenses={setExpenses} />
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

        <CollapsibleSection title="📝 Ønskeliste" defaultOpen={false}>
          <Wishlist wishlist={wishlist} setWishlist={setWishlist} />
        </CollapsibleSection>

        <CollapsibleSection title="📊 Budsjettdiagram" defaultOpen={false}>
          <BudgetChart expenses={expenses} />
        </CollapsibleSection>

        <CollapsibleSection title="🥧 Budsjettfordeling" defaultOpen={false}>
          <BudgetPieChart expenses={expenses} />
        </CollapsibleSection>
      </div>
    </div>
  );
}

export default App;
