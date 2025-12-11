import { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import './ScrollReveal.css';

gsap.registerPlugin(ScrollTrigger);

const ScrollReveal = ({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = '',
  textClassName = '',
  rotationEnd = 'bottom bottom',
  wordAnimationEnd = 'bottom bottom',
  wordAnimationStart = 'top using-prop-logic', // Placeholder, logic handled below
  enablePin = false,
  pinDuration = '+=200%' // How long to stay pinned
}) => {
  const containerRef = useRef(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word;
      return (
        <span className="word" key={index}>
          {word}
        </span>
      );
    });
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller = scrollContainerRef && scrollContainerRef.current ? scrollContainerRef.current : window;

    // Kill old triggers
    const triggers = ScrollTrigger.getAll();
    triggers.forEach(t => {
      // Basic check to kill triggers associated with this element if possible, 
      // but getAll() returns all. In a real app we'd track specific instances.
      // For now, rely on cleanup function.
    });

    const wordElements = el.querySelectorAll('.word');

    if (enablePin) {
      // PINNED LOGIC
      // Create a centralized timeline for pinned animation
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          scroller,
          start: 'center center', // Pin when center hits center
          end: pinDuration,       // Stay pinned for this distance
          pin: true,              // Pin the element
          scrub: true,            // Link animation to scroll
          anticipatePin: 1,       // Smooth out pinning initial jank
          // markers: true,       // Debug
        }
      });

      // 1. Rotation (optional)
      if (baseRotation !== 0) {
        tl.fromTo(el,
          { transformOrigin: '0% 50%', rotate: baseRotation },
          { rotate: 0, ease: 'none', duration: 1 }, // Duration relative to timeline
          0 // Start at beginning
        );
      }

      // 2. Word Appearance (Opacity & Blur)
      // Stagger words appearing over the timeline duration (0 to 1)
      tl.fromTo(wordElements,
        { opacity: baseOpacity, filter: enableBlur ? `blur(${blurStrength}px)` : 'none', willChange: 'opacity, filter' },
        {
          opacity: 1,
          filter: 'blur(0px)',
          ease: 'none',
          stagger: 0.1,
          duration: 1
        },
        0
      );

      // 3. Buffer Phase (Hold)
      // Add empty tween to keep it pinned for a while AFTER animation finishes
      // This prevents "cramped" feeling and jarring release
      tl.to({}, { duration: 0.5 });

    } else {
      // ORIGINAL FLOW LOGIC (Non-pinned)
      // Rotation Trigger
      gsap.fromTo(
        el,
        { transformOrigin: '0% 50%', rotate: baseRotation },
        {
          ease: 'none',
          rotate: 0,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: 'top bottom',
            end: rotationEnd,
            scrub: true
          }
        }
      );

      // Word Animation Trigger
      // Resolve start prop if not pinned
      const actualStart = wordAnimationStart === 'top using-prop-logic' ? 'top bottom-=20%' : wordAnimationStart;

      const animProps = { opacity: 1, ease: 'none', stagger: 0.05 };
      if (enableBlur) animProps.filter = 'blur(0px)';

      const initProps = { opacity: baseOpacity, willChange: 'opacity' };
      if (enableBlur) initProps.filter = `blur(${blurStrength}px)`;

      gsap.fromTo(
        wordElements,
        initProps,
        {
          ...animProps,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: actualStart,
            end: wordAnimationEnd,
            scrub: true
          }
        }
      );
    }

    return () => {
      // Proper cleanup of triggers created by this component
      // This brute force kill might be too aggressive if multiple instances exist, 
      // but standard practice usually tracking the trigger instance.
      // Since we use factory methods, the context is usually enough.
      // ScrollTrigger.getAll().forEach(t => t.kill()); 
      // Better:
      ScrollTrigger.getAll().forEach(t => {
        if (t.trigger === el || (t.animation && t.animation.targets && t.animation.targets().includes(el))) {
          t.kill();
        }
      });
      // Also kill timeline if we stored it (we didn't store sidebar ref just let GSAP handle context)
      gsap.killTweensOf(el);
      gsap.killTweensOf(wordElements);
    };
  }, [scrollContainerRef, enableBlur, baseRotation, baseOpacity, rotationEnd, wordAnimationEnd, wordAnimationStart, blurStrength, enablePin, pinDuration]);

  return (
    <h2 ref={containerRef} className={`scroll-reveal ${containerClassName}`}>
      <p className={`scroll-reveal-text ${textClassName}`}>{splitText}</p>
    </h2>
  );
};

export default ScrollReveal;
