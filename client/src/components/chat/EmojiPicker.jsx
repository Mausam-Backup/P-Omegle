import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X } from 'lucide-react';

const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    name: 'Smileys',
    icon: '😊',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '☺️',
      '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😋',
      '😛', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳',
      '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '😣', '😖', '😫',
      '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤯', '😳', '🥵',
      '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫',
      '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮',
      '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮',
      '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👻', '💀',
      '💩', '🤡', '🤖', '👽', '🎃'
    ]
  },
  {
    id: 'gestures',
    name: 'Gestures',
    icon: '👋',
    emojis: [
      '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞',
      '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍',
      '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝',
      '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂',
      '🦻', '👃', '👀', '👁️', '👅', '👄'
    ]
  },
  {
    id: 'hearts',
    name: 'Hearts & Love',
    icon: '❤️',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌',
      '💋', '🌹', '💐', '🌺', '🌷', '🌸', '✨', '⭐', '🌟', '💫'
    ]
  },
  {
    id: 'fun',
    name: 'Fun & Food',
    icon: '🎉',
    emojis: [
      '🎉', '🎊', '🎈', '🎁', '🎂', '🍻', '🍺', '🍷', '🍸', '🍹',
      '☕', '🍵', '🧋', '🍕', '🍔', '🍟', '🌭', '🍿', '🍩', '🍪',
      '🍫', '🍬', '🍦', '🍓', '🥑', '🌮', '🍣', '🍜', '🍝', '🥐',
      '🚀', '✈️', '🚗', '🛵', '🚲', '🎮', '🕹️', '🎲', '🏆', '🥇',
      '⚽', '🏀', '🏈', '⚾', '🎾', '🎸', '🎹', '🎧', '🎤', '🎬'
    ]
  },
  {
    id: 'animals',
    name: 'Nature',
    icon: '🐱',
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
      '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦆', '🦅',
      '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌',
      '🐞', '🐜', '🦟', '🐢', '🐍', '🐙', '🦑', '🦐', '🦀', '🐡',
      '🐠', '🐟', '🐬', '🐳', '🦈', '🦭', '🐊', '🐅', '🐆', '🦓'
    ]
  },
  {
    id: 'symbols',
    name: 'Symbols',
    icon: '🔥',
    emojis: [
      '🔥', '💥', '⚡', '🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌧️',
      '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '🌪️', '🌫️',
      '💧', '💦', '🌊', '💯', '💢', '💬', '💭', '🗯️', '💤', '🎵',
      '🎶', '🔔', '🔕', '📣', '📢', '💡', '💎', '💰', '💵', '💳'
    ]
  }
];

export function EmojiPicker({ onSelectEmoji, onClose }) {
  const [activeTab, setActiveTab] = useState('smileys');
  const [searchQuery, setSearchQuery] = useState('');
  const pickerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Filtered emojis if searching
  const displayedEmojis = useMemo(() => {
    if (!searchQuery.trim()) {
      const activeCategory = EMOJI_CATEGORIES.find((c) => c.id === activeTab);
      return activeCategory ? activeCategory.emojis : [];
    }
    // Search in all categories
    const q = searchQuery.toLowerCase();
    const all = [];
    EMOJI_CATEGORIES.forEach((cat) => {
      cat.emojis.forEach((em) => {
        if (!all.includes(em)) all.push(em);
      });
    });
    return all;
  }, [activeTab, searchQuery]);

  return (
    <div className="emoji-picker-popup" ref={pickerRef}>
      {/* Header with Search and Close */}
      <div className="emoji-picker-header">
        <div className="emoji-search-box">
          <Search size={14} className="emoji-search-icon" />
          <input
            type="text"
            className="emoji-search-input"
            placeholder="Search emojis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              className="emoji-search-clear"
              onClick={() => setSearchQuery('')}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      {!searchQuery && (
        <div className="emoji-picker-tabs">
          {EMOJI_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`emoji-tab-btn ${activeTab === cat.id ? 'active' : ''}`}
              onClick={() => setActiveTab(cat.id)}
              title={cat.name}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      {/* Emoji Grid */}
      <div className="emoji-grid-container">
        {displayedEmojis.map((emoji, idx) => (
          <button
            key={`${emoji}-${idx}`}
            type="button"
            className="emoji-item-btn"
            onClick={() => onSelectEmoji(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

export default EmojiPicker;
