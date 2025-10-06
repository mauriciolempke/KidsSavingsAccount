'use client';

interface GoalProgressProps {
  currentAmount: number;
  targetAmount: number;
  goalName: string;
  achieved?: boolean;
  showDetails?: boolean;
}

export default function GoalProgress({ 
  currentAmount, 
  targetAmount, 
  goalName, 
  achieved = false,
  showDetails = true 
}: GoalProgressProps) {
  const progress = Math.min(100, (currentAmount / targetAmount) * 100);
  const remaining = Math.max(0, targetAmount - currentAmount);

  return (
    <div className="goal-progress-component">
      {showDetails && (
        <div className="goal-progress-header">
          <div className="goal-progress-info">
            <span className="goal-progress-name">{goalName}</span>
            <span className="goal-progress-percentage">{progress.toFixed(1)}%</span>
          </div>
          <div className="goal-progress-amounts">
            <span className="goal-progress-current">${currentAmount.toLocaleString()}</span>
            <span className="goal-progress-separator">/</span>
            <span className="goal-progress-target">${targetAmount.toLocaleString()}</span>
          </div>
        </div>
      )}

      <div className={`progress-bar-large ${achieved ? 'progress-achieved' : ''}`}>
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${goalName} progress: ${progress.toFixed(1)}%`}
        />
      </div>

      {showDetails && (
        <div className="goal-progress-footer">
          {achieved ? (
            <span className="goal-progress-status achieved">
              🎉 Goal Achieved!
            </span>
          ) : remaining > 0 ? (
            <span className="goal-progress-status">
              ${remaining.toLocaleString()} to go
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}

