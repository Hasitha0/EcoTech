import React from 'react';

export const MagicCard = ({ children, className = '' }) => {
  return (
    <div
      className={`group relative rounded-xl border border-gray-800/50 bg-gradient-to-b from-gray-800/50 to-gray-900/50 p-6 backdrop-blur-xl ${className}`}
      style={{
        boxShadow: '0 0 100px 10px rgba(0, 0, 0, 0.15)',
      }}
    >
      {/* Gradient border */}
      <div
        className="absolute inset-0 rounded-xl bg-gradient-to-b from-green-500/20 via-blue-500/20 to-purple-500/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          maskImage: 'linear-gradient(black, black) padding-box, linear-gradient(black, black)',
          maskComposite: 'exclude',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}; 