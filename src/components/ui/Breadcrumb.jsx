import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import styles from './Breadcrumb.module.css';

const Breadcrumb = forwardRef(({ 
    text, 
    children, 
    className = '', 
    centered = false,
    asMotion = false,
    ...props 
}, ref) => {
    const combinedClassName = `${styles.breadcrumb} ${centered ? styles.centered : ''} ${className}`.trim();
    
    const content = text || children;
    
    if (asMotion) {
        return (
            <motion.div ref={ref} className={combinedClassName} {...props}>
                {content}
            </motion.div>
        );
    }

    return (
        <div ref={ref} className={combinedClassName} {...props}>
            {content}
        </div>
    );
});

Breadcrumb.displayName = 'Breadcrumb';

export default Breadcrumb;
