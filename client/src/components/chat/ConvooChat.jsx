import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { MoreVertical, Smile, Send, Download } from 'lucide-react';

export function ConvooChat() {
  const { messages, sendMessage, partnerName, isStrangerTyping, sendTypingStatus, skipPartner } = useChat();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStrangerTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
    sendTypingStatus(false);
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    sendTypingStatus(e.target.value.length > 0);
  };

  return (
    <div className="convoo-chat-card">
      {/* Chat Card Header */}
      <div className="chat-card-header">
        <h2 className="chat-title">Chat</h2>
        <button className="chat-menu-btn" title="Options">
          <MoreVertical size={18} />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="chat-messages-area">
        {messages.map((msg) => {
          const isYou = msg.sender === 'you';

          if (isYou) {
            return (
              <div key={msg.id} className="message-wrapper you-wrapper">
                <div className="message-meta-time">{msg.time || '19:50'}</div>
                <div className="bubble-you">
                  {msg.text}
                </div>
              </div>
            );
          } else {
            return (
              <div key={msg.id} className="message-wrapper partner-wrapper">
                <div className="partner-header-row">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
                    alt={msg.author || partnerName}
                    className="partner-small-avatar"
                  />
                  <span className="partner-meta-name">
                    {msg.author || partnerName} <span className="partner-meta-time">{msg.time || '19:48'}</span>
                  </span>
                </div>
                <div className="bubble-partner">
                  {msg.text}
                </div>
              </div>
            );
          }
        })}

        {isStrangerTyping && (
          <div className="typing-indicator-row">
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: '0.35rem' }}>
              {partnerName} is typing...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Pill Input Form */}
      <form onSubmit={handleSend} className="chat-input-pill-container">
        <button type="button" className="emoji-btn" title="Insert Emoji">
          <Smile size={20} color="#a855f7" />
        </button>

        <input
          type="text"
          className="chat-text-input"
          placeholder="Type a message..."
          value={inputText}
          onChange={handleInputChange}
        />

        <button
          type="submit"
          className="chat-send-btn"
          disabled={!inputText.trim()}
          title="Send message"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
