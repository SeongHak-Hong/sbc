import React, { useRef, useLayoutEffect, useMemo, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ScrollFadeText = ({ text, style, mobileStyle, className, once = false }) => {
    const sectionRef = useRef(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const splitText = useMemo(() => {
        return text.split(/([ \t\n\r]+)/).map((word, index) => {
            if (word.match(/^[ \t\n\r]+$/)) return word;

            const wordStyle = {
                opacity: 0.1,
                filter: 'blur(10px)',
                display: 'inline-block',
                whiteSpace: 'pre-wrap',
            };

            return (
                <span className="word" key={index} style={wordStyle}>
                    {word}
                </span>
            );
        });
    }, [text]);

    useLayoutEffect(() => {
        const el = sectionRef.current;
        if (!el) return;

        let ctx = gsap.context(() => {
            const wordElements = el.querySelectorAll('.word');
            const staggerAmount = 0.08;
            const textDuration = 0.8;

            ScrollTrigger.create({
                trigger: el,
                start: 'top 70%',
                end: 'bottom 30%',
                once: once, // Native GSAP ScrollTrigger option to only trigger once
                onEnter: () => {
                    gsap.fromTo(wordElements,
                        { opacity: 0.1, filter: 'blur(10px)' },
                        { opacity: 1, filter: 'blur(0px)', stagger: isMobile ? 0 : staggerAmount, duration: textDuration, ease: 'power1.out', overwrite: true }
                    );
                },
                onLeave: () => {
                    if (!once) gsap.to(wordElements, { opacity: 0.1, filter: 'blur(10px)', duration: 0.4, overwrite: true });
                },
                onEnterBack: () => {
                    if (!once) gsap.fromTo(wordElements,
                        { opacity: 0.1, filter: 'blur(10px)' },
                        { opacity: 1, filter: 'blur(0px)', stagger: isMobile ? 0 : staggerAmount, duration: textDuration, ease: 'power1.out', overwrite: true }
                    );
                },
                onLeaveBack: () => {
                    if (!once) gsap.to(wordElements, { opacity: 0.1, filter: 'blur(10px)', duration: 0.4, overwrite: true });
                }
            });

        }, sectionRef);

        return () => ctx.revert();

    }, [isMobile]);

    const activeStyle = isMobile && mobileStyle ? { ...style, ...mobileStyle } : style;

    return (
        <div ref={sectionRef} style={activeStyle} className={className}>
            {splitText}
        </div>
    );
};

export default ScrollFadeText;
