'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChildService } from '../../services/ChildService';
import { AccountService, AccountSummary } from '../../services/AccountService';
import { useApp } from '../../state/AppContext';
import AddAccountForm from '../forms/AddAccountForm';
import AccountCard from './AccountCard';

interface ChildDashboardProps {
  childName: string;
}

export default function ChildDashboard({ childName }: ChildDashboardProps) {
  const router = useRouter();
  const { refreshTrigger, triggerRefresh, runBalanceCalculation } = useApp();
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [savingsTotal, setSavingsTotal] = useState(0);
  const [goalsTotal, setGoalsTotal] = useState(0);
  const [avatar, setAvatar] = useState<string>('👶');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddAccount, setShowAddAccount] = useState(false);

  useEffect(() => {
    loadChildData();
  }, [childName, refreshTrigger]);

  async function loadChildData() {
    setIsLoading(true);
    setError(null);

    try {
      const childExists = await ChildService.childExists(childName);
      if (!childExists) {
        setError('Child not found');
        return;
      }

      const child = await ChildService.getChild(childName);
      if (child?.avatar) setAvatar(child.avatar);

      const accountsList = await ChildService.getAccounts(childName);
      const summaries: AccountSummary[] = [];

      for (const account of accountsList) {
        const summary = await AccountService.getAccountSummary(childName, account.name);
        summaries.push(summary);
      }

      setAccounts(summaries);

      // Calculate totals
      const balance = await ChildService.getChildBalance(childName);
      setTotalBalance(balance);

      // Calculate savings and goals totals
      let savings = 0;
      let goals = 0;
      summaries.forEach(account => {
        if (account.type === 'Goal') {
          goals += account.balance;
        } else {
          savings += account.balance;
        }
      });
      setSavingsTotal(savings);
      setGoalsTotal(goals);
    } catch (err) {
      console.error('Error loading child data:', err);
      setError('Failed to load child data');
    } finally {
      setIsLoading(false);
    }
  }

  function formatCurrency(amount: number): string {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  async function handleAddAccountSuccess() {
    setShowAddAccount(false);
    await runBalanceCalculation();
    triggerRefresh();
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => router.push('/')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="child-dashboard-container">
      <h1 className="child-dashboard-title">Child Dashboard</h1>
      
      <div className="child-name-header">
        <button className="btn-back" onClick={() => router.push('/')}>
          ← 
        </button>
        <h2>{childName}'s Accounts</h2>
      </div>

      <div className="total-available-card">
        <div className="total-available-label">Total Available</div>
        <div className="total-available-amount">{formatCurrency(totalBalance)}</div>
        <div className="total-breakdown">
          <div className="breakdown-item">
            <div className="breakdown-label">Savings:</div>
            <div className="breakdown-value">{formatCurrency(savingsTotal)}</div>
          </div>
          <div className="breakdown-item">
            <div className="breakdown-label">Goals:</div>
            <div className="breakdown-value">{formatCurrency(goalsTotal)}</div>
          </div>
        </div>
      </div>

      {accounts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏦</div>
          <h2>No Accounts Yet</h2>
          <p>Create your first account to start saving!</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddAccount(true)}
          >
            Create First Account
          </button>
        </div>
      ) : (
        <>
          <h3 className="account-list-title">Account List</h3>

          <div className="accounts-grid">
            {accounts.map((account) => (
              <AccountCard
                key={account.name}
                childName={childName}
                account={{
                  name: account.name,
                  type: account.type,
                  balance: account.balance,
                  createdAt: (account as any).createdAt,
                  goal: account.goal ? {
                    name: account.goal.name,
                    cost: account.goal.cost,
                    achieved: account.goal.achieved,
                    progress: account.goal.progress,
                  } : undefined,
                }}
              />
            ))}
          </div>

          <button 
            className="create-account-btn"
            onClick={() => setShowAddAccount(true)}
          >
            <span>➕</span>
            Create New Account
          </button>
        </>
      )}

      {showAddAccount && (
        <div className="modal-overlay" onClick={() => setShowAddAccount(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Account</h2>
              <button 
                className="modal-close"
                onClick={() => setShowAddAccount(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <AddAccountForm 
              childName={childName}
              onSuccess={handleAddAccountSuccess}
              onCancel={() => setShowAddAccount(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

