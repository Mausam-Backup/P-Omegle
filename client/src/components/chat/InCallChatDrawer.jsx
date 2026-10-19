import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { X, Send, Smile, User } from 'lucide-react';
import { DoodleAvatarHead } from '../doodles/DoodleCharacter';

export function InCallChatDrawer() {
  const { isChatOpen, setIsChatOpen, messages, sendMessage, partner, isStrangerTyping, sendTypingStatus } = useChat();
  const [inputText, setInputText] = useState('');
  const messagesContainerRef = useRef(null);

  // Scroll only the messages container - never the document/window
  useEffect(() => {
    if (isChatOpen && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isChatOpen, isStrangerTyping]);

  if (!isChatOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
    sendTypingStatus(false);
  };

  const handleChange = (e) => {
    setInputText(e.target.value);
    sendTypingStatus(e.target.value.length > 0);
  };

  return (
    <div className="in-call-chat-panel">
      {/* Header */}
      <div className="chat-drawer-header">
        <div className="chat-drawer-partner-info">
          <DoodleAvatarHead seed="stranger" size={32} />
          <div>
            <div className="chat-drawer-partner-name">{partner?.name || 'Stranger'}</div>
            <div className="chat-drawer-partner-status">Connected live</div>
          </div>
        </div>
        <button
          type="button"
          className="chat-drawer-close-btn"
          onClick={() => setIsChatOpen(false)}
          title="Close Chat"
          aria-label="Close Chat"
        >
          <X size={18} />
        </button>
      </div>

      {/* Message feed */}
      <div className="chat-drawer-messages" ref={messagesContainerRef}>
        {messages.length === 0 ? (
          <div className="chat-drawer-empty-hint">
            Say hi to Stranger! Messages are ephemeral and P2P encrypted.
          </div>
        ) : (
          messages.map((msg) => {
            const isYou = msg.sender === 'you';
            return (
              <div key={msg.id} className={`drawer-msg-row ${isYou ? 'you' : 'stranger'}`}>
                <div className="drawer-msg-bubble">
                  {msg.text}
                </div>
                <span className="drawer-msg-time">{msg.time || '19:50'}</span>
              </div>
            );
          })
        )}

        {isStrangerTyping && (
          <div className="drawer-typing-indicator">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span>{partner?.name || 'Stranger'} is typing...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="chat-drawer-input-form">
        <input
          type="text"
          className="drawer-input-field"
          placeholder="Type a message..."
          value={inputText}
          onChange={handleChange}
        />
        <button
          type="submit"
          className="drawer-send-btn"
          disabled={!inputText.trim()}
          title="Send message"
          aria-label="Send message"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
