import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface LottieAnimationProps {
  src: string;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({
  src,
  loop = true,
  autoplay = true,
  className,
  style,
}) => {
  return (
    <DotLottieReact
      src={src}
      loop={loop}
      autoplay={autoplay}
      className={className}
      style={style}
    />
  );
};

export default LottieAnimation; 