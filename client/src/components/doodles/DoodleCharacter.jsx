import React from 'react';

/**
 * Professional minimalist Black & White UI/UX Doodle Illustrations
 * Handcrafted pure vector SVGs inspired by the Open Peeps (Pablo Stanley) style.
 * Zero external HTTP dependencies, razor-sharp on all screen densities.
 */

// 1. Doodle for Stranger (Relaxed, friendly character with headphones & spectacles)
export function DoodleStranger({ className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 280 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: '100%', height: '100%', maxWidth: 220, maxHeight: 220, ...style }}
    >
      {/* Background Soft Circle */}
      <circle cx="140" cy="140" r="130" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4 4" />
      
      {/* Body / Torso */}
      <path
        d="M60 270 C60 215 95 195 140 195 C185 195 220 215 220 270"
        fill="#ffffff"
        stroke="#0f172a"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Sweater Collar */}
      <path
        d="M115 198 C125 212 155 212 165 198"
        stroke="#0f172a"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Neck */}
      <path
        d="M120 180 L120 196 C120 200 160 200 160 196 L160 180"
        fill="#ffffff"
        stroke="#0f172a"
        strokeWidth="3"
      />

      {/* Head / Face */}
      <ellipse cx="140" cy="135" rx="44" ry="50" fill="#ffffff" stroke="#0f172a" strokeWidth="3.5" />

      {/* Hair - Curly doodle fluff */}
      <path
        d="M92 125 C88 100 102 75 125 70 C145 65 170 68 182 82 C194 95 194 115 188 130 C182 110 170 92 145 92 C120 92 105 105 92 125 Z"
        fill="#0f172a"
      />
      <circle cx="100" cy="85" r="12" fill="#0f172a" />
      <circle cx="120" cy="72" r="14" fill="#0f172a" />
      <circle cx="145" cy="68" r="15" fill="#0f172a" />
      <circle cx="170" cy="75" r="14" fill="#0f172a" />

      {/* Spectacles / Glasses */}
      <rect x="110" y="122" width="24" height="20" rx="6" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
      <rect x="146" y="122" width="24" height="20" rx="6" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
      <line x1="134" y1="130" x2="146" y2="130" stroke="#0f172a" strokeWidth="3" />
      <line x1="96" y1="128" x2="110" y2="128" stroke="#0f172a" strokeWidth="2.5" />
      <line x1="170" y1="128" x2="184" y2="128" stroke="#0f172a" strokeWidth="2.5" />

      {/* Eyes */}
      <circle cx="122" cy="131" r="3" fill="#0f172a" />
      <circle cx="158" cy="131" r="3" fill="#0f172a" />

      {/* Eyebrows */}
      <path d="M112 115 Q122 112 130 116" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M150 116 Q158 112 168 115" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />

      {/* Nose */}
      <path d="M140 137 L137 148 L143 148" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Smile */}
      <path d="M130 159 Q140 168 150 159" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Headphones */}
      <path
        d="M96 135 C88 135 88 115 96 115 L98 140 Z"
        fill="#0f172a"
      />
      <path
        d="M184 135 C192 135 192 115 184 115 L182 140 Z"
        fill="#0f172a"
      />
      <path
        d="M96 120 C94 80 186 80 184 120"
        stroke="#0f172a"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// 2. Doodle for Camera Off / Self Hidden (Chill character with eyes closed & smile)
