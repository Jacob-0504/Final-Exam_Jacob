import React, { useEffect } from 'react';
import { GameEngine } from './components/GameEngine';
import './WlqwndStyles.css';

function Wlqwnd() {
  useEffect(() => {
    // Save original styles
    const originalBg = document.body.style.backgroundColor;
    const originalColor = document.body.style.color;
    const originalOverflow = document.body.style.overflow;

    // Apply Wlqwnd-specific body styles
    document.body.style.backgroundColor = '#050505';
    document.body.style.color = 'white';
    document.body.style.overflow = 'hidden';

    // Restore on unmount
    return () => {
      document.body.style.backgroundColor = originalBg;
      document.body.style.color = originalColor;
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <>
      <div className="scanlines"></div>
      <GameEngine />
    </>
  );
}

export default Wlqwnd;