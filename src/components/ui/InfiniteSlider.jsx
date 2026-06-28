import { cn } from '../../lib/utils';
import { useMotionValue, animate, motion, useTransform } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import useMeasure from 'react-use-measure';

export function InfiniteSlider({
  children,
  gap = 16,
  duration = 25,
  durationOnHover,
  direction = 'horizontal',
  reverse = false,
  className,
}) {
  const controlsRef = React.useRef(null);
  const [ref, { width, height }] = useMeasure();
  const translation = useMotionValue(0);

  useEffect(() => {
    controlsRef.current = animate(translation, [0, -50], {
      type: 'tween',
      ease: 'linear',
      duration: duration,
      repeat: Infinity,
      repeatType: 'loop',
      repeatDelay: 0,
    });

    return () => controlsRef.current?.stop();
  }, [duration, translation]);

  const hoverProps = durationOnHover
    ? {
      onHoverStart: () => {
        if (controlsRef.current) {
          controlsRef.current.speed = duration / durationOnHover;
        }
      },
      onHoverEnd: () => {
        if (controlsRef.current) {
          controlsRef.current.speed = 1;
        }
      },
    }
    : {};

  return (
    <div className={className} style={{ width: '100%' }}>
      <motion.div
        style={{
          display: 'flex',
          width: 'max-content',
          x: useTransform(translation, (value) => `${value}%`),
        }}
        ref={ref}
        {...hoverProps}
      >
        {[...Array(4)].map((_, i) => (
          <div
            key={`set-${i}`}
            style={{
              display: 'flex',
              gap: `${gap}px`,
              marginRight: `${gap}px`,
              flexDirection: direction === 'horizontal' ? 'row' : 'column'
            }}
          >
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
