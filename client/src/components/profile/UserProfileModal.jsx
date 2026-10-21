import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, User, Check, LogOut } from 'lucide-react';
import { DoodleAvatarHead } from '../doodles/DoodleCharacter';

const DOODLE_PRESETS = ['you', 'stranger', 'self', 'peep-1', 'peep-2'];

export function UserProfileModal() {
  const { user, isProfileModalOpen, setIsProfileModalOpen, updateProfile, logout } = useAuth();
  const [name, setName] = useState(user?.displayName || 'You');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'you');
  const [savedMessage, setSavedMessage] = useState(false);

  if (!isProfileModalOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({ displayName: name, avatar: selectedAvatar });
    setSavedMessage(true);
    setTimeout(() => {
      setSavedMessage(false);
      setIsProfileModalOpen(false);
    }, 900);
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsProfileModalOpen(false)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <User size={20} color="#0f172a" />
            <h3 className="modal-heading">User Profile</h3>
          </div>
          <button className="modal-close-icon-btn" onClick={() => setIsProfileModalOpen(false)} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-body-form">
          {/* Black & White Doodle Avatar Picker */}
          <div className="avatar-selection-group">
            <label className="field-label">Choose Avatar</label>
            <div className="avatar-options-row">
              {DOODLE_PRESETS.map((preset, idx) => (
                <div
                  key={idx}
                  className={`avatar-option-item ${selectedAvatar === preset ? 'selected' : ''}`}
                  onClick={() => setSelectedAvatar(preset)}
                >
                  <DoodleAvatarHead seed={preset} size="100%" />
                  {selectedAvatar === preset && (
                    <div className="avatar-check-badge">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Display Name Input */}
          <div className="form-field-group">
            <label className="field-label">Display Name</label>
            <input
              type="text"
              className="field-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (e.g. You)..."
              required
            />
          </div>

          {/* Actions */}
          <div className="modal-actions-row">
            <button
              type="button"
              className="secondary-btn"
              onClick={logout}
              title="Sign Out"
            >
              <LogOut size={16} />
              <span>Log out</span>
            </button>

            <button type="submit" className="primary-submit-btn">
              {savedMessage ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
