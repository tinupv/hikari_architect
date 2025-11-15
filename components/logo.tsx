
import React from 'react';

export const Logo = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 200 140"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
    aria-labelledby="logoTitle logoDesc"
  >
    <title id="logoTitle">Hikari Render Studio Logo</title>
    <desc id="logoDesc">An abstract geometric house shape in a square.</desc>
    
    <g fill="none" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
      {/* Main Box Structure */}
      <path d="M 40 10 L 160 10 L 160 130 L 40 130 Z" stroke="currentColor" strokeOpacity="0.8" />
      
      {/* Roof Line */}
      <path d="M 40 60 L 100 10 L 160 60" stroke="currentColor" strokeOpacity="0.8" />
      
      {/* Internal Wall */}
      <path d="M 100 130 L 100 60" stroke="currentColor" strokeOpacity="0.8" />
      
      {/* Accent Square */}
      <rect x="108" y="78" width="32" height="32" fill="#14b8a6" stroke="none" />
    </g>
  </svg>
);