export function DoodleCameraOff({ className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 280 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: '100%', height: '100%', maxWidth: 220, maxHeight: 220, ...style }}
    >
      <circle cx="140" cy="140" r="130" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4 4" />

      {/* Body / Shoulders */}
      <path
        d="M60 270 C60 215 95 195 140 195 C185 195 220 215 220 270"
        fill="#ffffff"
        stroke="#0f172a"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Collar */}
      <path d="M125 195 L140 215 L155 195" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="#ffffff" />

      {/* Neck */}
      <rect x="126" y="176" width="28" height="22" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />

      {/* Head */}
      <ellipse cx="140" cy="132" rx="42" ry="48" fill="#ffffff" stroke="#0f172a" strokeWidth="3.5" />

      {/* Beanie / Hat */}
      <path
        d="M98 120 C95 85 110 65 140 65 C170 65 185 85 182 120 Z"
        fill="#0f172a"
      />
      <rect x="94" y="108" width="92" height="18" rx="6" fill="#ffffff" stroke="#0f172a" strokeWidth="3.5" />
      <line x1="108" y1="110" x2="108" y2="124" stroke="#0f172a" strokeWidth="2" />
      <line x1="124" y1="110" x2="124" y2="124" stroke="#0f172a" strokeWidth="2" />
      <line x1="140" y1="110" x2="140" y2="124" stroke="#0f172a" strokeWidth="2" />
      <line x1="156" y1="110" x2="156" y2="124" stroke="#0f172a" strokeWidth="2" />
      <line x1="172" y1="110" x2="172" y2="124" stroke="#0f172a" strokeWidth="2" />

      {/* Relaxed / Closed Eyes (Happy arches) */}
      <path d="M116 138 Q124 132 132 138" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M148 138 Q156 132 164 138" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Nose */}
      <path d="M140 142 L138 150 L143 150" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />

      {/* Peaceful Smile */}
      <path d="M132 160 Q140 167 148 160" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Tiny Camera Slash Badge floating */}
      <g transform="translate(180, 180)">
        <circle cx="24" cy="24" r="22" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
        <rect x="14" y="16" width="20" height="15" rx="3" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
        <circle cx="24" cy="23.5" r="4" stroke="#0f172a" strokeWidth="2" />
        <line x1="12" y1="12" x2="36" y2="36" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// 3. Doodle for Searching State (Character with curious telescope / searching gaze)
export function DoodleSearching({ className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 280 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`doodle-searching-svg ${className}`}
      style={{ width: '100%', height: '100%', maxWidth: 220, maxHeight: 220, ...style }}
    >
      <circle
        cx="140"
        cy="140"
        r="130"
        fill="#f8fafc"
        stroke="#cbd5e1"
        strokeWidth="2.5"
        strokeDasharray="6 6"
        className="doodle-searching-radar"
      />

      <g className="doodle-searching-character">
        {/* Torso */}
        <path
          d="M70 270 C70 220 100 200 140 200 C180 200 210 220 210 270"
          fill="#ffffff"
          stroke="#0f172a"
          strokeWidth="3.5"
        />

        {/* Head */}
        <ellipse cx="140" cy="135" rx="44" ry="48" fill="#ffffff" stroke="#0f172a" strokeWidth="3.5" />

        {/* Messy Hair */}
        <path
          d="M96 125 C88 95 110 70 140 70 C170 70 192 95 184 125 C178 100 165 88 140 88 C115 88 102 100 96 125 Z"
          fill="#0f172a"
        />
        <path d="M125 68 C120 55 135 52 140 68" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M142 66 C148 50 160 55 155 68" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" fill="none" />

        {/* Looking Eyes - glancing to side */}
        <circle cx="126" cy="132" r="8" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
        <circle cx="156" cy="132" r="8" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
        <circle cx="129" cy="132" r="3.5" fill="#0f172a" />
        <circle cx="159" cy="132" r="3.5" fill="#0f172a" />

        {/* Eyebrows (Inquisitive / raised) */}
        <path d="M118 118 Q126 112 134 116" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M148 115 Q156 110 164 114" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />

        {/* Nose */}
        <path d="M144 138 L142 148 L147 148" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />

        {/* Small 'o' mouth (curious) */}
        <ellipse cx="145" cy="162" rx="4.5" ry="6" fill="#0f172a" />

        {/* Hand waving */}
        <path
          d="M190 220 C205 200 215 180 220 160 C222 150 212 145 206 155 C200 165 192 185 180 205"
          stroke="#0f172a"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="#ffffff"
          className="doodle-waving-hand"
        />
      </g>
    </svg>
  );
}

