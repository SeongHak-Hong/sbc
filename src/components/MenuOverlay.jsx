import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MenuOverlay = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    const menuItems = [
        { text: "1. 교회소개", path: "/vision" },
        { text: "2. 예배찬양", path: "https://www.youtube.com/@sbc6312" },
        { text: "3. 양육훈련", path: "/nurture" },
        { text: "4. 다음세대", path: "/nextgen" },
        { text: "5. 선교전도", path: "/" },
        { text: "6. 나눔터", path: "/" }
    ];

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        backgroundColor: 'rgba(0, 83, 148, 0.95)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        zIndex: 90, // Ensure it's behind the Header (zIndex: 100)
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#fff',
    };

    const listStyle = {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '48px'
    };

    const itemStyle = {
        fontFamily: "var(--font-title)",
        fontSize: '64px',
        cursor: 'pointer',
        margin: 0,
        textShadow: '0 4px 12px rgba(0,0,0,0.1)'
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    style={overlayStyle}
                    initial={{ opacity: 0, y: '-10%' }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: '-10%' }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                    <ul style={listStyle}>
                        {menuItems.map((item, idx) => {
                            // Split index and text if needed, but we can just show the whole string
                            const cleanText = item.text.replace(/^\d+\.\s*/, '');
                            
                            return (
                                <motion.li 
                                    key={idx} 
                                    style={itemStyle}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ delay: 0.1 + idx * 0.05, duration: 0.4, ease: "easeOut" }}
                                    whileHover={{ scale: 1.05, color: '#E0F7FA' }}
                                    onClick={() => {
                                        if (item.path.startsWith('http')) {
                                            window.open(item.path, '_blank', 'noopener,noreferrer');
                                        } else {
                                            navigate(item.path);
                                        }
                                        onClose();
                                    }}
                                >
                                    {cleanText}
                                </motion.li>
                            );
                        })}
                    </ul>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MenuOverlay;
