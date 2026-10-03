import React, { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber';
import { Clouds, Cloud, useTexture } from '@react-three/drei';
import { useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
// Higgsfield로 만든 사진풍 구름을 투명 배경으로 가공한 텍스처 (tools/key-cloud-photo.mjs로 재생성)
import cloudTextureUrl from './textures/cloud.png';
import churchTextureUrl from './textures/church.png';
import { buildLayout } from './cloudLayout';

// 텍스처별 조명. three.js 조명은 물리 단위라 합이 약 π(3.14)는 되어야 흰 구름이 회색으로 죽지 않음
// 스프라이트는 늘 카메라를 향하므로 조명은 조각 전체에 고르게 들고, 입체감은 텍스처의 그늘에서 나온다.
const TEXTURES = {
    photo: {
        label: '사진풍 (Higgsfield)',
        url: cloudTextureUrl,
        // drei 텍스처와 구조·밝기가 같아(색은 거의 흰색, 디테일은 투명도) 조명도 같은 값. 1.9로 낮추면 회색으로 탁해짐
        light: { ambient: 2.2, hemi: 0.9, dir: 1.4 },
    },
    // drei 기본 텍스처는 라이선스가 명시되지 않아 운영 사이트에는 쓰지 않는다 (시안 비교 전용)
    drei: {
        label: 'drei 기본 (비교용)',
        url: 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@9225a9f1fbd449d9411125c2f419b843d0308c9f/cloud.png',
        light: { ambient: 2.2, hemi: 0.9, dir: 1.4 },
    },
};
// 주소로 바로 열기: ?tex=drei (drei 텍스처만), ?compare=1 (왼쪽 사진풍 | 오른쪽 drei 나란히)
const params = new URLSearchParams(window.location.search);
const initialTexture = () => (TEXTURES[params.get('tex')] ? params.get('tex') : 'photo');
const initialCompare = () => params.get('compare') === '1';
// ?light=1: 교회 빛 켜고 보기. 기본은 끔 (판 이미지에 그린 빛이 어색해서 3D 모델을 받기 전까지 꺼 둠)
const initialChurchLight = () => params.get('light') === '1';

gsap.registerPlugin(ScrollTrigger);

const EASE = 'power2.inOut';

// 카메라 경로: 구름 터널 입구(0) → 구름 사이를 앞으로 통과 → 탁 트인 구름 바다 위(1)
const PATH = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.5, 34),
    new THREE.Vector3(-1.2, 0.2, 14),
    new THREE.Vector3(1.0, 0.8, -6),
    new THREE.Vector3(0, 2.2, -22),
]);
const LOOK_END = new THREE.Vector3(0, 1.2, -60);
const FOV_START = 46;
const FOV_END = 66; // 앞으로 나아가며 화각을 넓혀 '빨려 들어가는' 느낌

const easeInOut = (t) => t * t * (3 - 2 * t);

function CameraRig({ progress, reduceMotion }) {
    const pos = useRef(new THREE.Vector3());
    const ahead = useRef(new THREE.Vector3());
    const look = useRef(new THREE.Vector3());

    useFrame((state, delta) => {
        const p = reduceMotion ? 1 : easeInOut(progress.current);
        const cam = state.camera;
        PATH.getPointAt(p, pos.current);
        // 진행 방향을 바라보다가, 끝에서는 구름 바다 너머 지평선을 봄
        PATH.getPointAt(Math.min(p + 0.08, 1), ahead.current);
        ahead.current.z -= 6;
        look.current.lerpVectors(ahead.current, LOOK_END, THREE.MathUtils.smoothstep(p, 0.7, 1));

        if (!reduceMotion) pos.current.y += Math.sin(state.clock.elapsedTime * 0.3) * 0.08;
        cam.position.x = THREE.MathUtils.damp(cam.position.x, pos.current.x, 4, delta);
        cam.position.y = THREE.MathUtils.damp(cam.position.y, pos.current.y, 4, delta);
        cam.position.z = THREE.MathUtils.damp(cam.position.z, pos.current.z, 4, delta);
        cam.lookAt(look.current);

        const fov = THREE.MathUtils.lerp(FOV_START, FOV_END, Math.sin(p * Math.PI) * 0.6 + p * 0.4);
        if (Math.abs(cam.fov - fov) > 0.01) {
            cam.fov = THREE.MathUtils.damp(cam.fov, fov, 4, delta);
            cam.updateProjectionMatrix();
        }
    });
    return null;
}

