import React, { useState, useEffect } from 'react';
import { useChat } from './context/ChatContext';
import { useWebRTC } from './hooks/useWebRTC';
import { Navbar } from './components/layout/Navbar';
import { LiveVideoStage } from './components/video/LiveVideoStage';
import { InCallChatDrawer } from './components/chat/InCallChatDrawer';
import { LobbyScreen } from './components/lobby/LobbyScreen';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { DeviceSettingsModal } from './components/modals/DeviceSettingsModal';
import { AuthModal } from './components/auth/AuthModal';
import { InstallPwaPrompt } from './components/common/InstallPwaPrompt';
import { PushLoader } from './components/loader/PushLoader';

export function App() {
  const { currentView } = useChat();
  const [showLoader, setShowLoader] = useState(true);
  const webrtc = useWebRTC({ autoInitCamera: !showLoader });

  // Listen for replay requests (e.g. clicking the brand logo)
  useEffect(() => {
    const handleReplay = () => {
      setShowLoader(false);
      requestAnimationFrame(() => setShowLoader(true));
    };
    window.addEventListener('replay-loader', handleReplay);
    return () => window.removeEventListener('replay-loader', handleReplay);
  }, []);

  return (
    <>
      {/* Huy Phan Style Preloader Screen */}
      {showLoader && (
        <PushLoader onComplete={() => setShowLoader(false)} />
      )}

      {/* PWA Fullscreen Install Banner for Chrome & Mobile */}
      <InstallPwaPrompt />

      {/* Top Navbar */}
      <Navbar />

      {/* Main Viewport */}
      <main className="main-viewport">
        {currentView === 'call' ? (
          <>
            <LiveVideoStage webrtc={webrtc} />
            <InCallChatDrawer />
          </>
        ) : (
          <LobbyScreen webrtc={webrtc} />
        )}
      </main>

      {/* Modals & Dialogs */}
      <UserProfileModal />
      <DeviceSettingsModal />
      <AuthModal />
    </>
  );
}

export default App;
