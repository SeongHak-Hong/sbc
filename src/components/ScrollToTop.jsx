import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const scrollToTarget = () => {
      if (hash) {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          // Adjust offset to account for fixed headers if any (e.g., -80)
          if (window.lenis) {
            window.lenis.scrollTo(element, { immediate: true, offset: -80 });
          } else {
            element.scrollIntoView({ behavior: 'auto' });
          }
          return true;
        }
      }
      return false;
    };

    // Try immediately
    if (!scrollToTarget()) {
      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }
    }
    
    // Try again after a short delay to allow for page render/layout shifts
    setTimeout(() => {
      if (!scrollToTarget()) {
        if (window.lenis) {
          window.lenis.scrollTo(0, { immediate: true });
        } else {
          window.scrollTo(0, 0);
        }
      }
    }, 100);

  }, [pathname, hash]);

  return null;
}
