import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import styles from './MenuStack.module.css';
import newsletterCover from '../assets/main/shintanjin-baptist-church-bulletin-newletter-cover.webp';

const MenuOverlay = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    // To reset accordion state when menu is closed
    const [activeStep, setActiveStep] = useState("step-1");

    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => setActiveStep("step-1"), 400); // Reset after close animation
        }
    }, [isOpen]);

    const menuData = [
        {
            id: "step-1", num: "01", title: "교회소개",
            links: [
                { text: "인사말·비전", path: "/vision" },
                { text: "예배·오시는 길", path: "/worship" },
                { text: "추억 갤러리", path: "/history" },
                { text: "섬기는 분들", path: "/team" },
            ]
        },
        {
            id: "step-2", num: "02", title: "예배찬양",
            links: [
                { text: "주일예배", path: "https://www.youtube.com/@sbc6312" },
                { text: "찬양대", path: "https://www.youtube.com/@sbc6312" },
                { text: "유튜브 채널", path: "https://www.youtube.com/@sbc6312" }
            ]
        },
        {
            id: "step-3", num: "03", title: "양육훈련",
            links: [
                { text: "새가족 안내", path: "/nurture" },
                { text: "교구 및 소그룹", path: "/nurture" }
            ]
        },
        {
            id: "step-4", num: "04", title: "다음세대",
            singlePagePath: "/nextgen"
        },
        {
            id: "step-5", num: "05", title: "선교전도",
            singlePagePath: "/"
        },
        {
            id: "step-6", num: "06", title: "나눔터",
            links: [
                { text: "교회소식", path: "/" },
                { text: "교우동정", path: "/" },
                { text: "갤러리", path: "/" },
                { text: "사역일정", path: "/" }
            ]
        }
    ];

    const handleLinkClick = (e, path) => {
        e.preventDefault();
        e.stopPropagation();
        if (path.startsWith('http')) {
            window.open(path, '_blank', 'noopener,noreferrer');
        } else {
            navigate(path);
        }
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className={styles.overlayContainer}>
                    <motion.div
                        className={styles.overlayBackground}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={onClose}
                    />

                    <motion.div
                        className={styles.stackContainer}
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {menuData.map((item) => {
                            const isSinglePage = !!item.singlePagePath;

                            return (
                                <React.Fragment key={item.id}>
                                    <input
                                        type="radio"
                                        name="stack"
                                        id={item.id}
                                        className={styles.stackRadio}
                                        checked={!isSinglePage && activeStep === item.id}
                                        onChange={() => !isSinglePage && setActiveStep(item.id)}
                                    />
                                    {isSinglePage ? (
                                        <div
                                            className={styles.stackCard}
                                            onClick={(e) => handleLinkClick(e, item.singlePagePath)}
                                        >
                                            <div className={styles.cardHeader}>
                                                <div className={styles.stepIdentifier}>
                                                    <span className={styles.stepNum}>{item.num}</span>
                                                    <span className={styles.stepTitle}>{item.title}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className={styles.stackCard} htmlFor={item.id}>
                                            <div className={styles.cardHeader}>
                                                <div className={styles.stepIdentifier}>
                                                    <span className={styles.stepNum}>{item.num}</span>
                                                    <span className={styles.stepTitle}>{item.title}</span>
                                                </div>
                                                <div className={styles.statusDot}></div>
                                            </div>
                                            <div className={styles.cardContent}>
                                                <div className={styles.menuList}>
                                                    {item.links.map((link, idx) => (
                                                        <a
                                                            key={idx}
                                                            href={link.path}
                                                            className={styles.menuItem}
                                                            onClick={(e) => handleLinkClick(e, link.path)}
                                                        >
                                                            {link.text}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        </label>
                                    )}
                                </React.Fragment>
                            );
                        })}
                        <a 
                            href="/" 
                            className={styles.imageButton}
                            onClick={(e) => handleLinkClick(e, "/")}
                        >
                            <span className={styles.imageButtonTitle}>주보 보기</span>
                            <span className={`material-symbols-outlined ${styles.imageButtonIcon}`}>arrow_forward</span>
                        </a>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default MenuOverlay;
