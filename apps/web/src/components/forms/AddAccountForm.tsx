'use client';

import { useState } from 'react';
import { AccountService, CreateAccountData } from '../../services/AccountService';
import { AccountType, Frequency, InterestType } from '../../domain/types';

interface AddAccountFormProps {
  childName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddAccountForm({ childName, onSuccess, onCancel }: AddAccountFormProps) {
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('Savings');
  
  // Allowance config
  const [allowanceEnabled, setAllowanceEnabled] = useState(false);
  const [allowanceAmount, setAllowanceAmount] = useState('');
  const [allowanceFrequency, setAllowanceFrequency] = useState<Frequency>('weekly');
  
  // Interest config
  const [interestEnabled, setInterestEnabled] = useState(false);
  const [interestType, setInterestType] = useState<InterestType>('Percentage');
  const [interestValue, setInterestValue] = useState('');
  const [interestFrequency, setInterestFrequency] = useState<Frequency>('monthly');
  
  // Goal config (for Goal accounts)
  const [goalName, setGoalName] = useState('');
  const [goalCost, setGoalCost] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validation
    if (!accountName.trim()) {
      setError('Please enter an account name');
      return;
    }

    if (accountType === 'Goal') {
      if (!goalName.trim()) {
        setError('Please enter a goal name');
        return;
      }
      if (!goalCost || parseInt(goalCost) <= 0) {
        setError('Please enter a valid goal cost');
        return;
      }
    }

    if (allowanceEnabled) {
      if (!allowanceAmount || parseInt(allowanceAmount) <= 0) {
        setError('Please enter a valid allowance amount');
        return;
      }
    }

    if (interestEnabled) {
      if (!interestValue || parseFloat(interestValue) <= 0) {
        setError('Please enter a valid interest value');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const accountData: CreateAccountData = {
        name: accountName.trim(),
        type: accountType,
        allowance: allowanceEnabled ? {
          enabled: true,
          amount: parseInt(allowanceAmount),
          frequency: allowanceFrequency,
        } : { enabled: false },
        interest: interestEnabled ? {
          enabled: true,
          type: interestType,
          value: parseFloat(interestValue),
          frequency: interestFrequency,
        } : { enabled: false },
      };

      if (accountType === 'Goal') {
        accountData.goal = {
          name: goalName.trim(),
          cost: parseInt(goalCost),
        };
      }

      await AccountService.createAccount(childName, accountData);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="account-form">
      <div className="form-group">
        <label htmlFor="accountName">Account Name *</label>
        <input
          id="accountName"
          type="text"
          role="textbox"
          aria-label="Account Name"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          placeholder="e.g., Savings, Birthday Fund"
          disabled={isSubmitting}
          autoFocus
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="accountType">Account Type *</label>
        <select
          id="accountType"
          role="combobox"
          aria-label="Account Type"
          value={accountType}
          onChange={(e) => setAccountType(e.target.value as AccountType)}
          disabled={isSubmitting}
          className="form-input"
        >
          <option value="Savings">Savings</option>
          <option value="Goal">Goal</option>
        </select>
        <p className="form-hint">
          {accountType === 'Savings' 
            ? 'A general savings account for flexible saving'
            : 'A goal account for saving towards a specific target'}
        </p>
      </div>

      {accountType === 'Goal' && (
        <>
          <div className="form-group">
            <label htmlFor="goalName">Goal Name *</label>
            <input
              id="goalName"
              type="text"
              role="textbox"
              aria-label="Goal Name"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              placeholder="e.g., New Bike, Video Game"
              disabled={isSubmitting}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="goalCost">Target Amount ($) *</label>
            <input
              id="goalCost"
              type="number"
              role="spinbutton"
              aria-label="Goal Cost"
              value={goalCost}
              onChange={(e) => setGoalCost(e.target.value)}
              placeholder="0"
              min="1"
              disabled={isSubmitting}
              className="form-input"
            />
          </div>
        </>
      )}

      <div className="form-section">
        <div className="form-group-checkbox">
          <input
            id="allowanceEnabled"
            type="checkbox"
            role="checkbox"
            aria-label="Enable Allowance"
            checked={allowanceEnabled}
            onChange={(e) => setAllowanceEnabled(e.target.checked)}
            disabled={isSubmitting}
          />
          <label htmlFor="allowanceEnabled">Enable Allowance</label>
        </div>

        {allowanceEnabled && (
          <>
            <div className="form-group">
              <label htmlFor="allowanceAmount">Allowance Amount ($)</label>
              <input
                id="allowanceAmount"
                type="number"
                role="spinbutton"
                aria-label="Allowance Amount"
                value={allowanceAmount}
                onChange={(e) => setAllowanceAmount(e.target.value)}
                placeholder="0"
                min="1"
                disabled={isSubmitting}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="allowanceFrequency">Frequency</label>
              <select
                id="allowanceFrequency"
                role="combobox"
                aria-label="Allowance Frequency"
                value={allowanceFrequency}
                onChange={(e) => setAllowanceFrequency(e.target.value as Frequency)}
                disabled={isSubmitting}
                className="form-input"
              >
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </>
        )}
      </div>

      <div className="form-section">
        <div className="form-group-checkbox">
          <input
            id="interestEnabled"
            type="checkbox"
            role="checkbox"
            aria-label="Enable Interest"
            checked={interestEnabled}
            onChange={(e) => setInterestEnabled(e.target.checked)}
            disabled={isSubmitting}
          />
          <label htmlFor="interestEnabled">Enable Interest</label>
        </div>

        {interestEnabled && (
          <>
            <div className="form-group">
              <label htmlFor="interestType">Interest Type</label>
              <select
                id="interestType"
                role="combobox"
                aria-label="Interest Type"
                value={interestType}
                onChange={(e) => setInterestType(e.target.value as InterestType)}
                disabled={isSubmitting}
                className="form-input"
              >
                <option value="Percentage">Percentage (%)</option>
                <option value="Absolute">Fixed Amount ($)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="interestValue">
                {interestType === 'Percentage' ? 'Interest Rate (%)' : 'Interest Amount ($)'}
              </label>
              <input
                id="interestValue"
                type="number"
                role="spinbutton"
                aria-label="Interest Value"
                value={interestValue}
                onChange={(e) => setInterestValue(e.target.value)}
                placeholder="0"
                min="0.01"
                step={interestType === 'Percentage' ? '0.1' : '1'}
                disabled={isSubmitting}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="interestFrequency">Frequency</label>
              <select
                id="interestFrequency"
                role="combobox"
                aria-label="Interest Frequency"
                value={interestFrequency}
                onChange={(e) => setInterestFrequency(e.target.value as Frequency)}
                disabled={isSubmitting}
                className="form-input"
              >
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </>
        )}
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
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Account'}
        </button>
      </div>
    </form>
  );
}

