'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ParentService } from '../../services/ParentService';
import { ChildService, ChildSummary } from '../../services/ChildService';
import { useApp } from '../../state/AppContext';
import AddChildForm from '../forms/AddChildForm';
import Link from 'next/link';

interface DashboardProps {
  parentName: string | null;
}

export default function Dashboard({ parentName }: DashboardProps) {
  const router = useRouter();
  const { refreshTrigger, triggerRefresh, runBalanceCalculation } = useApp();
  const [children, setChildren] = useState<ChildSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddChild, setShowAddChild] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, [refreshTrigger]);

  async function loadDashboard() {
    setIsLoading(true);
    try {
      const childSummaries = await ChildService.getAllChildSummaries();
      setChildren(childSummaries);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddChildSuccess() {
    setShowAddChild(false);
    await runBalanceCalculation();
    triggerRefresh();
  }

  function formatCurrency(amount: number): string {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function getAccountCountText(child: ChildSummary): string {
    const count = child.accountCount || 0;
    if (count === 0) return 'No accounts';
    if (count === 1) return '1 Account Active';
    return `${count} Accounts Active`;
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="parent-dashboard-header">
        <h1 className="parent-dashboard-title">
          {parentName ? `${parentName}'s Bank` : 'My Kids Bank'}
        </h1>
        <Link href="/settings" className="settings-icon-btn" aria-label="Settings">
          ⚙️
        </Link>
      </div>

      {children.length === 0 ? (
        <div className="empty-state">
          <h2>No Children Added Yet</h2>
          <p>Get started by adding your first child to begin tracking their savings!</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddChild(true)}
          >
            Add Child
          </button>
        </div>
      ) : (
        <>
          <h2 className="family-overview-title">Family Overview</h2>

          <div className="children-grid">
            {children.map((child) => (
              <Link 
                key={child.name} 
                href={`/child/${encodeURIComponent(child.name)}`}
              >
                <div className="child-card-modern">
                  <div className="child-card-left">
                    <div className="child-card-name-age">
                      {child.name}
                    </div>
                    <div className="child-card-account-count">
                      {getAccountCountText(child)}
                    </div>
                  </div>
                  <div className="child-card-right">
                    <div className="child-card-balance-large">
                      {formatCurrency(child.totalBalance)}
                    </div>
                    <div className="child-card-balance-label">
                      Total Balance
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <button 
            className="add-child-btn"
            onClick={() => setShowAddChild(true)}
          >
            <span>👶</span>
            Add New Child
          </button>
        </>
      )}

      {showAddChild && (
        <div className="modal-overlay" onClick={() => setShowAddChild(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Child</h2>
              <button 
                className="modal-close"
                onClick={() => setShowAddChild(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <AddChildForm 
              onSuccess={handleAddChildSuccess}
              onCancel={() => setShowAddChild(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

