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
  const [currentDuration, setCurrentDuration] = useState(duration);
  const [ref, { width, height }] = useMeasure();
  const translation = useMotionValue(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const controls = animate(translation, [0, -50], {
      type: 'tween',
      ease: 'linear',
      duration: currentDuration,
      repeat: Infinity,
      repeatType: 'loop',
      repeatDelay: 0,
      onUpdate: (latest) => {
        // Framer motion value is 0 to -50.
        // We apply it as percentage string in style
      }
    });

    return controls.stop;
  }, [currentDuration, translation]);

  const hoverProps = durationOnHover
    ? {
      onHoverStart: () => {
        setIsTransitioning(true);
        setCurrentDuration(durationOnHover);
      },
      onHoverEnd: () => {
        setIsTransitioning(true);
        setCurrentDuration(duration);
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
