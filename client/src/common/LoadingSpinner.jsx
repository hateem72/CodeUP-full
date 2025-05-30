import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="relative flex items-center">
        {/* 3D Gradient Ring */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal via-hover-teal to-teal animate-spin-3d shadow-[0_0_20px_rgba(61,255,162,0.8)]">
          {/* Inner Spinning Border */}
          <div className="absolute inset-3 border-4 border-teal border-t-transparent rounded-full animate-spin-fast"></div>
        </div>

        {/* Orbiting Particles with Trails */}
        <div className="absolute w-32 h-32 animate-orbit">
          <div className="w-3 h-3 bg-teal rounded-full absolute top-0 left-1/2 transform -translate-x-1/2 animate-pulse-trail shadow-[0_0_10px_rgba(61,255,162,0.6)]"></div>
          <div className="w-3 h-3 bg-hover-teal rounded-full absolute bottom-0 left-1/2 transform -translate-x-1/2 animate-pulse-trail delay-200 shadow-[0_0_10px_rgba(61,255,162,0.6)]"></div>
          <div className="w-3 h-3 bg-teal rounded-full absolute left-0 top-1/2 transform -translate-y-1/2 animate-pulse-trail delay-400 shadow-[0_0_10px_rgba(61,255,162,0.6)]"></div>
        </div>

        {/* Morphing Center with Ripple */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 bg-teal rounded-full animate-morph shadow-[0_0_25px_10px_rgba(61,255,162,0.9)] relative">
            {/* Ripple Effect */}
            <div className="absolute inset-0 rounded-full bg-teal opacity-30 animate-ripple"></div>
          </div>
        </div>

        
      </div>
    </div>
  );
};

// Custom animation styles
const spinnerStyles = `
  @keyframes spin-3d {
    0% { transform: rotate(0deg) rotateX(0deg) rotateY(0deg); }
    50% { transform: rotate(180deg) rotateX(10deg) rotateY(10deg); }
    100% { transform: rotate(360deg) rotateX(0deg) rotateY(0deg); }
  }
  @keyframes spin-fast {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes orbit {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes pulse-trail {
    0%, 100% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.4); opacity: 1; }
  }
  @keyframes morph {
    0%, 100% { transform: scale(1) rotate(0deg); border-radius: 50%; }
    25% { transform: scale(1.2) rotate(45deg); border-radius: 40%; }
    50% { transform: scale(1.1) rotate(90deg); border-radius: 50%; }
    75% { transform: scale(1.2) rotate(135deg); border-radius: 40%; }
  }
  @keyframes ripple {
    0% { transform: scale(0); opacity: 0.5; }
    100% { transform: scale(2.5); opacity: 0; }
  }
  @keyframes neon-glow {
    0%, 100% { text-shadow: 0 0 5px rgba(61, 255, 162, 0.8), 0 0 10px rgba(61, 255, 162, 0.6); }
    50% { text-shadow: 0 0 15px rgba(61, 255, 162, 1), 0 0 25px rgba(61, 255, 162, 0.9), 0 0 35px rgba(61, 255, 162, 0.7); }
  }
  @keyframes dots {
    0% { opacity: 0; }
    20% { opacity: 1; content: '.'; }
    40% { opacity: 1; content: '..'; }
    60% { opacity: 1; content: '...'; }
    80% { opacity: 0; content: '..'; }
    100% { opacity: 0; content: '.'; }
  }
  .animate-spin-3d {
    animation: spin-3d 4s infinite linear;
  }
  .animate-spin-fast {
    animation: spin-fast 1.5s infinite linear;
  }
  .animate-orbit {
    animation: orbit 2.5s infinite linear;
  }
  .animate-pulse-trail {
    animation: pulse-trail 1s infinite;
  }
  .animate-morph {
    animation: morph 3s infinite ease-in-out;
  }
  .animate-ripple {
    animation: ripple 1.5s infinite ease-out;
  }
  .animate-neon-glow {
    animation: neon-glow 2s infinite ease-in-out;
  }
  .animate-dots::after {
    content: '...';
    animation: dots 2s infinite steps(1);
  }
  .delay-200 {
    animation-delay: 0.2s;
  }
  .delay-400 {
    animation-delay: 0.4s;
  }
`;

// Inject styles into the document
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = spinnerStyles;
  document.head.appendChild(styleSheet);
}

export default LoadingSpinner;