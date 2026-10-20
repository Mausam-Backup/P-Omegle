import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { ActionControls } from './ActionControls';
import { Send, Download, Sparkles, AlertCircle, Smile } from 'lucide-react';
import { EmojiPicker } from './EmojiPicker';

export function ChatBox({ onOpenReport, isFullWidth = false }) {
  const {
    chatStatus,
    messages,
    sendMessage,
    isStrangerTyping,
    sendTypingStatus,
    sharedInterests,
    downloadTranscript,
    stopSearch
  } = useChat();

  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStrangerTyping]);

  // Focus input when matched
  useEffect(() => {
    if (chatStatus === 'matched') {
      inputRef.current?.focus();
    }
  }, [chatStatus]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    sendTypingStatus(e.target.value.length > 0);
  };

  const handleSelectEmoji = (emoji) => {
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart ?? inputText.length;
      const end = input.selectionEnd ?? inputText.length;
      const nextText = inputText.slice(0, start) + emoji + inputText.slice(end);
      setInputText(nextText);
      sendTypingStatus(true);
      setTimeout(() => {
        input.focus();
        const nextPos = start + emoji.length;
        input.setSelectionRange(nextPos, nextPos);
      }, 0);
    } else {
      setInputText((prev) => prev + emoji);
      sendTypingStatus(true);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
    setShowEmojiPicker(false);
    sendTypingStatus(false);
  };

  return (
    <div className={`chat-pane ${isFullWidth ? 'full-width' : ''}`}>
      {/* Chat Header */}
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Conversation</span>
          {chatStatus === 'matched' && (
            <span style={{ fontSize: '0.78rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span className="pulsing-dot" style={{ width: 6, height: 6 }}></span> Connected
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {messages.length > 1 && (
            <button
              className="chip-btn"
              onClick={downloadTranscript}
              title="Save chat log locally (FR-OME-10)"
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem' }}
            >
              <Download size={13} />
              <span>Save Log</span>
            </button>
          )}

          <button
            className="chip-btn"
            onClick={stopSearch}
            title="Leave and return to home"
            style={{ fontSize: '0.78rem' }}
          >
            Leave
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="messages-scroller">
        {messages.map((msg) => {
          if (msg.sender === 'system') {
            return (
              <div key={msg.id} className={`msg-line system ${msg.type || ''}`}>
                <div>{msg.text}</div>
                {msg.sharedInterests && msg.sharedInterests.length > 0 && (
                  <div className="shared-interests-badge">
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginRight: '0.2rem' }}>
                      Shared passions:
                    </span>
                    {msg.sharedInterests.map((interest) => (
                      <span key={interest} className="shared-interest-pill">
                        #{interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          if (msg.sender === 'stranger') {
            return (
              <div key={msg.id} className="msg-line stranger">
                <span className="sender-name">Stranger: </span>
                <span className="msg-text">{msg.text}</span>
              </div>
            );
          }

          return (
            <div key={msg.id} className="msg-line you">
              <span className="sender-name">You: </span>
              <span className="msg-text">{msg.text}</span>
            </div>
          );
        })}

        {/* Real-time typing indicator */}
        {isStrangerTyping && chatStatus === 'matched' && (
          <div className="typing-indicator-box">
            <span className="pulsing-dot" style={{ backgroundColor: '#60a5fa' }}></span>
            <span>Stranger is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar and action controls */}
      <div className="chat-input-bar" style={{ position: 'relative' }}>
        {showEmojiPicker && (
          <EmojiPicker
            onSelectEmoji={handleSelectEmoji}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}

        {/* Skip / Next Action Button */}
        <ActionControls onOpenReport={onOpenReport} />

        {/* Message Input Form */}
        <form onSubmit={handleSend} style={{ display: 'flex', flex: 1, gap: '0.5rem', alignItems: 'center' }}>
          <div className="chat-drawer-input-pill" style={{ flex: 1 }}>
            <input
              ref={inputRef}
              type="text"
              className="chat-input-box"
              style={{ flex: 1, border: 'none', background: 'transparent', padding: '0.65rem 0', outline: 'none', fontSize: '0.95rem' }}
              placeholder={
                chatStatus === 'matched'
                  ? "Type a message and press enter..."
                  : chatStatus === 'searching'
                  ? "Waiting to connect..."
                  : "Stranger disconnected. Click Skip to start new chat."
              }
              value={inputText}
              disabled={chatStatus !== 'matched'}
              onChange={handleInputChange}
            />
            {chatStatus === 'matched' && (
              <button
                type="button"
                className={`drawer-emoji-toggle-btn ${showEmojiPicker ? 'active' : ''}`}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                title="Add emoji"
                aria-label="Add emoji"
              >
                <Smile size={19} />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={chatStatus !== 'matched' || !inputText.trim()}
            style={{ padding: '0.65rem 1rem', borderRadius: 24 }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