// 4. Compact B&W Avatar Heads for pill badges & profile selection (5 distinct styles)
export function DoodleAvatarHead({ seed = 'beanie', size = 26, className = '', style = {} }) {
  // Normalize seed
  let variant = seed || 'beanie';
  if (variant === 'you' || variant === 'self') variant = 'beanie';
  if (variant === 'stranger') variant = 'glasses';
  if (variant === 'peep-1') variant = 'cap';
  if (variant === 'peep-2') variant = 'afro';

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        width: size,
        height: size,
        maxWidth: '100%',
        maxHeight: '100%',
        borderRadius: '50%',
        background: '#ffffff',
        border: '1.5px solid #0f172a',
        flexShrink: 0,
        boxSizing: 'border-box',
        ...style
      }}
    >
      {/* Base Face Circle */}
      <circle cx="50" cy="50" r="48" fill="#ffffff" />

      {/* Variant 1: Beanie (Chill Smiling Face) */}
      {variant === 'beanie' && (
        <>
          <path d="M20 45 C20 18 80 18 80 45 Z" fill="#0f172a" />
          <rect x="18" y="42" width="64" height="12" rx="4" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
          <line x1="38" y1="44" x2="38" y2="52" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
          <line x1="50" y1="44" x2="50" y2="52" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
          <line x1="62" y1="44" x2="62" y2="52" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
          {/* Relaxed curved eyes */}
          <path d="M34 63 Q40 58 46 63" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M54 63 Q60 58 66 63" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* Nose dot */}
          <circle cx="50" cy="69" r="1.5" fill="#0f172a" />
          {/* Sweet Smile */}
          <path d="M42 77 Q50 84 58 77" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </>
      )}

      {/* Variant 2: Glasses (Curly hair + nerd chic spectacles) */}
      {variant === 'glasses' && (
        <>
          <path d="M22 40 C20 20 80 20 78 40 C72 28 28 28 22 40 Z" fill="#0f172a" />
          <circle cx="28" cy="26" r="8" fill="#0f172a" />
          <circle cx="50" cy="20" r="10" fill="#0f172a" />
          <circle cx="72" cy="26" r="8" fill="#0f172a" />
          {/* Glasses */}
          <rect x="27" y="46" width="19" height="16" rx="4" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
          <rect x="54" y="46" width="19" height="16" rx="4" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="46" y1="54" x2="54" y2="54" stroke="#0f172a" strokeWidth="2.5" />
          <circle cx="36.5" cy="54" r="2.5" fill="#0f172a" />
          <circle cx="63.5" cy="54" r="2.5" fill="#0f172a" />
          {/* Nose */}
          <path d="M50 64 L48 68 L52 68" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
          {/* Smile */}
          <path d="M43 76 Q50 82 57 76" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </>
      )}

      {/* Variant 3: Cap (Backwards Snapback Cap + Cheerful Eyes) */}
      {variant === 'cap' && (
        <>
          {/* Cap dome */}
          <path d="M22 46 C22 24 78 24 78 46 Z" fill="#0f172a" />
          {/* Visor turned backward/sideways */}
          <path d="M68 40 C86 38 92 48 84 54 C78 52 74 48 70 44 Z" fill="#0f172a" />
          {/* Front sweatband */}
          <path d="M22 46 Q50 42 78 46 L78 50 Q50 46 22 50 Z" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
          {/* Hair tufts on sides */}
          <path d="M19 50 Q16 60 21 64" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
          {/* Big bright open eyes */}
          <circle cx="36" cy="62" r="3.5" fill="#0f172a" />
          <circle cx="64" cy="62" r="3.5" fill="#0f172a" />
          {/* Cute eyebrows */}
          <path d="M31 55 Q36 52 41 55" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
          <path d="M59 55 Q64 52 69 55" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
          {/* Happy Open Smile */}
          <path d="M40 73 Q50 85 60 73 Z" fill="#0f172a" />
          <path d="M45 77 Q50 80 55 77" fill="#ffffff" />
        </>
      )}

      {/* Variant 4: Afro (Big Fluffy Hair + Wink) */}
      {variant === 'afro' && (
        <>
          {/* Big Fluffy Afro silhouette */}
          <circle cx="28" cy="36" r="14" fill="#0f172a" />
          <circle cx="50" cy="24" r="16" fill="#0f172a" />
          <circle cx="72" cy="36" r="14" fill="#0f172a" />
          <circle cx="20" cy="50" r="12" fill="#0f172a" />
          <circle cx="80" cy="50" r="12" fill="#0f172a" />
          {/* Forehead hair line */}
          <path d="M26 48 Q50 36 74 48 Z" fill="#0f172a" />
          {/* Left Eye: Wink */}
          <path d="M33 63 Q39 58 45 63" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* Right Eye: Big round pupil */}
          <circle cx="63" cy="61" r="3.5" fill="#0f172a" />
          {/* Cheerful blush dashes */}
          <line x1="28" y1="68" x2="34" y2="68" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="66" y1="68" x2="72" y2="68" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
          {/* Warm curved grin */}
          <path d="M43 75 Q50 82 57 75" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </>
      )}

      {/* Variant 5: Headphones (DJ / Gamer Over-Ear Headphones + Confident Grin) */}
      {variant === 'headphones' && (
        <>
          {/* Spiky / Clean hair */}
          <path d="M26 44 C26 22 74 22 74 44 Z" fill="#0f172a" />
          <path d="M36 26 L42 16 L48 26 L56 16 L62 26" stroke="#0f172a" strokeWidth="2.5" strokeLinejoin="round" fill="#0f172a" />
          {/* Headphone Arch */}
          <path d="M16 50 C14 20 86 20 84 50" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          {/* Left Ear Cup */}
          <rect x="12" y="44" width="10" height="22" rx="5" fill="#0f172a" stroke="#0f172a" strokeWidth="1.5" />
          {/* Right Ear Cup */}
          <rect x="78" y="44" width="10" height="22" rx="5" fill="#0f172a" stroke="#0f172a" strokeWidth="1.5" />
          {/* Eyes with cool arched brows */}
          <circle cx="37" cy="58" r="3" fill="#0f172a" />
          <circle cx="63" cy="58" r="3" fill="#0f172a" />
          <path d="M32 52 L42 51" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M58 51 L68 52" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
          {/* Confident side grin */}
          <path d="M44 72 Q52 79 59 70" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </>
      )}
    </svg>
  );
}

