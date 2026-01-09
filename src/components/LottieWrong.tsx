'use client';

import Lottie from 'lottie-react';
import wrongAnimation from '@/../public/wrong.json';

const LottieWrong = () => (
  <div className="pointer-events-none h-32 w-32">
    <Lottie animationData={wrongAnimation} loop={false} autoplay />
  </div>
);

export default LottieWrong;
