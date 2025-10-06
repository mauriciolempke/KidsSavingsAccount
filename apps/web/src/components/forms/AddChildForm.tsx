'use client';

import { useState } from 'react';
import { ChildService } from '../../services/ChildService';

interface AddChildFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

// Child & Finance themed avatars
const AVATARS = ['👶', '🧒', '👧', '👦', '🎈', '💰', '🏦', '💵', '🪙', '⭐'];

export default function AddChildForm({ onSuccess, onCancel }: AddChildFormProps) {
  const [childName, setChildName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!childName.trim()) {
      setError('Please enter a child name');
      return;
    }

    setIsSubmitting(true);

    try {
      await ChildService.createChild(childName.trim(), selectedAvatar);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add child');
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="childName">Child Name</label>
        <input
          id="childName"
          type="text"
          role="textbox"
          aria-label="Child Name"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
          placeholder="Enter child's name"
          disabled={isSubmitting}
          autoFocus
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>Choose Avatar</label>
        <div className="avatar-grid">
          {AVATARS.map((avatar) => (
            <button
              key={avatar}
              type="button"
              className={`avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
              onClick={() => setSelectedAvatar(avatar)}
              disabled={isSubmitting}
            >
              {avatar}
            </button>
          ))}
        </div>
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
          {isSubmitting ? 'Adding...' : 'Add'}
        </button>
      </div>
    </form>
  );
}

