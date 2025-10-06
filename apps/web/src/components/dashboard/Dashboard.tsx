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
    return `$${amount.toLocaleString()}`;
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
      <div className="page-header">
        <h1 className="page-title">{parentName ? `${parentName}'s Bank` : 'Family Savings Dashboard'}</h1>
        <div className="header-actions">
          <Link href="/settings" className="btn btn-secondary">Settings</Link>
        </div>
      </div>

      {children.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <img 
              src="/images/piggy-bank.png" 
              alt="Piggy Bank" 
              className="empty-state-image"
            />
          </div>
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
          <div className="dashboard-actions">
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddChild(true)}
            >
              + Add Child
            </button>
          </div>

          <div className="children-grid">
            {children.map((child) => (
              <Link 
                key={child.name} 
                href={`/child/${encodeURIComponent(child.name)}`}
                className="child-card"
              >
                <div className="child-card-content">
                  <div className="child-avatar">{child.avatar}</div>
                  <h3 className="child-name">{child.name}</h3>
                  <span className="child-balance">{formatCurrency(child.totalBalance)}</span>
                </div>
              </Link>
            ))}
          </div>
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

