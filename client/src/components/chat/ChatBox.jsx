import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { ActionControls } from './ActionControls';
import { Send, Download, Sparkles, AlertCircle } from 'lucide-react';

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

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
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
      <div className="chat-input-bar">
        {/* Skip / Next Action Button */}
        <ActionControls onOpenReport={onOpenReport} />

        {/* Message Input Form */}
        <form onSubmit={handleSend} style={{ display: 'flex', flex: 1, gap: '0.5rem' }}>
          <input
            ref={inputRef}
            type="text"
            className="chat-input-box"
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

          <button
            type="submit"
            className="btn-primary"
            disabled={chatStatus !== 'matched' || !inputText.trim()}
            style={{ padding: '0.65rem 1rem' }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
