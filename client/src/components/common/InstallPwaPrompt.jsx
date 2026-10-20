import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;

      // Check if already running as installed standalone PWA
      const isStandalone =
        Boolean(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
        window.navigator.standalone === true;

      if (isStandalone) {
        return; // Already in full screen app mode
      }

      // Check if dismissed in this session
      try {
        if (sessionStorage.getItem('omegle_pwa_dismissed') === 'true') {
          return;
        }
      } catch {}

      // Detect iOS device
      const ua = navigator.userAgent || '';
      const isIosDevice = /iPhone|iPad|iPod/.test(ua) && !window.MSStream;
      setIsIOS(isIosDevice);

      const handleBeforeInstallPrompt = (e) => {
        try {
          e.preventDefault();
          setDeferredPrompt(e);
          setIsVisible(true);
        } catch {}
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // If mobile device, show installation prompt after 2 seconds
      const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      if (isMobile) {
        const timer = setTimeout(() => {
          try {
            if (sessionStorage.getItem('omegle_pwa_dismissed') !== 'true') {
              setIsVisible(true);
            }
          } catch {
            setIsVisible(true);
          }
        }, 2500);

        return () => {
          clearTimeout(timer);
          window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    } catch (err) {
      console.warn('[PWA] Hook initialization note:', err);
    }
  }, []);

  const handleInstallClick = async () => {
    try {
      if (isIOS) {
        setShowIOSGuide(true);
        return;
      }

      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('[PWA] User choice:', outcome);
        setDeferredPrompt(null);
        setIsVisible(false);
      } else {
        alert('To install Omegle Next on your phone: Tap Chrome menu (⋮) -> tap "Install app" or "Add to Home screen".');
        setIsVisible(false);
      }
    } catch (err) {
      console.warn('[PWA] Prompt error:', err);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      sessionStorage.setItem('omegle_pwa_dismissed', 'true');
    } catch {}
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
            Enjoy full screen view without the Chrome address bar cutting off video controls.
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
            Tap <strong>Share ⎋</strong> at bottom of Safari, then choose <strong>"Add to Home Screen"</strong>.
          </p>
          <button type="button" onClick={() => setShowIOSGuide(false)}>Got it</button>
        </div>
      )}
    </aside>
  );
}
