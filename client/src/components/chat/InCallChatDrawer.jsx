import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { X, Send, Smile, User } from 'lucide-react';
import { DoodleAvatarHead } from '../doodles/DoodleCharacter';
import { EmojiPicker } from './EmojiPicker';

export function InCallChatDrawer({ webrtc }) {
  const {
    isChatOpen,
    setIsChatOpen,
    messages,
    sendMessage,
    partner,
    isStrangerTyping,
    sendTypingStatus,
    chatStatus,
    isLive,
    partnerLeftInfo
  } = useChat();
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Connection state determination
  const isConnected = chatStatus === 'matched' && isLive;
  const isSearching = chatStatus === 'searching';
  const isPartnerLeft = chatStatus === 'partner_left' || chatStatus === 'ended' || !!partnerLeftInfo;

  let statusText = 'User not connected';
  let statusClass = 'offline';
  let partnerDisplayName = 'Stranger';

  if (isConnected) {
    statusText = 'Connected live';
    statusClass = 'live';
    partnerDisplayName = partner?.name || 'Stranger';
  } else if (isSearching) {
    statusText = 'Connecting...';
    statusClass = 'searching';
    partnerDisplayName = 'Looking for match...';
  } else if (isPartnerLeft) {
    statusText = 'Stranger disconnected';
    statusClass = 'disconnected';
    partnerDisplayName = 'Stranger (Left)';
  } else {
    statusText = 'User not connected';
    statusClass = 'offline';
    partnerDisplayName = 'Stranger';
  }

  // Scroll only the messages container - never the document/window
  useEffect(() => {
    if (isChatOpen && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isChatOpen, isStrangerTyping]);

  if (!isChatOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!isConnected || !inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
    setShowEmojiPicker(false);
    sendTypingStatus(false);
  };

  const handleChange = (e) => {
    setInputText(e.target.value);
    if (isConnected) {
      sendTypingStatus(e.target.value.length > 0);
    }
  };

  const handleSelectEmoji = (emoji) => {
    if (!isConnected) return;
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

  return (
    <div className="in-call-chat-panel">
      {/* Header */}
      <div className="chat-drawer-header">
        <div className="chat-drawer-partner-info">
          <DoodleAvatarHead seed="stranger" size={32} />
          <div>
            <div className="chat-drawer-partner-name">{partnerDisplayName}</div>
            <div className={`chat-drawer-partner-status ${statusClass}`}>
              <span className={`chat-status-dot ${statusClass}`} />
              <span>{statusText}</span>
            </div>
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
            {isConnected ? (
              <>Say hi to Stranger! Messages are ephemeral and P2P encrypted.</>
            ) : isSearching ? (
              <>Looking for someone to connect with you...</>
            ) : isPartnerLeft ? (
              <>Stranger has disconnected. Tap <strong>Next</strong> on video stage to find someone new.</>
            ) : (
              <>User is not connected yet. Connect to a stranger to start texting.</>
            )}
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

        {isStrangerTyping && isConnected && (
          <div className="drawer-typing-indicator">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span>{partnerDisplayName} is typing...</span>
          </div>
        )}
      </div>

      {/* Input Bar with Emoji Picker */}
      <div className="chat-drawer-input-container">
        {showEmojiPicker && isConnected && (
          <EmojiPicker
            onSelectEmoji={handleSelectEmoji}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}

        <form onSubmit={handleSend} className="chat-drawer-input-form">
          <div className={`chat-drawer-input-pill ${!isConnected ? 'disabled' : ''}`}>
            <input
              ref={inputRef}
              type="text"
              className="drawer-input-field"
              placeholder={isConnected ? "Type a message..." : "Waiting for connection..."}
              value={inputText}
              onChange={handleChange}
              disabled={!isConnected}
            />
            <button
              type="button"
              className={`drawer-emoji-toggle-btn ${showEmojiPicker ? 'active' : ''}`}
              onClick={() => isConnected && setShowEmojiPicker(!showEmojiPicker)}
              title={isConnected ? "Add emoji" : "User not connected"}
              aria-label="Add emoji"
              disabled={!isConnected}
            >
              <Smile size={19} />
            </button>
          </div>

          <button
            type="submit"
            className="drawer-send-btn"
            disabled={!isConnected || !inputText.trim()}
            title={isConnected ? "Send message" : "User not connected"}
            aria-label="Send message"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
