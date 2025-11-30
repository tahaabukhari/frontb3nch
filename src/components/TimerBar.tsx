'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TimerBarProps {
  duration: number;
  instanceKey: number;
  onExpire: () => void;
}

const TimerBar = ({ duration, instanceKey, onExpire }: TimerBarProps) => {
  const [percent, setPercent] = useState(100);

  useEffect(() => {
    let frame: number;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      const remaining = Math.max(duration - elapsed, 0);
      setPercent((remaining / duration) * 100);
      if (remaining <= 0) {
        onExpire();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    // The percent state and useEffect for manual ticking are no longer needed
    // as the motion.div's animation handles the countdown visually.

    const handleExpire = () => {
      onExpire();
    };

    // The useEffect is now only needed to reset the component if instanceKey or duration changes,
    // but the animation itself is driven by the 'duration' prop in the transition.
    // For a simple reset, we can rely on the key prop passed to the component itself.
    // If the component is re-rendered with a new 'key' (e.g., instanceKey),
    // the animation will restart.
    // So, the useEffect can be removed entirely if the parent component handles key changes.
    // For now, let's keep it minimal and remove the manual ticking logic.
    // The `instanceKey` prop is typically used as the `key` for the component itself
    // to force re-mounting and restart animations.

    return (
      <div className="overflow-hidden rounded-full border-2 border-summit/30 bg-white shadow-md">
        <motion.div
          className="h-4 bg-gradient-summit"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration, ease: 'linear' }}
          onAnimationComplete={handleExpire}
        />
      </div>
    );
  };

  export default TimerBar;