// 교회: Higgsfield로 다시 그린 실제 건물 이미지를 판으로 세움 (tools/prep-church.mjs로 색·빛·아래쪽을 맞춘 텍스처)
// 카메라가 거의 정면에서만 보므로 3D 모델 대신 판으로 충분하고, 앞뒤 구름과 안개가 깊이를 만든다.
// 깊이는 건물이 꽉 찬 곳에만 기록한다. 반투명한 아래쪽까지 기록하면 뒤쪽 구름이 판 높이에서 일자로 잘려 보인다.
// 그래서 깊이만 쓰는 판(진한 곳만)과 색만 쓰는 판을 겹쳐 그린다. 둘 다 구름보다 먼저 그려 앞쪽 구름이 위에 겹친다.
const CHURCH_HEIGHT = 11;
const CHURCH_POSITION = [0, 2.6, -48];
// 도착할 때 교회에 빛이 드는 구간 (스크롤 진행률)
const CHURCH_LIGHT_FROM = 0.7;
const CHURCH_LIGHT_TO = 0.97;

// 교회 빛 (판 이미지라 조명이 고르게만 들어서 셰이더로 직접 그림). 빛은 장면 조명과 같은 오른쪽 위에서 온다.
//   - uLight 0→1: 빛의 앞머리가 오른쪽 위에서 왼쪽 아래로 정면을 쓸고 지나가고, 지나간 곳은 따뜻하게 밝아진 채 머문다
//   - 앞머리의 밝은 띠는 지나가는 동안만 보이고 도착하면 사라진다
//   - 빛을 향한 윤곽(탑·지붕·날개의 오른쪽 위 모서리)에 얇은 테두리, 금색 십자가에 은은한 반짝임
const CHURCH_LIGHT_GLSL = /* glsl */ `
    vec3 base = diffuseColor.rgb;
    vec3 warm = vec3(1.0, 0.9, 0.74);
    float along = ((1.0 - vMapUv.x) * 0.55 + (1.0 - vMapUv.y) * 0.85) / 1.4; // 0 = 오른쪽 위, 1 = 왼쪽 아래
    float front = mix(-0.15, 1.3, uLight);
    float lit = 1.0 - smoothstep(front - 0.3, front, along);
    float sweep = exp(-pow((along - front + 0.06) / 0.07, 2.0)) * (1.0 - smoothstep(0.8, 1.0, uLight));
    // 전체를 고르게 밝히면 바래 보이기만 해서, 빛 받는 오른쪽 위만 따뜻하게 밝히고 반대쪽은 살짝 그늘지게 (밝고 어두운 차이가 빛으로 읽힘)
    float toLight = pow(1.0 - along, 1.6);
    vec3 c = 1.0 - (1.0 - base) * (1.0 - warm * lit * (0.04 + 0.34 * toLight));
    c *= 1.0 - 0.1 * uLight * smoothstep(0.45, 1.0, along);
    c += warm * sweep * 0.16;
    float toward = texture2D(map, vMapUv + vec2(0.005, 0.005)).a;
    c += warm * clamp(diffuseColor.a - toward, 0.0, 1.0) * lit * 0.4;
    float gold = smoothstep(0.7, 0.82, base.g / max(base.r, 0.001)) * smoothstep(0.08, 0.2, base.r - base.b) * smoothstep(0.3, 0.5, base.r);
    // 반짝임은 금색으로 더해야 십자가가 하얗게 바래지 않는다
    c += vec3(1.0, 0.78, 0.4) * gold * (lit * (0.08 + 0.07 * sin(uTime * 1.3 + vMapUv.y * 14.0)) + sweep * 0.3);
    diffuseColor.rgb = c;
`;

