import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import styles from './PretendardButton.module.css';

const PretendardButton = ({ 
  children, 
  onClick, 
  style, 
  className,
  whileHover,
  transition,
  onMouseEnter,
  onMouseLeave,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isAnimating = useRef(false);
  const targetHoverState = useRef(false);
  const currentHoverState = useRef(false);

  const processHoverState = () => {
    if (isAnimating.current) return;
    if (currentHoverState.current === targetHoverState.current) return;

    const newHoverState = targetHoverState.current;
    currentHoverState.current = newHoverState;
    setIsHovered(newHoverState);
    
    isAnimating.current = true;
    setTimeout(() => {
      isAnimating.current = false;
      processHoverState();
    }, 400); // Matches the 0.4s CSS transition
  };

  const handleMouseEnter = (e) => {
    targetHoverState.current = true;
    processHoverState();
    if (onMouseEnter) onMouseEnter(e);
  };

  const handleMouseLeave = (e) => {
    targetHoverState.current = false;
    processHoverState();
    if (onMouseLeave) onMouseLeave(e);
  };

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`${styles.animatedButton} ${isHovered ? styles.hoverActive : ''} ${className || ''}`}
      style={style}
      whileHover={whileHover}
      transition={transition}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default PretendardButton;
