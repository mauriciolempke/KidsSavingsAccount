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
  const [clockSkewDetected, setClockSkewDetected] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

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

      // Check for clock skew: if CBTS (Current Balance Timestamp) is in the future,
      // the device clock is running behind
      if (child?.cbts && child.cbts > Date.now()) {
        setClockSkewDetected(true);
      } else {
        setClockSkewDetected(false);
      }

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

  function handleDeleteClick(accountName: string) {
    setAccountToDelete(accountName);
    setShowDeleteConfirm(true);
  }

  async function handleConfirmDelete() {
    if (!accountToDelete) return;

    try {
      await AccountService.deleteAccount(childName, accountToDelete);
      setShowDeleteConfirm(false);
      setAccountToDelete(null);
      await runBalanceCalculation();
      triggerRefresh();
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('Failed to delete account');
      setShowDeleteConfirm(false);
    }
  }

  function handleCancelDelete() {
    setShowDeleteConfirm(false);
    setAccountToDelete(null);
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

      {clockSkewDetected && (
        <div className="warning-banner" role="alert" style={{ 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffc107',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
          color: '#856404'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>⚠️</span>
            <div>
              <strong>Clock Skew Detected</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
                Your device clock appears to be earlier than the last balance update. 
                Please adjust your device clock to the correct time to ensure accurate balance calculations.
              </p>
            </div>
          </div>
        </div>
      )}

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
                onDelete={showDeleteConfirm ? undefined : handleDeleteClick}
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

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Are you sure you want to permanently delete the <b>{accountToDelete}</b> account?</h2>
              <button 
                className="modal-close"
                onClick={handleCancelDelete}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
             
              <p className="warning-text">
                This will permanently delete:
              </p>
              <ul style={{ marginLeft: '40px' }}>
                <li>All transactions</li>
                <li>Any progress on goals</li>
                <li>All account information</li>
              </ul>
            </div>
            <div style={{ padding: '20px' }}>
              <p style={{ color: '#dc3545', fontWeight: 'bold', marginTop: '10px' }}>
                This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                <button 
                  className="btn btn-secondary"
                  onClick={handleCancelDelete}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={handleConfirmDelete}
                  style={{ backgroundColor: '#dc3545', color: 'white' }}
                  aria-label="Yes, Delete"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