function Church({ progress, reduceMotion, lightOn }) {
    const map = useTexture(churchTextureUrl);
    const { width, height } = map.image;
    const size = [(CHURCH_HEIGHT * width) / height, CHURCH_HEIGHT];
    const uniforms = useRef({ uLight: { value: 0 }, uTime: { value: 0 } });

    const material = useMemo(() => {
        const m = new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, fog: true, toneMapped: false });
        m.onBeforeCompile = (shader) => {
            Object.assign(shader.uniforms, uniforms.current);
            shader.fragmentShader = `uniform float uLight;\nuniform float uTime;\n${shader.fragmentShader}`
                .replace('#include <map_fragment>', `#include <map_fragment>\n${CHURCH_LIGHT_GLSL}`);
        };
        m.customProgramCacheKey = () => 'church-light';
        return m;
    }, [map]);
    useEffect(() => () => material.dispose(), [material]);

    useFrame((state) => {
        const u = uniforms.current;
        const target = !lightOn ? 0 : reduceMotion ? 1 : THREE.MathUtils.smoothstep(progress.current, CHURCH_LIGHT_FROM, CHURCH_LIGHT_TO);
        u.uLight.value = target;
        u.uTime.value = reduceMotion ? 0 : state.clock.elapsedTime;
    });

    return (
        <group position={CHURCH_POSITION}>
            <mesh renderOrder={-2}>
                <planeGeometry args={size} />
                <meshBasicMaterial map={map} alphaTest={0.6} colorWrite={false} />
            </mesh>
            <mesh renderOrder={-1} material={material}>
                <planeGeometry args={size} />
            </mesh>
        </group>
    );
}

// 안개·조명·교회 자리·구름. 비교 모드에서는 텍스처만 바꿔 두 번 그린다
function SceneContent({ texture, isMobile, reduceMotion, progress, churchLight }) {
    const layout = useMemo(() => buildLayout(isMobile), [isMobile]);
    const { light } = texture;

    return (
        <>
            {/* 안개색 = 하늘 지평선 색 (style.css .stage). 먼 구름이 하늘에 녹아들게 */}
            <fog attach="fog" args={['#EDF6FC', 18, 85]} />
            {/* 그늘은 옅은 하늘빛 */}
            <ambientLight intensity={light.ambient} />
            <hemisphereLight args={['#FFFFFF', '#C5DAE9', light.hemi]} />
            <directionalLight position={[6, 14, 4]} intensity={light.dir} color="#FFF8F2" />
            <Church progress={progress} reduceMotion={reduceMotion} lightOn={churchLight} />
            <Clouds texture={texture.url} limit={isMobile ? 500 : 1100} material={THREE.MeshLambertMaterial}>
                {layout.map((c) => (
                    <Cloud
                        key={c.key}
                        position={c.position}
                        bounds={c.bounds}
                        segments={c.segments}
                        volume={c.volume}
                        distribute={c.distribute}
                        color="#ffffff"
                        fade={12} /* 가까이 온 조각은 투명하게 → 둥근 윤곽 대신 안개를 지나가는 느낌 */
                        speed={reduceMotion ? 0 : 0.04}
                        growth={1.2}
                        opacity={c.opacity}
                    />
                ))}
            </Clouds>
        </>
    );
}

// 시안 전용: 같은 카메라로 두 장면을 그려 화면 왼쪽·오른쪽에 나눠 보여준다 (구도가 완전히 같아 텍스처 차이만 보임)
function SplitScenes({ left, right, splitRef, isMobile, reduceMotion, progress, churchLight }) {
    const scenes = useMemo(() => [new THREE.Scene(), new THREE.Scene()], []);
    const get = useThree((s) => s.get);

    // 비교 모드를 끄면 R3F 기본 렌더링이 다시 화면 전체를 지우고 그리도록 되돌림
    useEffect(() => () => {
        const { gl } = get();
        gl.autoClear = true;
        gl.setScissorTest(false);
    }, [get]);

    // priority 1: R3F 기본 렌더링 대신 직접 그림 (구름 정렬 등 priority 0 작업이 끝난 뒤)
    useFrame(({ gl, camera, size }) => {
        const x = Math.round(size.width * splitRef.current);
        gl.autoClear = false;
        gl.setScissorTest(true);
        gl.setScissor(0, 0, x, size.height);
        gl.clear();
        gl.render(scenes[0], camera);
        gl.setScissor(x, 0, size.width - x, size.height);
        gl.clear();
        gl.render(scenes[1], camera);
        gl.setScissorTest(false);
    }, 1);

    return (
        <>
            {createPortal(<SceneContent texture={left} isMobile={isMobile} reduceMotion={reduceMotion} progress={progress} churchLight={churchLight} />, scenes[0])}
            {createPortal(<SceneContent texture={right} isMobile={isMobile} reduceMotion={reduceMotion} progress={progress} churchLight={churchLight} />, scenes[1])}
        </>
    );
}

