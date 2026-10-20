import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { Video, MessageSquare, Plus, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { DoodleCrowdLayer } from '../doodles/DoodleCrowdLayer';

const SUGGESTED_INTERESTS = [
  'gaming', 'music', 'anime', 'coding', 'movies', 'fitness', 'tech', 'art', 'philosophy', 'travel'
];

export function LandingHero() {
  const { mode, setMode, interests, setInterests, startChat } = useChat();
  const [tagInput, setTagInput] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(true);

  const addTag = (tag) => {
    const clean = tag.trim().toLowerCase();
    if (clean && !interests.includes(clean) && interests.length < 5) {
      setInterests([...interests, clean]);
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove) => {
    setInterests(interests.filter(t => t !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const handleStart = () => {
    if (!ageConfirmed) {
      alert('You must confirm you are 18 or older to start chatting.');
      return;
    }
    startChat(mode, interests);
  };

  return (
    <div className="hero-wrapper">
      {/* Hero Banner */}
      <div className="hero-banner glass-panel">
        <h1 className="hero-title">Talk to Strangers!</h1>
        <p className="hero-subtitle">
          Omegle gives you instant, 1-on-1 random video and text chat with interesting people worldwide. Select your mode and add your passions to get matched!
        </p>
      </div>

      {/* Mode Selection Cards */}
      <div className="mode-grid">
        <div
          className={`mode-card glass-panel video ${mode === 'video' ? 'selected' : ''}`}
          onClick={() => setMode('video')}
        >
          <div className="mode-icon-box">
            <Video size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.35rem' }}>Video Chat</h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
              Live audio & video with side text chat. Best for face-to-face conversations.
            </p>
          </div>
          {mode === 'video' && <CheckCircle2 size={20} color="#818cf8" style={{ marginTop: 'auto' }} />}
        </div>

        <div
          className={`mode-card glass-panel text ${mode === 'text' ? 'selected' : ''}`}
          onClick={() => setMode('text')}
        >
          <div className="mode-icon-box">
            <MessageSquare size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.35rem' }}>Text Chat</h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
              Pure anonymous text messaging. No camera or microphone needed.
            </p>
          </div>
          {mode === 'text' && <CheckCircle2 size={20} color="#38bdf8" style={{ marginTop: 'auto' }} />}
        </div>
      </div>

      {/* Interests Section (FR-OME-03) */}
      <div className="interest-card glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="#a5b4fc" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>What do you want to talk about?</h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{interests.length}/5 tags</span>
        </div>

        {/* Tag Input Box */}
        <div className="tag-input-container">
          {interests.map((tag) => (
            <span key={tag} className="tag-pill">
              #{tag}
              <button type="button" onClick={() => removeTag(tag)}>
                <X size={13} />
              </button>
            </span>
          ))}

          {interests.length < 5 && (
            <input
              type="text"
              className="tag-text-input"
              placeholder={interests.length === 0 ? "Add your interests (e.g. music, gaming, anime)..." : "Add another tag..."}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          )}
        </div>

        {/* Suggested Interest Chips */}
        <div className="suggested-chips">
          <span style={{ fontSize: '0.8rem', color: '#64748b', marginRight: '0.3rem' }}>Popular:</span>
          {SUGGESTED_INTERESTS.filter(t => !interests.includes(t)).slice(0, 7).map((tag) => (
            <button
              key={tag}
              type="button"
              className="chip-btn"
              onClick={() => addTag(tag)}
            >
              + {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Age Confirmation Checklist (FR-AUTH-04) */}
      <div className="age-check-box">
        <input
          type="checkbox"
          id="ageConsent"
          checked={ageConfirmed}
          onChange={(e) => setAgeConfirmed(e.target.checked)}
          style={{ width: 18, height: 18, cursor: 'pointer', marginTop: 2 }}
        />
        <label htmlFor="ageConsent" style={{ cursor: 'pointer', lineHeight: 1.45 }}>
          <strong>Age Requirement:</strong> I certify that I am at least 18 years old and agree to follow the Omegle Community Guidelines and Terms of Service. Unmoderated nudity and harassment are strictly prohibited.
        </label>
      </div>

      {/* Start Button */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          className="btn-primary"
          onClick={handleStart}
          style={{ padding: '0.9rem 2.75rem', fontSize: '1.15rem', borderRadius: 12 }}
        >
          {mode === 'video' ? <Video size={22} /> : <MessageSquare size={22} />}
          <span>Start {mode === 'video' ? 'Video Chat' : 'Text Chat'}</span>
        </button>
      </div>

      {/* Dynamic Animated Doodle Crowd Layer (MiroFish style) */}
      <DoodleCrowdLayer />
    </div>
  );
}
