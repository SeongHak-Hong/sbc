import React, { useRef, useLayoutEffect, useMemo, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const VerseSection = () => {
    const sectionRef = useRef(null);
    const textRef = useRef(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const verseText = isMobile
        ? `“지금 내가 여러분을 주와 및 그 은혜의 말씀에 부탁하노니 그 말씀이 여러분을 능히 든든히 세우사 거룩하게 하심을 입은 모든 자 가운데 기업이 있게 하시리라”\n사도행전\u00A020장\u00A032절`
        : `“지금 내가 여러분을 주와 및 그 은혜의 말씀에 부탁하노니\n그 말씀이 여러분을 능히 든든히 세우사\n거룩하게 하심을 입은 모든 자 가운데 기업이 있게 하시리라”\n사도행전\u00A020장\u00A032절`;

    const splitText = useMemo(() => {
        return verseText.split(/([ \t\n\r]+)/).map((word, index) => {
            if (word.match(/^[ \t\n\r]+$/)) return word;
            const isCitation = word.includes('사도행전');
            
            // Base style for the word
            const wordStyle = {
                opacity: 0.1,
                filter: 'blur(10px)',
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: isCitation ? (isMobile ? '24px' : '40px') : 'inherit',
                marginTop: isCitation ? '40px' : '0',
                color: isCitation ? 'var(--color-text-dark)' : 'inherit',
                fontWeight: isCitation ? 500 : 'inherit'
            };

            return (
                <span className="word" key={index} style={wordStyle}>
                    {isCitation && (
                        <span style={{
                            display: 'inline-block',
                            width: '32px',
                            height: '3px',
                            backgroundColor: 'var(--color-text-dark)',
                            marginRight: '16px', // Gap between line and text
                        }}></span>
                    )}
                    {word}
                </span>
            );
        });
    }, [verseText]);

    useLayoutEffect(() => {
        const el = sectionRef.current;
        if (!el) return;

        // Kill existing ScrollTriggers for this element to be safe during HMR/Updates
        // ScrollTrigger.getAll().forEach(t => { if(t.trigger === el) t.kill() });
        // Better context safety:
        let ctx = gsap.context(() => {
            const wordElements = el.querySelectorAll('.word');

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: el,
                    start: 'center center',
                    end: '+=200%',          // Reduced pin distance so it moves to next section immediately after text reveal
                    pin: true,
                    scrub: true,
                    anticipatePin: 1,
                }
            });

            // Calculate total duration for the stagger animation
            const staggerAmount = 0.1;
            const textDuration = 1;
            const totalDuration = textDuration + staggerAmount * (wordElements.length > 0 ? wordElements.length - 1 : 0);

            // 1. Parallax and Depth Animation for the whole text container
            tl.fromTo(textRef.current, 
                { y: 200, scale: 0.95 }, 
                { y: 0, scale: 1.05, ease: 'none', duration: totalDuration }, 
                0
            );

            // 2. Text Reveal Animation
            tl.to(wordElements, {
                opacity: 1,
                filter: 'blur(0px)',
                stagger: staggerAmount,
                duration: textDuration,
                ease: 'none'
            }, 0);

        }, sectionRef); // Scope to section

        return () => ctx.revert(); // Cleanup

    }, []);

    const sectionStyle = {
        width: '100%',
        minHeight: '100vh',
        padding: '180px 0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10,
        backgroundColor: 'var(--color-background-beige)'
    };

    const containerStyle = {
        width: '100%',
        maxWidth: '1500px',
        padding: isMobile ? '24px 24px' : '24px 48px',
        boxSizing: 'border-box'
    };

    const textStyle = {
        fontFamily: 'LXGWWenKaiMonoKR, sans-serif',
        fontSize: isMobile ? '24px' : '40px',
        lineHeight: '1.6', // 160%
        letterSpacing: '-0.1em', // -10% from design system
        color: 'rgba(var(--color-text-dark-rgb), 0.7)',
        textAlign: 'center',
        whiteSpace: 'pre-line',
        fontWeight: 300 // Light weight
    };

    return (
        <section ref={sectionRef} style={sectionStyle}>
            <div style={containerStyle}>
                <h2 ref={textRef} style={textStyle}>
                    {splitText}
                </h2>
            </div>
        </section>
    );
};

export default VerseSection;
