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
}

export default function AccountCard({ childName, account }: AccountCardProps) {
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

  return (
    <Link href={`/account/${encodeURIComponent(childName)}/${encodeURIComponent(account.name)}`}>
      <div className={cardClass}>
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
          <div className="account-chart">
            <SavingsLine ledger={ledger} monthsToShow={monthsToShow} createdAt={account.createdAt} />
          </div>
        )}
      </div>
    </Link>
  );
}


