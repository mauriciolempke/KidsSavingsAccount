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

  function formatCurrency(amount: number): string {
    return `$${amount.toLocaleString()}`;
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

  return (
    <div className="account-view-container">
      <div className="account-header">
        <button 
          className="btn-back" 
          onClick={() => router.push(`/child/${encodeURIComponent(childName)}`)}
        >
          ← Back to {childName}'s Accounts
        </button>

        <div className="account-info">
          <div className="account-title">
            <h1>{account.name}</h1>
            <span className="account-type-badge">{account.type}</span>
            {account.isReadOnly && <span className="readonly-badge">🔒 Read-Only</span>}
          </div>
          <div className="account-balance-display">
            <span className="balance-label">Current Balance</span>
            <span className="balance-amount">{formatCurrency(account.balance)}</span>
          </div>
        </div>
      </div>

      {account.goal && (
        <div className="goal-section">
          <h2>Goal Progress</h2>
          <GoalProgress 
            currentAmount={account.balance}
            targetAmount={account.goal.cost}
            goalName={account.goal.name}
            achieved={account.goal.achieved}
            showDetails={true}
          />
          {account.goal.achieved && (
            <div className="goal-achieved-banner">
              <span className="achievement-icon">🎉</span>
              <span>Goal Achieved!</span>
            </div>
          )}
        </div>
      )}

      {account.type === 'Savings' && ledger.length > 0 && (
        <div className="goal-section">
          <h2>Savings History</h2>
          <SavingsLine ledger={ledger} monthsToShow={3} />
        </div>
      )}

      {!account.isReadOnly && (
        <div className="account-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowDeposit(true)}
          >
            Deposit
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowWithdraw(true)}
          >
            Withdraw
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowTransfer(true)}
          >
            Transfer
          </button>
        </div>
      )}

      <div className="ledger-section">
        <h2>Transaction History</h2>
        {ledger.length === 0 ? (
          <div className="empty-ledger">
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="ledger-table-container">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th className="amount-column">Amount</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((entry, index) => (
                  <tr key={index}>
                    <td>{formatDate(entry.timestamp)}</td>
                    <td>{entry.description}</td>
                    <td>
                      <span className={`transaction-type ${entry.type.toLowerCase()}`}>
                        {entry.type}
                      </span>
                    </td>
                    <td className={`amount-column ${entry.value >= 0 ? 'positive' : 'negative'}`}>
                      {entry.value >= 0 ? '+' : ''}{formatCurrency(Math.abs(entry.value))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

