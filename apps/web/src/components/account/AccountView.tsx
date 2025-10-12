'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AccountService, AccountSummary } from '../../services/AccountService';
import { LedgerService } from '../../services/LedgerService';
import { LedgerEntry } from '../../domain/types';
import { useApp } from '../../state/AppContext';
import { toastStore } from '../../state/toastStore';
import TxnForm from '../forms/TxnForm';
import TransferForm from '../forms/TransferForm';
import SavingsLine from '../charts/SavingsLine';
import GoalProgress from '../charts/GoalProgress';

interface AccountViewProps {
  childName: string;
  accountName: string;
}

export default function AccountView({ childName, accountName }: AccountViewProps) {
  const router = useRouter();
  const { refreshTrigger, triggerRefresh, runBalanceCalculation } = useApp();
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);

  useEffect(() => {
    loadAccountData();
  }, [childName, accountName, refreshTrigger]);

  async function loadAccountData() {
    setIsLoading(true);
    setError(null);

    try {
      const exists = await AccountService.accountExists(childName, accountName);
      if (!exists) {
        setError('Account not found');
        return;
      }

      const summary = await AccountService.getAccountSummary(childName, accountName);
      setAccount(summary);

      const ledgerEntries = await LedgerService.getLedgerReversed(childName, accountName);
      setLedger(ledgerEntries);
    } catch (err) {
      console.error('Error loading account:', err);
      setError('Failed to load account');
    } finally {
      setIsLoading(false);
    }
  }

  function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  async function handleTransactionSuccess(cappedMessage?: string) {
    setShowDeposit(false);
    setShowWithdraw(false);
    setShowTransfer(false);
    
    if (cappedMessage) {
      toastStore.warning(cappedMessage);
    }
    
    await runBalanceCalculation();
    triggerRefresh();
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading account...</p>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error || 'Account not found'}</p>
        <button 
          className="btn btn-primary" 
          onClick={() => router.push(`/child/${encodeURIComponent(childName)}`)}
        >
          Back to {childName}'s Accounts
        </button>
      </div>
    );
  }

  function formatCurrency(amount: number): string {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return (
    <div className="account-view-container">
      <div className="account-details-header">
        <button 
          className="btn-back" 
          onClick={() => router.push(`/child/${encodeURIComponent(childName)}`)}
        >
          ← 
        </button>
        <div className="account-header-content">
          <h1 className="account-title-blue">{account.goal ? account.goal.name + ' Goal' : account.name}</h1>
          <div className="account-balance-display-large">
            {formatCurrency(account.balance)}
          </div>
        </div>
      </div>

      {account.goal && (
        <div className="goal-details-card">
          <div className="goal-amounts-row">
            <div className="goal-amount-item">
              <div className="goal-amount-label">Goal Amount:</div>
              <div className="goal-amount-value">{formatCurrency(account.goal.cost)}</div>
            </div>
            <div className="goal-amount-item">
              <div className="goal-amount-label">Saved:</div>
              <div className="goal-amount-value">{formatCurrency(account.balance)}</div>
            </div>
          </div>
          <div className="progress-bar-modern" style={{ marginTop: '16px' }}>
            <div 
              className="progress-fill-modern" 
              style={{ width: `${Math.min(account.goal.progress * 100, 100)}%` }}
            />
          </div>
          <div className="goal-left-message">
            Only {formatCurrency(account.goal.cost - account.balance)} left to save!
          </div>
          {account.goal.achieved && (
            <div className="goal-achieved-banner">
              <span className="achievement-icon">🎉</span>
              <span>Goal Achieved!</span>
            </div>
          )}
        </div>
      )}

      <div className="savings-chart-card">
        <h2 className="section-title-modern">Savings Progression</h2>
        {ledger.length > 0 ? (
          <SavingsLine ledger={ledger} monthsToShow={3} />
        ) : (
          <div className="chart-placeholder">
            (Placeholder: Simple line graph showing balance over time)
          </div>
        )}
        <div style={{ textAlign: 'center', color: '#757575', fontSize: '0.875rem', marginTop: '8px' }}>
          Last 30 days of activity
        </div>
      </div>

      {!account.isReadOnly && (
        <div className="account-action-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => setShowDeposit(true)}
          >
            📈 Deposit
          </button>
          <button 
            className="btn btn-danger"
            onClick={() => setShowWithdraw(true)}
          >
            📉 Withdraw
          </button>
        </div>
      )}

      <div className="recent-activity-section">
        <h2 className="section-title-modern">Recent Activity</h2>
        {ledger.length === 0 ? (
          <div className="empty-ledger">
            <p>No transactions yet</p>
          </div>
        ) : (
          <>
            {ledger.slice(0, 5).map((entry, index) => (
              <div key={index} className="activity-item">
                <div className="activity-left">
                  <div className="activity-description">
                    {entry.type}: {entry.description}
                  </div>
                  <div className="activity-date">{formatDate(entry.timestamp)}</div>
                </div>
                <div className={`activity-amount ${entry.value >= 0 ? 'positive' : 'negative'}`}>
                  {entry.value >= 0 ? '+' : '-'}{formatCurrency(Math.abs(entry.value))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {showDeposit && (
        <div className="modal-overlay" onClick={() => setShowDeposit(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Deposit</h2>
              <button 
                className="modal-close"
                onClick={() => setShowDeposit(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <TxnForm 
              childName={childName}
              accountName={accountName}
              type="Deposit"
              onSuccess={handleTransactionSuccess}
              onCancel={() => setShowDeposit(false)}
            />
          </div>
        </div>
      )}

      {showWithdraw && (
        <div className="modal-overlay" onClick={() => setShowWithdraw(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Withdraw</h2>
              <button 
                className="modal-close"
                onClick={() => setShowWithdraw(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <TxnForm 
              childName={childName}
              accountName={accountName}
              type="Withdraw"
              onSuccess={handleTransactionSuccess}
              onCancel={() => setShowWithdraw(false)}
            />
          </div>
        </div>
      )}

      {showTransfer && (
        <div className="modal-overlay" onClick={() => setShowTransfer(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Transfer</h2>
              <button 
                className="modal-close"
                onClick={() => setShowTransfer(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <TransferForm 
              childName={childName}
              currentAccountName={accountName}
              onSuccess={handleTransactionSuccess}
              onCancel={() => setShowTransfer(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

