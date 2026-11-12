import { useEffect, useState } from 'react';

// 가로 슬라이드처럼 옆 칸이 화면 밖에 있는 사진들을 위한 도구.
// 슬라이드가 세로로 화면 가까이 오면 true 가 되어, 그때 옆 칸 사진까지 한꺼번에 받는다.
// (처음부터 다 받으면 느린 회선에서 첫 화면 사진이 늦어지고, lazy 로만 두면 옆 칸이 밀 때마다 회색으로 보인다)
// 쓰는 법: const near = useNearViewport(railRef);  <img loading={near ? 'eager' : 'lazy'} />
export default function useNearViewport(ref, rootMargin = '300px 0px') {
    const [near, setNear] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el || near) return undefined;
        const io = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            setNear(true);
            io.disconnect();
        }, { rootMargin });
        io.observe(el);
        return () => io.disconnect();
    }, [ref, near, rootMargin]);

    return near;
}
