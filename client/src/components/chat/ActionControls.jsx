import React, { useState, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';

export function ActionControls() {
  const { chatStatus, skipPartner } = useChat();
  const [confirmStep, setConfirmStep] = useState(false);

  // Auto-reset confirmation after 3.5 seconds
  useEffect(() => {
    if (confirmStep) {
      const timer = setTimeout(() => {
        setConfirmStep(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [confirmStep]);

  // Keyboard shortcut listener for Esc key (FR-OME-07)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleSkipClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chatStatus, confirmStep]);

  const handleSkipClick = () => {
    if (chatStatus === 'searching') {
      return;
    }

    // If partner already left, skip immediately in 1 step
    if (chatStatus === 'partner_left') {
      skipPartner(true);
      setConfirmStep(false);
      return;
    }

    // If active match, require two-step confirmation to prevent accidental skip
    if (!confirmStep) {
      setConfirmStep(true);
    } else {
      skipPartner(true);
      setConfirmStep(false);
    }
  };

  const getButtonText = () => {
    if (chatStatus === 'searching') {
      return { main: 'Searching...', sub: 'Wait' };
    }
    if (chatStatus === 'partner_left') {
      return { main: 'New', sub: 'Esc' };
    }
    if (confirmStep) {
      return { main: 'Really?', sub: 'Esc' };
    }
    return { main: 'Skip', sub: 'Esc' };
  };

  const { main, sub } = getButtonText();

  return (
    <button
      type="button"
      className={`btn-skip ${confirmStep ? 'confirm-state' : ''}`}
      onClick={handleSkipClick}
      disabled={chatStatus === 'searching'}
      title="Press Esc or click to find someone new"
    >
      <span>{main}</span>
      <span className="shortcut-hint">{sub}</span>
    </button>
  );
}
