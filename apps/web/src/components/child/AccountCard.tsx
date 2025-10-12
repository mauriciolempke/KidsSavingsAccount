'use client';

import { useEffect, useMemo, useState } from 'react';
import SavingsLine from '../charts/SavingsLine';
import GoalProgress from '../charts/GoalProgress';
import { LedgerEntry } from '../../domain/types';
import { LedgerService } from '../../services/LedgerService';
import Link from 'next/link';

interface AccountCardProps {
  childName: string;
  account: {
    name: string;
    type: string;
    balance: number;
    createdAt?: number;
    goal?: { name: string; cost: number; achieved: boolean; progress: number };
  };
  onDelete?: (accountName: string) => void;
}

export default function AccountCard({ childName, account, onDelete }: AccountCardProps) {
  const [monthsToShow, setMonthsToShow] = useState<number>(3);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);

  useEffect(() => {
    loadLedger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childName, account.name, monthsToShow]);

  async function loadLedger() {
    // We can fetch full ledger and let the chart generator filter by months
    const entries = await LedgerService.getLedger(childName, account.name);
    setLedger(entries);
  }

  const periodOptions = useMemo(() => [
    { label: '1M', value: 1 },
    { label: '3M', value: 3 },
    { label: '6M', value: 6 },
    { label: '1Y', value: 12 },
  ], []);

  function formatCurrency(amount: number): string {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  const cardClass = account.goal?.achieved 
    ? 'account-card-modern achieved-account' 
    : account.goal 
    ? 'account-card-modern goal-account' 
    : 'account-card-modern';

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(account.name);
    }
  };

  return (
    <div className={cardClass} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Link href={`/account/${encodeURIComponent(childName)}/${encodeURIComponent(account.name)}`} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="account-name-row">
          <div>
            <div className="account-name-title">{account.name}</div>
            {account.type === 'Compound Interest' && (
              <div className="account-status-badge">
                💰 Compound Interest Active
              </div>
            )}
          </div>
          <div className="account-balance-large">
            {formatCurrency(account.balance)}
          </div>
        </div>

        {account.goal && (
          <div className="goal-info-card">
            <div className="goal-header-row">
              <div className="goal-name-text">Goal: {account.goal.name}</div>
              <div className="goal-needed-text">
                {formatCurrency(account.goal.cost - account.balance)} needed
              </div>
            </div>
            <div className="progress-bar-modern">
              <div 
                className="progress-fill-modern" 
                style={{ width: `${Math.min(account.goal.progress * 100, 100)}%` }}
              />
            </div>
            <div className="goal-saved-text">
              {formatCurrency(account.balance)} Saved
            </div>
            <div className="goal-complete-text">
              {Math.round(account.goal.progress * 100)}% Complete
            </div>
          </div>
        )}

        {!account.goal && (
          <div className="account-chart" style={{ flex: 1 }}>
            <SavingsLine ledger={ledger} monthsToShow={monthsToShow} createdAt={account.createdAt} />
          </div>
        )}
      </Link>
      
      {onDelete && (
        <div style={{ padding: '12px', borderTop: '1px solid #e0e0e0', backgroundColor: '#f8f9fa' }}>
          <button
            onClick={handleDeleteClick}
            className="delete-account-btn"
            aria-label={`Delete ${account.name}`}
            style={{
              width: '100%',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
          >
            Delete Account
          </button>
        </div>
      )}
    </div>
  );
}


