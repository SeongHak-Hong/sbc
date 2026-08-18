import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import styles from './LargeButton.module.css';

const LargeButton = ({ 
  children, 
  onClick, 
  style, 
  className,
  ...props 
}) => {
  return (
    <button
      onClick={onClick}
      className={`${styles.animatedButton} ${className || ''}`}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
};

export default LargeButton;
