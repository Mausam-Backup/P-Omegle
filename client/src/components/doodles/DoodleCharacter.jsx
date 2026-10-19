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

// 4. Compact B&W Avatar Heads for pill badges & profile selection
export function DoodleAvatarHead({ seed = 'stranger', size = 26 }) {
  const isSelf = seed === 'you' || seed === 'self';
  
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: size, height: size, borderRadius: '50%', background: '#ffffff', border: '1.5px solid #0f172a' }}
    >
      {/* Head */}
      <circle cx="50" cy="50" r="48" fill="#ffffff" />

      {isSelf ? (
        // Self: Beanie & chill eyes
        <>
          <path d="M20 45 C20 18 80 18 80 45 Z" fill="#0f172a" />
          <rect x="18" y="42" width="64" height="12" rx="4" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
          {/* Eyes */}
          <path d="M36 62 Q41 58 46 62" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M54 62 Q59 58 64 62" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* Smile */}
          <path d="M44 76 Q50 82 56 76" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </>
      ) : (
        // Stranger: Glasses & curly hair
        <>
          <path d="M22 40 C20 20 80 20 78 40 C72 28 28 28 22 40 Z" fill="#0f172a" />
          <circle cx="28" cy="26" r="8" fill="#0f172a" />
          <circle cx="50" cy="20" r="10" fill="#0f172a" />
          <circle cx="72" cy="26" r="8" fill="#0f172a" />
          {/* Glasses */}
          <rect x="28" y="46" width="18" height="15" rx="4" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
          <rect x="54" y="46" width="18" height="15" rx="4" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="46" y1="53" x2="54" y2="53" stroke="#0f172a" strokeWidth="2.5" />
          <circle cx="37" cy="53" r="2.5" fill="#0f172a" />
          <circle cx="63" cy="53" r="2.5" fill="#0f172a" />
          {/* Smile */}
          <path d="M43 74 Q50 80 57 74" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
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