function Scene({ progress, reduceMotion, onReady, texKey, compare, splitRef, churchLight }) {
    const { size } = useThree();
    const isMobile = size.width < 768;

    useEffect(() => { onReady(); }, [onReady]);

    return (
        <>
            {compare ? (
                <SplitScenes left={TEXTURES.photo} right={TEXTURES.drei} splitRef={splitRef} isMobile={isMobile} reduceMotion={reduceMotion} progress={progress} churchLight={churchLight} />
            ) : (
                <SceneContent texture={TEXTURES[texKey]} isMobile={isMobile} reduceMotion={reduceMotion} progress={progress} churchLight={churchLight} />
            )}
            <CameraRig progress={progress} reduceMotion={reduceMotion} />
        </>
    );
}

// 시안 전용: 비교 모드의 가운데 경계선. 끌거나 좌우 방향키로 옮긴다
function SplitDivider({ value, onChange }) {
    const dragging = useRef(false);
    const move = (clientX) => {
        const v = Math.min(0.95, Math.max(0.05, clientX / window.innerWidth));
        onChange(v);
    };
    return (
        <div
            className="splitDivider"
            style={{ left: `${value * 100}%` }}
            role="separator"
            aria-orientation="vertical"
            aria-label="비교 경계선"
            aria-valuemin={5}
            aria-valuemax={95}
            aria-valuenow={Math.round(value * 100)}
            tabIndex={0}
            onPointerDown={(e) => {
                dragging.current = true;
                e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => { if (dragging.current) move(e.clientX); }}
            onPointerUp={() => { dragging.current = false; }}
            onKeyDown={(e) => {
                const step = e.key === 'ArrowLeft' ? -0.05 : e.key === 'ArrowRight' ? 0.05 : 0;
                if (step) {
                    e.preventDefault();
                    move((value + step) * window.innerWidth);
                }
            }}
        >
            <span />
        </div>
    );
}


export default function HeroClouds() {
    const reduceMotion = useReducedMotion();
    const progress = useRef(0);
    const journeyRef = useRef(null);
    const [ready, setReady] = useState(false);
    const [texKey, setTexKey] = useState(initialTexture);
    const [compare, setCompare] = useState(initialCompare);
    const splitRef = useRef(0.5);
    const [splitValue, setSplitValue] = useState(0.5);
    const [churchLight, setChurchLight] = useState(initialChurchLight);

    const syncUrl = (key, isCompare) => {
        const url = new URL(window.location.href);
        if (key === 'photo') url.searchParams.delete('tex');
        else url.searchParams.set('tex', key);
        if (isCompare) url.searchParams.set('compare', '1');
        else url.searchParams.delete('compare');
        window.history.replaceState(null, '', url);
    };
    const switchTexture = (key) => {
        setTexKey(key);
        setCompare(false);
        syncUrl(key, false);
    };
    const moveSplit = (v) => {
        splitRef.current = v; // 캔버스는 매 프레임 ref를 읽고, 경계선 위치는 state로 그림
        setSplitValue(v);
    };
    const toggleCompare = () => {
        setCompare(!compare);
        syncUrl(texKey, !compare);
    };
    const toggleChurchLight = () => {
        const url = new URL(window.location.href);
        if (churchLight) url.searchParams.delete('light');
        else url.searchParams.set('light', '1');
        window.history.replaceState(null, '', url);
        setChurchLight(!churchLight);
    };
    const onReady = useMemo(() => () => setReady(true), []);

    // Lenis + ScrollTrigger: 한 타임라인으로 카메라 진행률과 텍스트를 함께 스크럽
    useLayoutEffect(() => {
        if (reduceMotion) return undefined;
        const lenis = new Lenis();
        const raf = (t) => lenis.raf(t * 1000);
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(0);

        const ctx = gsap.context(() => {
            const proxy = { p: 0 };
            const tl = gsap.timeline({
                defaults: { ease: EASE },
                scrollTrigger: { trigger: journeyRef.current, start: 'top top', end: 'bottom bottom', scrub: true },
            });
            tl.to(proxy, { p: 1, duration: 1, ease: 'none', onUpdate: () => { progress.current = proxy.p; } }, 0)
                .to('[data-step="1"]', { opacity: 0, y: -40, filter: 'blur(8px)', duration: 0.2 }, 0.06)
                .fromTo('[data-step="2"]', { opacity: 0, y: 24, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.25 }, 0.74)
                .to('[data-cue]', { opacity: 0, duration: 0.1 }, 0);
        }, journeyRef);

        return () => {
            ctx.revert();
            gsap.ticker.remove(raf);
            lenis.destroy();
        };
    }, [reduceMotion]);

    return (
        <>
            <section ref={journeyRef} className={`journey ${reduceMotion ? 'isStatic' : ''}`}>
                <div className="stage">
                    <div className={`canvasWrap ${ready ? 'isReady' : ''}`} aria-hidden="true">
                        <Canvas
                            flat /* 기본 톤매핑(ACES)이 흰 구름을 회색으로 눌러서 끔 */
                            dpr={[1, 1.5]}
                            camera={{ fov: FOV_START, near: 0.1, far: 140, position: PATH.getPointAt(0).toArray() }}
                            gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
                        >
                            <Suspense fallback={null}>
                                <Scene
                                    progress={progress}
                                    reduceMotion={reduceMotion}
                                    onReady={onReady}
                                    texKey={texKey}
                                    compare={compare}
                                    splitRef={splitRef}
                                    churchLight={churchLight}
                                />
                            </Suspense>
                        </Canvas>
                    </div>

                    <div className="copy" data-step="1">
                        <h1 className="headline">
                            <span className="line l1">오늘 하루,</span>
                            <span className="line l2">많이 애쓰셨죠.</span>
                        </h1>
                    </div>

                    <div className="copy" data-step="2">
                        <p className="sub">잠시 쉬어가도 괜찮은 곳이 있어요.<br />아무것도 준비하지 않고, 그냥 오셔도 됩니다.</p>
                        <div className="actions">
                            <button type="button" className="cta ctaPrimary">천천히 둘러보기</button>
                            <a href="#next" className="cta ctaSecondary">이번 주 예배 시간 보기</a>
                        </div>
                    </div>

                    <div className="scrollCue" data-cue aria-hidden="true"><span /></div>

                    {/* 시안 전용 비교 도구 (실제 디자인에는 포함하지 않음) */}
                    {compare && (
                        <>
                            <SplitDivider value={splitValue} onChange={moveSplit} />
                            <p className="splitLabel splitLabelLeft">{TEXTURES.photo.label}</p>
                            <p className="splitLabel splitLabelRight">{TEXTURES.drei.label}</p>
                        </>
                    )}
                    <div className="texToggle" role="group" aria-label="시안 비교 도구">
                        {Object.entries(TEXTURES).map(([key, t]) => (
                            <button
                                key={key}
                                type="button"
                                aria-pressed={!compare && texKey === key}
                                className={!compare && texKey === key ? 'isActive' : ''}
                                onClick={() => switchTexture(key)}
                            >
                                {t.label}
                            </button>
                        ))}
                        <button
                            type="button"
                            aria-pressed={compare}
                            className={compare ? 'isActive' : ''}
                            onClick={toggleCompare}
                        >
                            나란히 비교
                        </button>
                        <button
                            type="button"
                            aria-pressed={churchLight}
                            className={churchLight ? 'isActive' : ''}
                            onClick={toggleChurchLight}
                        >
                            교회 빛
                        </button>
                    </div>
                </div>
            </section>

            <section id="next" className="nextSection">
                <h2>다음 섹션: 마음 나누기</h2>
                <p>Hero가 끝나고 일반 페이지 배경으로 이어지는 지점이에요.</p>
            </section>
        </>
    );
}
