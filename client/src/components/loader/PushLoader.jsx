import React, { useEffect, useRef, useState, useCallback } from 'react';
import lottie from 'lottie-web/build/player/lottie_light';
import gsap from 'gsap';
import '../../styles/loader.css';

// Direct import of Lottie vector animation asset
import pushLottieData from '../../assets/push-loader.json';

const BASE_WIDTH = 429;
const BASE_HEIGHT = 451;
const LOTTIE_IP = Number(pushLottieData.ip || 30);
const LOTTIE_OP = Number(pushLottieData.op || 146);
const LOTTIE_CYCLE = Math.max(1, LOTTIE_OP - LOTTIE_IP); // 116 active frames

export function PushLoader({ onComplete, autoStart = true }) {
  const overlayRef = useRef(null);
  const textRef = useRef(null);
  const counterRef = useRef(null);
  const lottieContainerRef = useRef(null);
  const animItemRef = useRef(null);
  const timelineRef = useRef(null);
  const hasStartedRef = useRef(false);

  // Store latest onComplete in ref to prevent re-renders from recreating timeline
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [isFinished, setIsFinished] = useState(false);

  // Responsive layout measurement
  const getResponsiveSettings = useCallback(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const isMobile = width <= 768;

    const scale = isMobile ? 0.42 : 0.55;
    const charWidth = BASE_WIDTH * scale;
    const charHeight = BASE_HEIGHT * scale;
    const halfWidth = charWidth * 0.5;

    // Signature stops matching huyml.co
    const stops = [
      { progress: 0.30, moveDuration: isMobile ? 0.85 : 0.65, holdDuration: 0.16 },
      { progress: 0.60, moveDuration: isMobile ? 0.85 : 0.72, holdDuration: 0.20 },
      { progress: isMobile ? 1.35 : 1.25, moveDuration: isMobile ? 1.55 : 1.40, holdDuration: 0.35 }
    ];

    const maxPanelProgress = isMobile ? 1.35 : 1.15;
    const finalProgress = stops[2].progress;
    const insetRight = isMobile ? 18 : 28;

    return {
      isMobile,
      scale,
      charWidth,
      charHeight,
      halfWidth,
      stops,
      maxPanelProgress,
      finalProgress,
      insetRight
    };
  }, []);

  // Compute 0-100 display counter based on progress
  const calculateDisplayPercent = (currentProgress, stops, finalProgress) => {
    const p = Math.max(0, Math.min(finalProgress, currentProgress));
    const p1 = stops[0].progress;
    const p2 = stops[1].progress;

    let percent = 0;
    if (p <= p1) {
      percent = (p / p1) * 30;
    } else if (p <= p2) {
      percent = 30 + ((p - p1) / (p2 - p1)) * 30;
    } else {
      percent = 60 + ((p - p2) / (finalProgress - p2)) * 40;
    }
    return Math.min(100, Math.max(0, Math.round(percent)));
  };

  useEffect(() => {
    if (!lottieContainerRef.current || hasStartedRef.current || !autoStart) return;
    hasStartedRef.current = true;

    const overlay = overlayRef.current;
    const textEl = textRef.current;
    const counterEl = counterRef.current;
    const container = lottieContainerRef.current;
    if (!overlay || !container) return;

    // Prevent body scroll during loader
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const settings = getResponsiveSettings();
    const { stops, finalProgress, maxPanelProgress, insetRight, charWidth, charHeight, halfWidth } = settings;

    // Set initial CSS variables
    overlay.style.setProperty('--character-width', `${charWidth}px`);
    overlay.style.setProperty('--character-height', `${charHeight}px`);
    overlay.style.setProperty('--half-width', `${halfWidth}px`);
    overlay.style.setProperty('--panel-max-pct', `${maxPanelProgress * 100}%`);
    overlay.style.setProperty('--counter-inset-right', `${insetRight}px`);
    overlay.style.setProperty('--push-progress', '0');
    overlay.style.setProperty('--counter-push', '0px');

    // Initialize Lottie animation
    container.innerHTML = '';
    const anim = lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      animationData: pushLottieData,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet'
      }
    });
    animItemRef.current = anim;

    // Initial frame is relative 0 (lottie-web automatically offsets by firstFrame = 30)
    anim.goToAndStop(0, true);

    const progressTracker = { progress: 0 };
    const totalFrames = LOTTIE_CYCLE; // 116 frames between ip: 30 and op: 146

    // Update callback during timeline tick
    const updateProgress = () => {
      const current = progressTracker.progress;
      overlay.style.setProperty('--push-progress', `${current}`);

      // Update counter percentage
      if (counterEl) {
        const percent = calculateDisplayPercent(current, stops, finalProgress);
        counterEl.textContent = `${percent}`;

        // Counter slide when the black curtain edge nears it
        const winWidth = window.innerWidth || 1200;
        const counterRect = counterEl.getBoundingClientRect();
        const triggerPoint = winWidth - insetRight - (counterRect.width || 80);
        const curtainLeft = Math.min(maxPanelProgress, Math.max(0, current)) * winWidth;
        const pushOffset = Math.max(0, curtainLeft - triggerPoint);
        overlay.style.setProperty('--counter-push', `${pushOffset}px`);
      }

      // Step Lottie animation frames strictly between [0, totalFrames)
      // Because lottie-web internally renders (currentFrame + firstFrame),
      // relative frames [0, 115] map to absolute [30, 145] where all 27 body layers are active!
      const frame = ((Math.max(0, current) * totalFrames * 1.08) % totalFrames + totalFrames) % totalFrames;
      anim.goToAndStop(frame, true);
    };

    // Main GSAP Timeline
    const tl = gsap.timeline({
      paused: true,
      onUpdate: updateProgress,
      onComplete: () => {
        // Exit reveal transition: signature split parallax
        const exitTl = gsap.timeline({
          onComplete: () => {
            document.body.style.overflow = prevOverflow || '';
            setIsFinished(true);
            if (onCompleteRef.current) {
              onCompleteRef.current();
            }
          }
        });

        // 1. White overlay panel slides DOWN smoothly
        exitTl.to(overlay, {
          y: '100vh',
          duration: 1.15,
          ease: 'power3.inOut',
          force3D: true
        }, 0);

        // 2. Signature "O P OMEGLE" title slides UP in opposite direction
        if (textEl) {
          exitTl.to(textEl, {
            y: '-100vh',
            duration: 1.15,
            ease: 'power3.inOut',
            force3D: true
          }, 0);
        }
      }
    });

    timelineRef.current = tl;

    // Sequence stages
    stops.forEach((stop, index) => {
      const isLast = index === stops.length - 1;
      tl.to(progressTracker, {
        progress: stop.progress,
        duration: stop.moveDuration,
        ease: isLast ? 'power3.in' : 'power2.inOut'
      });

      if (stop.holdDuration > 0) {
        tl.to({}, { duration: stop.holdDuration });
      }
    });

    // Start timeline on next animation frame
    const rafId = requestAnimationFrame(() => {
      tl.play();
    });

    return () => {
      cancelAnimationFrame(rafId);
      tl.kill();
      anim.destroy();
      timelineRef.current = null;
      animItemRef.current = null;
      document.body.style.overflow = prevOverflow || '';
    };
  }, []); // Run ONCE on mount

  // Handle dynamic screen resizing
  useEffect(() => {
    const handleResize = () => {
      if (!overlayRef.current) return;
      const settings = getResponsiveSettings();
      overlayRef.current.style.setProperty('--character-width', `${settings.charWidth}px`);
      overlayRef.current.style.setProperty('--character-height', `${settings.charHeight}px`);
      overlayRef.current.style.setProperty('--half-width', `${settings.halfWidth}px`);
      overlayRef.current.style.setProperty('--panel-max-pct', `${settings.maxPanelProgress * 100}%`);
      overlayRef.current.style.setProperty('--counter-inset-right', `${settings.insetRight}px`);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getResponsiveSettings]);

  if (isFinished) return null;

  return (
    <div
      ref={overlayRef}
      className="push-loader-root"
      id="app-push-loader"
      aria-label="Loading O P Omegle"
      role="progressbar"
    >
      {/* 1. White Background Panel */}
      <div className="push-loader-panel-left" />

      {/* 2. Revealed Title: O P OMEGLE */}
      <div ref={textRef} className="push-loader-reveal-text">
        <span className="push-loader-text-line-1">O P</span>
        <span className="push-loader-text-line-2">OMEGLE</span>
      </div>

      {/* 3. Black Sliding Curtain */}
      <div className="push-loader-curtain" />

      {/* 4. Pusher Character Track */}
      <div className="push-loader-character-track">
        <div className="push-loader-character-box">
          <div
            ref={lottieContainerRef}
            style={{ width: '100%', height: '100%' }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* 5. Percentage Counter */}
      <div ref={counterRef} className="push-loader-counter">
        0
      </div>
    </div>
  );
}

export default PushLoader;
