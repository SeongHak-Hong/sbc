import React, { useRef, useLayoutEffect, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const VerseSection = () => {
    const sectionRef = useRef(null);
    const textRef = useRef(null);

    const verseText = `지금 내가 여러분을 주와 및 그 은혜의 말씀에 부탁하노니 그 말씀이 여러분을 능히 든든히 세우사 거룩하게 하심을 입은 모든 자 가운데 기업이 있게 하시리라\n\n사도행전 20:32`;

    const splitText = useMemo(() => {
        return verseText.split(/(\s+)/).map((word, index) => {
            if (word.match(/^\s+$/)) return word;
            const isCitation = word.includes('사도행전') || word.includes('20:32');
            const wordStyle = {
                opacity: 0.1,
                filter: 'blur(10px)',
                display: 'inline-block',
                fontSize: isCitation ? 'var(--citation-size, 40px)' : 'inherit'
            };

            return (
                <span className="word" key={index} style={wordStyle}>
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
                    start: 'center center', // Pin when section center meets viewport center
                    end: '+=400%',          // Increased pin distance to give room for wave wipe
                    pin: true,              // Pin the ENTIRE section
                    scrub: true,            // Smooth scrubbing
                    anticipatePin: 1,       // Prevent jerky start
                }
            });

            // 1. Text Animation
            // Stagger is 0.1, with ~26 words, this takes ~3.5 units of time
            tl.to(wordElements, {
                opacity: 1,
                filter: 'blur(0px)',
                stagger: 0.1,
                duration: 1,
                ease: 'none'
            });

            // 2. Buffer (Hold phase)
            // Buffer duration matches text animation duration, making text reveal take exactly 50% of the pin
            // The remaining 50% is the hold phase where the wave wipe will happen
            tl.to({}, { duration: 3.5 });

        }, sectionRef); // Scope to section

        return () => ctx.revert(); // Cleanup

    }, []);

    const sectionStyle = {
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10,
        // Ensure background is handled if layers overlap. 
        // Assuming transparent is fine or inheriting global bg.
    };

    const containerStyle = {
        width: '100%',
        maxWidth: '1500px',
        padding: '24px 48px',
        boxSizing: 'border-box'
    };

    const textStyle = {
        fontFamily: 'MemomentKkukkukk, sans-serif',
        fontSize: '64px',
        lineHeight: '140%',
        letterSpacing: '-0.02em',
        color: '#ffffff',
        textAlign: 'center',
        whiteSpace: 'pre-line',
        fontWeight: 'normal'
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