// 5. Hand-Drawn Doodle Video Camera Logo for Brand Navigation
export function DoodleLogoIcon({ size = 34, className = '' }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      {/* Hand-drawn soft background bubble */}
      <path
        d="M20 18 C12 18 10 26 10 38 L10 68 C10 82 18 86 32 86 L68 86 C82 86 88 78 88 64 L88 36 C88 22 80 18 64 18 Z"
        fill="#f8fafc"
        stroke="#0f172a"
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Main Doodle Camera Body */}
      <rect
        x="22"
        y="32"
        width="38"
        height="32"
        rx="6"
        fill="#ffffff"
        stroke="#0f172a"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Camera Film Reels / Tapes on top */}
      <circle cx="31" cy="24" r="7" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
      <circle cx="31" cy="24" r="2.5" fill="#0f172a" />
      <circle cx="47" cy="24" r="7" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
      <circle cx="47" cy="24" r="2.5" fill="#0f172a" />

      {/* Funnel / Projection Lens pointing right */}
      <path
        d="M60 41 L76 33 C78 32 80 33 80 36 L80 60 C80 63 78 64 76 63 L60 55 Z"
        fill="#ffffff"
        stroke="#0f172a"
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Cute face on the camera body */}
      <circle cx="34" cy="46" r="2.5" fill="#0f172a" />
      <path d="M44 44 Q48 41 52 44" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M38 53 Q42 58 47 53" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Cheerful Red Recording Dot on top right */}
      <circle cx="70" cy="21" r="4.5" fill="#ef4444" stroke="#0f172a" strokeWidth="2" />
    </svg>
  );
}

