import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, hash, state } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    // 배경 페이지가 있는 팝업 모달 라우팅의 경우 스크롤을 이동하지 않음
    if (state && state.background) {
      return;
    }
    // 뒤로가기(POP) 액션인 경우 브라우저의 기본 스크롤 복원을 따르고 최상단 강제 스크롤 안 함
    if (navType === 'POP') {
      return;
    }
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
