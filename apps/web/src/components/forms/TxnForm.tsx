'use client';

import { useState } from 'react';
import { LedgerService } from '../../services/LedgerService';
import { TransactionType } from '../../domain/types';

interface TxnFormProps {
  childName: string;
  accountName: string;
  type: TransactionType;
  onSuccess: (cappedMessage?: string) => void;
  onCancel: () => void;
}

export default function TxnForm({ childName, accountName, type, onSuccess, onCancel }: TxnFormProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validation
    const amountNum = parseInt(amount);
    if (!amount || amountNum <= 0) {
      setError('Please enter a valid amount greater than zero');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    setIsSubmitting(true);

    try {
      if (type === 'Deposit') {
        await LedgerService.deposit(childName, accountName, amountNum, description.trim());
        onSuccess();
      } else {
        const result = await LedgerService.withdraw(childName, accountName, amountNum, description.trim());
        onSuccess(result.cappedMessage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${type.toLowerCase()}`);
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
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
          disabled={isSubmitting}
          autoFocus
          className="form-input"
        />
        <p className="form-hint">
          {type === 'Withdraw' 
            ? 'Amount will be capped to available balance if necessary'
            : 'Enter whole dollar amount'}
        </p>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <input
          id="description"
          type="text"
          role="textbox"
          aria-label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={type === 'Deposit' ? 'e.g., Birthday money' : 'e.g., Toy purchase'}
          maxLength={100}
          disabled={isSubmitting}
          className="form-input"
        />
        <p className="form-hint">
          {description.length}/100 characters
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
          className={`btn ${type === 'Deposit' ? 'btn-primary' : 'btn-secondary'}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? `${type}ing...` : type}
        </button>
      </div>
    </form>
  );
}

