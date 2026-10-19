import React from 'react';
import { useChat } from './context/ChatContext';
import { useWebRTC } from './hooks/useWebRTC';
import { Navbar } from './components/layout/Navbar';
import { LiveVideoStage } from './components/video/LiveVideoStage';
import { InCallChatDrawer } from './components/chat/InCallChatDrawer';
import { LobbyScreen } from './components/lobby/LobbyScreen';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { ProModal } from './components/modals/ProModal';
import { DeviceSettingsModal } from './components/modals/DeviceSettingsModal';
import { AuthModal } from './components/auth/AuthModal';

export function App() {
  const { currentView } = useChat();
  const webrtc = useWebRTC();

  return (
    <>
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
      <ProModal />
      <DeviceSettingsModal />
      <AuthModal />
    </>
  );
}

export default App;
