import { useEffect, useRef } from 'react';

// 히어로 양옆 갈대: 밑동은 고정하고 위로 갈수록 크게 휘게 그린다 (그림을 가로줄로 잘라 줄마다 옆으로 민다).
// 평소엔 잔잔히 흔들리고, 마우스(휴대폰은 스크롤)를 움직이면 그 방향으로 더 휘었다가 천천히 돌아온다.
const STRIP = 4;

const draw = (ctx, reeds, W, H, time, wind) => {
    ctx.clearRect(0, 0, W, H);
    reeds.forEach((r) => {
        if (!r.img?.complete || !r.img.naturalWidth) return;
        const h = H * (W < 768 ? r.hPhone : r.h);
        const w = h * (r.img.naturalWidth / r.img.naturalHeight);
        const x = W * r.x - w / 2;
        const top = H - h * 0.88; // 밑동의 옅은 땅 자국은 화면 아래로 내린다
        const scaleY = r.img.naturalHeight / h;
        for (let y = 0; y < h; y += STRIP) {
            const lift = 1 - y / h; // 아래 0, 위 1
            const bend = lift * lift;
            const sway = Math.sin(time * r.speed + r.phase + lift * 1.6) * r.amp + Math.sin(time * r.speed * 2.3 + r.phase) * r.amp * 0.3;
            const dx = (sway + wind * r.gain) * bend;
            ctx.drawImage(r.img, 0, y * scaleY, r.img.naturalWidth, (STRIP + 1) * scaleY, x + dx, top + y, w, STRIP + 1);
        }
    });
};

const ReedSway = ({ reeds, className, reduceMotion }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let W = 0;
        let H = 0;
        let raf = 0;
        let visible = true;
        let wind = 0;
        let windV = 0;
        let lastX = null;
        let lastY = window.scrollY;
        let lastT = performance.now();
        let stopped = false;

        const list = reeds.map((r) => ({ ...r, img: new Image() }));

        const paint = (t) => draw(ctx, list, W, H, t, wind);

        const resize = () => {
            const box = canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, box.width < 768 ? 1.5 : 1.25);
            W = box.width;
            H = box.height;
            canvas.width = Math.round(W * dpr);
            canvas.height = Math.round(H * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            if (reduceMotion) paint(0);
        };

        const frame = (now) => {
            if (stopped) return;
            const dt = Math.min(0.05, (now - lastT) / 1000);
            lastT = now;
            // 용수철: 힘이 사라지면 몇 번 흔들리다 제자리로
            windV += (-wind * 30 - windV * 3.2) * dt;
            wind += windV * dt;
            paint(now / 1000);
            raf = visible ? requestAnimationFrame(frame) : 0;
        };
        const start = () => { if (!raf && !reduceMotion) { lastT = performance.now(); raf = requestAnimationFrame(frame); } };

        const push = (v) => { windV = Math.max(-420, Math.min(420, windV + v)); };
        const onPointer = (e) => {
            if (e.pointerType === 'touch') return;
            if (lastX !== null) push((e.clientX - lastX) * 2.2);
            lastX = e.clientX;
        };
        const onScroll = () => {
            const y = window.scrollY;
            push((y - lastY) * 0.5);
            lastY = y;
        };

        let waiting = list.length;
        list.forEach((r, i) => {
            r.img.onload = r.img.onerror = () => {
                waiting -= 1;
                if (reduceMotion && waiting === 0) paint(0);
            };
            r.img.src = reeds[i].src;
        });

        const ro = new ResizeObserver(resize);
        ro.observe(canvas);
        resize();
        const io = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible) start();
        });
        io.observe(canvas);

        if (!reduceMotion) {
            window.addEventListener('pointermove', onPointer, { passive: true });
            window.addEventListener('scroll', onScroll, { passive: true });
            start();
        }
        return () => {
            stopped = true;
            cancelAnimationFrame(raf);
            ro.disconnect();
            io.disconnect();
            window.removeEventListener('pointermove', onPointer);
            window.removeEventListener('scroll', onScroll);
        };
    }, [reeds, reduceMotion]);

    return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
};

export default ReedSway;