// 6. Hand-Drawn Doodle Mobile Phone Icon for PWA Installation Banner
export function DoodleMobileAppIcon({ size = 38, className = '' }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      {/* Hand-drawn soft background bubble */}
      <path
        d="M24 12 C14 12 10 20 10 32 L10 70 C10 82 16 88 28 88 L72 88 C84 88 90 82 90 70 L90 32 C90 20 84 12 72 12 Z"
        fill="#f8fafc"
        stroke="#0f172a"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Main Hand-drawn Phone Body */}
      <rect
        x="28"
        y="18"
        width="44"
        height="64"
        rx="9"
        fill="#ffffff"
        stroke="#0f172a"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Speaker Bar Notch on Top */}
      <line x1="44" y1="24" x2="56" y2="24" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />

      {/* Hand-drawn Inner Screen */}
      <rect
        x="33"
        y="30"
        width="34"
        height="40"
        rx="4"
        fill="#f1f5f9"
        stroke="#0f172a"
        strokeWidth="2.5"
      />

      {/* Cute Doodle Smiley on Screen */}
      <circle cx="43" cy="46" r="2.5" fill="#0f172a" />
      <path d="M53 44 Q57 41 61 44" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M45 56 Q50 61 55 56" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Home Navigation Indicator Bar */}
      <line x1="45" y1="76" x2="55" y2="76" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />

      {/* Doodle Sparkles / Star Burst on Top Right */}
      <path d="M76 16 L80 12 M78 14 L82 14" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// 7. Handcrafted Doodle Pro Crown & Sparkle Badge Icon
export function DoodleProBadgeIcon({ size = 52, className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: size, height: size, flexShrink: 0, ...style }}
    >
      {/* Hand-drawn rounded square / squircle badge container */}
      <path
        d="M26 12 C14 12 10 18 10 30 L10 70 C10 82 14 88 26 88 L74 88 C86 88 90 82 90 70 L90 30 C90 18 86 12 74 12 Z"
        fill="#0f172a"
        stroke="#1e293b"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Hand-drawn Royal Crown with cute doodle points */}
      <path
        d="M26 62 L32 38 L44 50 L50 32 L56 50 L68 38 L74 62 Z"
        fill="#ffffff"
        stroke="#ffffff"
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Crown base band */}
      <path
        d="M25 64 Q50 67 75 64"
        stroke="#0f172a"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Crown Jewels - Cute doodle circles */}
      <circle cx="32" cy="36" r="3" fill="#fbbf24" stroke="#ffffff" strokeWidth="1.5" />
      <circle cx="50" cy="30" r="3.5" fill="#fbbf24" stroke="#ffffff" strokeWidth="1.5" />
      <circle cx="68" cy="36" r="3" fill="#fbbf24" stroke="#ffffff" strokeWidth="1.5" />

      {/* Cute winking doodle face on the crown body */}
      <circle cx="43" cy="54" r="2" fill="#0f172a" />
      <path d="M54 52 Q58 49 61 52" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M47 58 Q50 61 54 58" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Hand-drawn Sparkle bursts around the badge */}
      <path d="M78 20 L84 14 M81 17 L86 17" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="20" cy="22" r="2" fill="#fbbf24" />
      <circle cx="82" cy="74" r="2.5" fill="#fbbf24" />
    </svg>
  );
}


