import React from 'react';
import { motion } from 'framer-motion';

const PretendardButton = ({ 
  children, 
  onClick, 
  style, 
  className,
  whileHover = { scale: 1.05 },
  transition = { type: "spring", stiffness: 400, damping: 10 },
  ...props 
}) => {
  return (
    <motion.button
      onClick={onClick}
      className={className}
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
