import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { DoodleMobileAppIcon } from '../doodles/DoodleCharacter';

export function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;

      // CRITICAL: NEVER display on desktop browsers (strictly mobile only)
      const isMobileScreen = window.innerWidth <= 768;
      const ua = navigator.userAgent || '';
      const isMobileDevice = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);

      if (!isMobileScreen && !isMobileDevice) {
        return; // Desktop: do not show
      }

      // Check if already running in standalone PWA mode
      const isStandalone =
        Boolean(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
        window.navigator.standalone === true;

      if (isStandalone) {
        return; // Already installed as standalone app
      }

      // Check if user dismissed it in this session
      try {
        if (sessionStorage.getItem('omegle_pwa_dismissed') === 'true') {
          return;
        }
      } catch {}

      // Detect iOS device
      const isIos = /iPhone|iPad|iPod/.test(ua) && !window.MSStream;
      setIsIOS(isIos);

      const handleBeforeInstallPrompt = (e) => {
        try {
          e.preventDefault();
          setDeferredPrompt(e);
          setIsVisible(true);
        } catch {}
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // On mobile devices, prompt after 2.5s if not already dismissed
      const mobileTimer = setTimeout(() => {
        try {
          if (sessionStorage.getItem('omegle_pwa_dismissed') !== 'true') {
            setIsVisible(true);
          }
        } catch {
          setIsVisible(true);
        }
      }, 2500);

      return () => {
        clearTimeout(mobileTimer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    } catch (err) {
      console.warn('[PWA] Mobile detection note:', err);
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
        console.log('[PWA] User response:', outcome);
        setDeferredPrompt(null);
        setIsVisible(false);
      } else {
        alert('To install Omegle Next on your phone: Tap Chrome menu (⋮) -> tap "Install app" or "Add to Home screen".');
        setIsVisible(false);
      }
    } catch (err) {
      console.warn('[PWA] Install prompt error:', err);
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
        <div className="pwa-doodle-icon-box">
          <DoodleMobileAppIcon size={38} />
        </div>
        <div className="pwa-text-box">
          <div className="pwa-title-row">
            <strong>Install Mobile App</strong>
            <span className="pwa-pill-badge">Fullscreen</span>
          </div>
          <p className="pwa-subtitle">
            Hides Chrome header & footer for full screen video view.
          </p>
        </div>
      </div>

      <div className="pwa-actions-row">
        <button
          type="button"
          className="pwa-install-btn"
          onClick={handleInstallClick}
        >
          <Download size={14} strokeWidth={2.5} />
          <span>Install Now</span>
        </button>

        <button
          type="button"
          className="pwa-dismiss-btn"
          onClick={handleDismiss}
          aria-label="Dismiss banner"
        >
          <X size={15} strokeWidth={2.5} />
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
