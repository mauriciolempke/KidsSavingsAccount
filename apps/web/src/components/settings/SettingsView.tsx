'use client';

import { useState } from 'react';
import { ManifestIO } from '../../persistence/ManifestIO';
import { LocalFileStore } from '../../persistence/LocalFileStore';
import { useRouter } from 'next/navigation';

export default function SettingsView() {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleExport() {
    setIsExporting(true);
    setMessage(null);

    try {
      await ManifestIO.downloadManifest();
      setMessage({ type: 'success', text: 'Data exported successfully!' });
    } catch (error) {
      console.error('Export failed:', error);
      setMessage({ type: 'error', text: 'Failed to export data' });
    } finally {
      setIsExporting(false);
    }
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setMessage(null);

    try {
      await ManifestIO.uploadAndImport(file);
      setMessage({ type: 'success', text: 'Data imported successfully! Reloading...' });
      
      // Reload page after successful import
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error('Import failed:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to import data' 
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  }

  async function handleDeleteEverything() {
    try {
      await LocalFileStore.deleteEverything();
      setMessage({ type: 'success', text: 'All data deleted. Redirecting...' });
      
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error('Delete failed:', error);
      setMessage({ type: 'error', text: 'Failed to delete data' });
    } finally {
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
      </div>

      {message && (
        <div className={`message-banner ${message.type}`} role="alert">
          {message.text}
        </div>
      )}

      <div className="settings-grid">
        <section className="settings-card">
          <h2>Export Data</h2>
          <p className="section-description">Download all your data as a JSON file.</p>
          <div className="settings-actions">
            <div className="settings-item">
              <div className="settings-item-info">
                <h3>Backup your data</h3>
                <p>Saves a snapshot of your current data to a file</p>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? 'Exporting...' : 'Export'}
              </button>
            </div>
          </div>
        </section>

        <section className="settings-card">
          <h2>Import Data</h2>
          <p className="section-description">Restore from a previous backup. Replaces current data.</p>
          <div className="settings-actions">
            <div className="settings-item">
              <div className="settings-item-info">
                <h3>Select backup file</h3>
                <p>Choose a previously exported JSON file to import</p>
              </div>
              <label className="btn btn-secondary file-input-label">
                {isImporting ? 'Importing...' : 'Choose File'}
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImport}
                  disabled={isImporting}
                  style={{ display: 'none' }}
                  aria-label="Choose file"
                />
              </label>
            </div>
          </div>
        </section>

        <section className="settings-card danger-card">
          <h2>Danger Zone</h2>
          <p className="section-description">Irreversible actions. Use with caution.</p>
          <div className="settings-actions">
            <div className="settings-item">
              <div className="settings-item-info">
                <h3>Delete Everything</h3>
                <p>Permanently delete all data. This cannot be undone.</p>
              </div>
              <button
                className="btn btn-danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Everything
              </button>
            </div>
          </div>
        </section>

        <section className="settings-card">
          <h2>About</h2>
          <div className="about-info">
            <p><strong>Kids Savings Account</strong></p>
            <p>Version 1.0.0</p>
            <p>A simple app to teach kids about saving money.</p>
            <p className="about-features">
              <strong>Features:</strong>
              <br />• Multiple children and accounts
              <br />• Allowances and interest
              <br />• Savings goals
              <br />• Transfers between accounts
              <br />• Export/Import data
              <br />• Offline-capable
            </p>
          </div>
        </section>
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Delete Everything</h2>
              <button 
                className="modal-close"
                onClick={() => setShowDeleteConfirm(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <p>Are you sure you want to delete all data?</p>
              <p className="warning-text">
                This will permanently delete:
              </p>
              <ul>
                <li>All children</li>
                <li>All accounts</li>
                <li>All transactions</li>
                <li>All settings</li>
              </ul>
              <p className="warning-text">
                <strong>This action cannot be undone!</strong>
              </p>
            </div>

            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleDeleteEverything}
              >
                Yes, Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

