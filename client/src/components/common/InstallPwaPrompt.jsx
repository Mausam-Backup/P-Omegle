import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';

export function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already running as installed standalone PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      return; // Already in full screen app mode!
    }

    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem('omegle_pwa_dismissed') === 'true';
    if (isDismissed) {
      return;
    }

    // Detect iOS
    const isIosDevice = /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e) => {
      // Prevent automatic mini-infobar on Chrome Mobile
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
      console.log('[PWA] beforeinstallprompt captured, install prompt ready');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If on iOS and not standalone, show prompt after a short delay
    if (isIosDevice) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    // Show the native Chrome installation prompt
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] User response to install prompt:', outcome);
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('omegle_pwa_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <aside className="pwa-install-banner" aria-label="Install app banner">
      <div className="pwa-banner-content">
        <div className="pwa-icon-box">
          <Smartphone size={20} strokeWidth={2.4} />
        </div>
        <div className="pwa-text-box">
          <div className="pwa-title-row">
            <strong>Install Fullscreen App</strong>
            <span className="pwa-pill-badge">Hides Browser Bar</span>
          </div>
          <p className="pwa-subtitle">
            Get the full screen mobile experience without the Chrome URL bar cutting off video controls.
          </p>
        </div>
      </div>

      <div className="pwa-actions-row">
        <button
          type="button"
          className="pwa-install-btn"
          onClick={handleInstallClick}
        >
          <Download size={15} strokeWidth={2.5} />
          <span>Install Now</span>
        </button>

        <button
          type="button"
          className="pwa-dismiss-btn"
          onClick={handleDismiss}
          aria-label="Dismiss install banner"
        >
          <X size={16} />
        </button>
      </div>

      {showIOSGuide && (
        <div className="pwa-ios-modal">
          <p>
            To install on iPhone/iPad: tap the <strong>Share</strong> button <span style={{ fontSize: '1.1rem' }}>⎋</span> at the bottom of Safari, then choose <strong>"Add to Home Screen"</strong>.
          </p>
          <button type="button" onClick={() => setShowIOSGuide(false)}>Got it</button>
        </div>
      )}
    </aside>
  );
}
