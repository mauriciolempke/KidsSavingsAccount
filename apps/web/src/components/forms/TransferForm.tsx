'use client';

import { useState, useEffect } from 'react';
import { TransferService } from '../../services/TransferService';
import { AccountService } from '../../services/AccountService';

interface TransferFormProps {
  childName: string;
  currentAccountName?: string; // Pre-select "from" account
  onSuccess: (cappedMessage?: string) => void;
  onCancel: () => void;
}

export default function TransferForm({ childName, currentAccountName, onSuccess, onCancel }: TransferFormProps) {
  const [accounts, setAccounts] = useState<string[]>([]);
  const [fromAccount, setFromAccount] = useState(currentAccountName || '');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, [childName]);

  useEffect(() => {
    if (fromAccount) {
      loadMaxAmount();
    }
  }, [fromAccount]);

  async function loadAccounts() {
    setIsLoading(true);
    try {
      const accountsList = await AccountService.getAllAccounts(childName);
      
      // Filter out achieved goals (read-only)
      const availableAccounts = accountsList
        .filter(acc => !acc.goal?.achieved)
        .map(acc => acc.name);
      
      setAccounts(availableAccounts);
      
      // If current account is provided and valid, set it as from
      if (currentAccountName && availableAccounts.includes(currentAccountName)) {
        setFromAccount(currentAccountName);
      }
    } catch (err) {
      console.error('Error loading accounts:', err);
      setError('Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  }

  async function loadMaxAmount() {
    try {
      const max = await TransferService.getMaxTransferAmount(childName, fromAccount);
      setMaxAmount(max);
    } catch (err) {
      console.error('Error loading max amount:', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validation
    if (!fromAccount) {
      setError('Please select a source account');
      return;
    }

    if (!toAccount) {
      setError('Please select a destination account');
      return;
    }

    if (fromAccount === toAccount) {
      setError('Cannot transfer to the same account');
      return;
    }

    const amountNum = parseInt(amount);
    if (!amount || amountNum <= 0) {
      setError('Please enter a valid amount greater than zero');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await TransferService.transfer(childName, fromAccount, toAccount, amountNum);
      onSuccess(result.toastMessage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to transfer');
      setIsSubmitting(false);
    }
  }

  function handleFromAccountChange(accountName: string) {
    setFromAccount(accountName);
    
    // Clear toAccount if it's the same as fromAccount
    if (toAccount === accountName) {
      setToAccount('');
    }
  }

  function handleToAccountChange(accountName: string) {
    setToAccount(accountName);
    
    // Clear fromAccount if it's the same as toAccount
    if (fromAccount === accountName) {
      setFromAccount('');
    }
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading accounts...</p>
      </div>
    );
  }

  if (accounts.length < 2) {
    return (
      <div className="empty-state">
        <p>You need at least 2 active accounts to transfer funds.</p>
        <button className="btn btn-secondary" onClick={onCancel}>
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="fromAccount">From Account *</label>
        <select
          id="fromAccount"
          role="combobox"
          aria-label="From Account"
          value={fromAccount}
          onChange={(e) => handleFromAccountChange(e.target.value)}
          disabled={isSubmitting}
          className="form-input"
        >
          <option value="">-- Select Account --</option>
          {accounts.map((acc) => (
            <option key={acc} value={acc} disabled={acc === toAccount}>
              {acc}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="toAccount">To Account *</label>
        <select
          id="toAccount"
          role="combobox"
          aria-label="To Account"
          value={toAccount}
          onChange={(e) => handleToAccountChange(e.target.value)}
          disabled={isSubmitting}
          className="form-input"
        >
          <option value="">-- Select Account --</option>
          {accounts.map((acc) => (
            <option key={acc} value={acc} disabled={acc === fromAccount}>
              {acc}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="amount">Amount ($) *</label>
        <input
          id="amount"
          type="number"
          role="spinbutton"
          aria-label="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          min="1"
          max={maxAmount || undefined}
          disabled={isSubmitting || !fromAccount}
          className="form-input"
        />
        {maxAmount !== null && fromAccount && (
          <p className="form-hint">
            Available balance: ${maxAmount.toLocaleString()}
          </p>
        )}
        <p className="form-hint">
          Amount will be capped to available balance if necessary
        </p>
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <div className="modal-actions">
        <button 
          type="button" 
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isSubmitting || !fromAccount || !toAccount}
        >
          {isSubmitting ? 'Transferring...' : 'Transfer'}
        </button>
      </div>
    </form>
  );
}

