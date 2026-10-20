import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Total available OpenPeeps SVGs in /peeps/openpeeps[1..50].svg
 */
const TOTAL_SVGS = 50;

const SPEECH_BUBBLES = [
  'Hey there! 👋',
  'Ready to chat! 🚀',
  'Music lover 🎵',
  'Tech geek 💻',
  'Good vibes ✨',
  'Coffee & chill ☕',
  'Say hello! 🌍',
  'Design & art 🎨',
  'Gaming right now 🎮',
  'Anime fan 🍜',
  'Nice to meet you! 😊',
  'Looking for friends 🤝'
];

/**
 * Generate a single person configuration in one of 3 depth tiers:
 * - 'front': Large scale, anchored below bottom edge (negative bottom) so torso covers bottom screen
 * - 'mid': Medium scale, sitting directly behind front row
 * - 'back': Smaller scale, peeking over mid/front heads
 */
function createPerson(group, spawnType, tier, config) {
  const id = `peep-${Math.random().toString(36).substr(2, 9)}`;
  const svgIndex = Math.floor(Math.random() * TOTAL_SVGS) + 1;
  const bubbleText = SPEECH_BUBBLES[Math.floor(Math.random() * SPEECH_BUBBLES.length)];

  let scale, opacity, blur, bottomOffset, zIndex, baseSpeedMultiplier;

  if (tier === 'front') {
    // Foreground / Front Row: Large, waist extending off-screen bottom, zero white space below
    scale = 1.35 + Math.random() * 0.35; // 1.35 - 1.70
    // Negative bottom ensures the flat cut-off bottom of the bust is hidden below the viewport
    bottomOffset = -25 - Math.random() * 20; // -25px to -45px
    opacity = 1.0;
    blur = 0;
    zIndex = 30 + Math.floor(Math.random() * 15); // 30-45
    baseSpeedMultiplier = 1.05;
  } else if (tier === 'mid') {
    // Midground / Middle Row: Medium size, torsos covered by front row
    scale = 1.05 + Math.random() * 0.25; // 1.05 - 1.30
    bottomOffset = 5 + Math.random() * 25; // 5px to 30px
    opacity = 0.96;
    blur = 0;
    zIndex = 16 + Math.floor(Math.random() * 13); // 16-29
    baseSpeedMultiplier = 0.95;
  } else {
    // Background / Back Row: Peeking heads in background
    scale = 0.8 + Math.random() * 0.22; // 0.80 - 1.02
    bottomOffset = 38 + Math.random() * 32; // 38px to 70px
    opacity = 0.85;
    blur = 0.5;
    zIndex = 6 + Math.floor(Math.random() * 9); // 6-15
    baseSpeedMultiplier = 0.82;
  }

  // Base dimensions (natural OpenPeeps aspect ratio is ~240x324)
  const width = Math.round(180 * scale);
  const height = Math.round(243 * scale);

  const speed = (config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed)) * baseSpeedMultiplier;

  let startX;
  let targetX;

  if (spawnType === 'random') {
    // Evenly disperse across the viewport (-6vw to 106vw)
    startX = -6 + Math.random() * 112;
    targetX = group === 'A' ? 112 + Math.random() * 5 : -12 - Math.random() * 5;
  } else if (group === 'A') {
    // Spawn from offscreen left
    startX = -15 - Math.random() * 8;
    targetX = 112 + Math.random() * 5;
  } else {
    // Spawn from offscreen right
    startX = 115 + Math.random() * 8;
    targetX = -12 - Math.random() * 5;
  }

  const distance = Math.abs(targetX - startX);
  const duration = Math.max(14, distance / speed);
  const bobDuration = 0.75 + Math.random() * 0.35;

  return {
    id,
    group,
    tier,
    svgIndex,
    bubbleText,
    startX,
    targetX,
    currentX: startX,
    bottomOffset,
    zIndex,
    scale,
    width,
    height,
    opacity,
    blur,
    duration,
    bobDuration
  };
}

/**
 * Individual walking doodle character component
 */
