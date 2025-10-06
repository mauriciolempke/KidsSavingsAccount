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

  return (
    <div className={`account-card ${account.goal?.achieved ? 'account-achieved' : ''}`}>
      <div className="account-card-header">
        <div className="account-card-title">
          <h3>{account.name}</h3>
          <span className="account-balance">${account.balance.toLocaleString()}</span>
          <span className="account-type">{account.type}</span>
        </div>
        <Link
          href={`/account/${encodeURIComponent(childName)}/${encodeURIComponent(account.name)}`}
          className="btn btn-secondary btn-small"
        >
          View Details
        </Link>
      </div>

      {account.goal && (
        <div className="account-goal-panel">
          <GoalProgress
            goalName={account.goal.name}
            currentAmount={account.balance}
            targetAmount={account.goal.cost}
            achieved={account.goal.achieved}
          />
        </div>
      )}

      <div className="account-chart">
        <SavingsLine ledger={ledger} monthsToShow={monthsToShow} createdAt={account.createdAt} />
      </div>

      <div className="period-selector period-below">
        {periodOptions.map(opt => (
          <button
            key={opt.value}
            className={monthsToShow === opt.value ? 'period-btn active' : 'period-btn'}
            onClick={() => setMonthsToShow(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}


