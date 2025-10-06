'use client';

import { useState } from 'react';
import { ParentService } from '../../services/ParentService';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [parentName, setParentName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFeaturesExpanded, setIsFeaturesExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!parentName.trim()) {
      setError('Please enter a name');
      return;
    }

    setIsSubmitting(true);

    try {
      await ParentService.createParent(parentName.trim());
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create parent');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <div className="onboarding-header">
          <h1>Welcome to Kids Savings Bank!</h1>
          <p className="onboarding-subtitle">
            Here, you, the parent, acts as the bank. While you kids can learn about money, savings and the magic of compound interest. You can track their progress and manage their accounts.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="onboarding-form">
          <div className="form-group">
            <label htmlFor="parentName">Your Bank's Name</label>
            <input
              id="parentName"
              type="text"
              role="textbox"
              aria-label="Parent Name"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="Enter your name (e.g., Smith Family Bank)"
              disabled={isSubmitting}
              autoFocus
              className="form-input"
            />
          </div>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary btn-large"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Setting up...' : 'Create my bank'}
          </button>
        </form>

        <div className="onboarding-features">
          <button
            type="button"
            className="features-toggle"
            onClick={() => setIsFeaturesExpanded(!isFeaturesExpanded)}
            aria-expanded={isFeaturesExpanded}
          >
            <h3>Features</h3>
            <span className={`features-toggle-icon ${isFeaturesExpanded ? 'expanded' : ''}`}>
              ▼
            </span>
          </button>
          <div className={`features-content ${isFeaturesExpanded ? 'expanded' : ''}`}>
            <ul>
              <li>✓ Track multiple childrens and multiple accounts</li>
              <li>✓ Set up automatic allowances and decide how much interest you will pay</li>
              <li>✓ Create savings goals for your children</li>
              <li>✓ Transfer money between accounts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