function Person({ person, onExited }) {
  const {
    id,
    group,
    tier,
    svgIndex,
    bubbleText,
    startX,
    targetX,
    bottomOffset,
    zIndex,
    width,
    height,
    opacity,
    blur,
    duration,
    bobDuration
  } = person;

  const [currentX, setCurrentX] = useState(startX);
  const [isHovered, setIsHovered] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Trigger animation after mount
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const secondFrame = requestAnimationFrame(() => {
        setHasStarted(true);
        setCurrentX(targetX);
      });
      return () => cancelAnimationFrame(secondFrame);
    });
    return () => cancelAnimationFrame(frame);
  }, [targetX]);

  const handleTransitionEnd = (e) => {
    // Only respond to horizontal transform transition
    if (e.propertyName === 'transform') {
      onExited(id, group, tier);
    }
  };

  if (imgError) return null;

  // Face movement direction: Group A moves -> (face right), Group B moves <- (face left)
  const flip = group === 'B' ? -1 : 1;

  return (
    <div
      className="doodle-peep-wrapper"
      style={{
        position: 'absolute',
        left: 0,
        bottom: `${bottomOffset}px`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex,
        transform: `translate3d(${currentX}vw, 0, 0)`,
        transition: hasStarted && !isHovered ? `transform ${duration}s linear` : 'none',
        willChange: 'transform',
        pointerEvents: 'auto',
        cursor: 'pointer'
      }}
      onTransitionEnd={handleTransitionEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Speech bubble on hover */}
      {isHovered && (
        <div className="doodle-peep-bubble">
          <span>{bubbleText}</span>
          <div className="doodle-bubble-arrow" />
        </div>
      )}

      {/* Walking Bobbing Container */}
      <div
        className="doodle-peep-bobber"
        style={{
          width: '100%',
          height: '100%',
          animation: !isHovered ? `doodleWalkBob ${bobDuration}s ease-in-out infinite alternate` : 'none',
          transform: isHovered ? 'scale(1.06) translateY(-6px)' : undefined,
          transition: 'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        <img
          src={`/peeps/openpeeps${svgIndex}.svg`}
          alt=""
          loading="lazy"
          decoding="async"
          draggable="false"
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: `scaleX(${flip})`,
            opacity,
            filter: blur > 0 ? `blur(${blur.toFixed(1)}px)` : 'none',
            userSelect: 'none',
            pointerEvents: 'none'
          }}
        />
      </div>
    </div>
  );
}

/**
 * Main Crowd Layer Component
 */
export function DoodleCrowdLayer({ className = '', style = {} }) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });
  const [persons, setPersons] = useState([]);
  const isMountedRef = useRef(true);

  // Crowd speed bounds
  const config = useRef({
    minSpeed: 4.0,
    maxSpeed: 9.5
  }).current;

  // Handle window resizing between mobile and desktop
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth <= 768);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize dense crowd stratified across depth tiers (desktop only)
  useEffect(() => {
    if (isMobile) {
      setPersons([]);
      return;
    }

    isMountedRef.current = true;
    const width = window.innerWidth;

    // Density adjusted for screen width:
    // Front row has heavy coverage to guarantee zero white gap at bottom edge
    const tierCounts = width < 1024
      ? { front: 20, mid: 18, back: 14 }
      : { front: 26, mid: 24, back: 20 };

    const initialPersons = [];

    // Foreground characters (50% Group A, 50% Group B)
    for (let i = 0; i < tierCounts.front; i++) {
      const group = i % 2 === 0 ? 'A' : 'B';
      initialPersons.push(createPerson(group, 'random', 'front', config));
    }

    // Midground characters
    for (let i = 0; i < tierCounts.mid; i++) {
      const group = i % 2 === 0 ? 'A' : 'B';
      initialPersons.push(createPerson(group, 'random', 'mid', config));
    }

    // Background characters
    for (let i = 0; i < tierCounts.back; i++) {
      const group = i % 2 === 0 ? 'A' : 'B';
      initialPersons.push(createPerson(group, 'random', 'back', config));
    }

    setPersons(initialPersons);

    return () => {
      isMountedRef.current = false;
    };
  }, [config]);

  // Respawn a person from the edge when they exit the screen
  const handlePersonExited = useCallback((id, group, tier) => {
    if (!isMountedRef.current) return;

    setPersons((prev) => {
      const next = [...prev];
      const index = next.findIndex((p) => p.id === id);
      if (index !== -1) {
        // Respawn from offscreen edge within the same depth tier
        next[index] = createPerson(group, group === 'A' ? 'left' : 'right', tier, config);
      }
      return next;
    });
  }, [config]);

  if (isMobile) {
    return null;
  }

  return (
    <div
      className={`doodle-crowd-layer ${className}`}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '340px',
        maxHeight: '48vh',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 10,
        ...style
      }}
      aria-hidden="true"
    >
      {/* Soft gradient fade along the top edge so characters blend into the background */}
      <div className="doodle-crowd-fade-top" />

      {/* Render all walking crowd members */}
      <div className="doodle-crowd-stage">
        {persons.map((person) => (
          <Person
            key={person.id}
            person={person}
            onExited={handlePersonExited}
          />
        ))}
      </div>
    </div>
  );
}

export default DoodleCrowdLayer;
