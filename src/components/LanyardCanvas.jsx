/* eslint-disable react/no-unknown-property */
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';
import styles from '../pages/TeamPage.module.css';
import cardGLB from '../assets/card.glb';
import lanyard from '../assets/lanyard.png';

extend({ MeshLineGeometry, MeshLineMaterial });

// 1x1 transparent pixel for unconditional useTexture calls
const BLANK_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// UV regions from card.glb: front = left half, back = right half
const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 };

/**
 * Each member gets their own independent <SingleLanyard> (= independent Canvas + Physics).
 * The parent container handles horizontal scrolling via CSS transform.
 */
export default function LanyardCanvas({ members, scrollProgress }) {
  const trackRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animate horizontal scroll via CSS transform
  useEffect(() => {
    if (!scrollProgress || !trackRef.current) return;
    const unsubscribe = scrollProgress.on('change', (v) => {
      if (trackRef.current) {
        const cardWidth = isMobile ? 300 : 420;
        const gap = isMobile ? 24 : 48;
        const totalWidth = members.length * (cardWidth + gap);
        const viewportWidth = window.innerWidth;
        const maxScroll = Math.max(0, totalWidth - viewportWidth);
        trackRef.current.style.transform = `translateX(${-v * maxScroll}px)`;
      }
    });
    return unsubscribe;
  }, [scrollProgress, members.length, isMobile]);

  const spacing = isMobile ? 300 : 500;
  const [activeIndex, setActiveIndex] = useState(0);

  // Track which card is closest to center
  useEffect(() => {
    if (!scrollProgress) return;
    const unsubscribe = scrollProgress.on('change', (v) => {
      const closestIdx = Math.round(v * (members.length - 1));
      setActiveIndex(closestIdx);
    });
    return unsubscribe;
  }, [scrollProgress, members.length]);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 10, overflow: 'visible', pointerEvents: 'none' }}>
      {members.map((member, idx) => (
        <FullScreenCard
          key={idx}
          member={member}
          isMobile={isMobile}
          index={idx}
          totalCards={members.length}
          spacing={spacing}
          scrollProgress={scrollProgress}
          isActive={idx === activeIndex}
        />
      ))}
    </div>
  );
}

/** Each card gets a full-viewport Canvas, positioned via translateX */
function FullScreenCard({ member, isMobile, index, totalCards, spacing, scrollProgress, isActive }) {
  const wrapperRef = useRef(null);

  // Calculate initial offset
  const initialOffset = index * spacing;

  useEffect(() => {
    if (!scrollProgress || !wrapperRef.current) return;
    const unsubscribe = scrollProgress.on('change', (v) => {
      if (wrapperRef.current) {
        const maxScroll = (totalCards - 1) * spacing;
        const offset = index * spacing - v * maxScroll;
        wrapperRef.current.style.transform = `translateX(${offset}px)`;
      }
    });
    return unsubscribe;
  }, [scrollProgress, index, totalCards, spacing]);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: isActive ? 'auto' : 'none',
        zIndex: isActive ? 20 : 10 - Math.abs(index),
        willChange: 'transform',
        transform: `translateX(${initialOffset}px)`,
      }}
    >
      <SingleLanyard member={member} isMobile={isMobile} />
    </div>
  );
}

/** One independent Canvas + Physics per member card — matches the original React Bits code exactly */
function SingleLanyard({ member, isMobile }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 12], fov: 20 }}
      dpr={[1, isMobile ? 1.5 : 2]}
      gl={{ alpha: true }}
      onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), 0)}
      style={{ width: '100%', height: '100%' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <ambientLight intensity={Math.PI} />
      <Physics gravity={[0, -40, 0]} timeStep={isMobile ? 1 / 30 : 1 / 60}>
        <Band isMobile={isMobile} member={member} frontImage={member.image} />
      </Physics>
      <Environment blur={0.75}>
        <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
      </Environment>
    </Canvas>
  );
}

/** Band component — faithfully ported from the original React Bits source */
function Band({ maxSpeed = 50, minSpeed = 0, isMobile = false, member, frontImage = null }) {
  const { viewport } = useThree();
  const band = useRef(), fixed = useRef(), j1 = useRef(), j2 = useRef(), j3 = useRef(), card = useRef();
  const vec = new THREE.Vector3(), ang = new THREE.Vector3(), rot = new THREE.Vector3(), dir = new THREE.Vector3();
  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 };

  const { nodes, materials } = useGLTF(cardGLB);
  const texture = useTexture(lanyard);
  const frontTex = useTexture(frontImage || BLANK_PIXEL);

  // Composite the full card UI design onto the card's texture atlas
  const cardMap = useMemo(() => {
    const baseMap = materials.base.map;
    const baseImg = baseMap.image;
    if (!baseImg) return baseMap;

    const W = baseImg.width;
    const H = baseImg.height;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return baseMap;

    // Draw original baked atlas as base (preserves card edges)
    ctx.drawImage(baseImg, 0, 0, W, H);

    // === FRONT FACE (left half) ===
    const fx = FRONT_UV_RECT.x * W;
    const fy = FRONT_UV_RECT.y * H;
    const fw = FRONT_UV_RECT.w * W;
    const fh = FRONT_UV_RECT.h * H;

    ctx.save();
    ctx.beginPath();
    ctx.rect(fx, fy, fw, fh);
    ctx.clip();

    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(fx, fy, fw, fh);

    const padding = fw * 0.06;
    const innerX = fx + padding;
    const innerW = fw - padding * 2;

    // --- Oval punch hole at top ---
    const holeW = fw * 0.12;
    const holeH = fw * 0.045;
    const holeCx = fx + fw / 2;
    const holeCy = fy + fh * 0.035;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(holeCx, holeCy, holeW / 2, holeH / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#D0D0D0';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(holeCx, holeCy, holeW / 2 - 2, holeH / 2 - 1.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.restore();

    // --- Profile photo ---
    const photoTop = fy + fh * 0.07;
    const photoH = fh * 0.62;
    const photoW = innerW;

    if (frontTex.image && frontImage) {
      const img = frontTex.image;
      const imgScale = Math.max(photoW / img.width, photoH / img.height);
      const dw = img.width * imgScale;
      const dh = img.height * imgScale;
      const dx = innerX + (photoW - dw) / 2;
      const dy = photoTop + (photoH - dh) / 2;

      ctx.save();
      // Rounded photo area
      const r = fw * 0.03;
      ctx.beginPath();
      ctx.moveTo(innerX + r, photoTop);
      ctx.lineTo(innerX + photoW - r, photoTop);
      ctx.quadraticCurveTo(innerX + photoW, photoTop, innerX + photoW, photoTop + r);
      ctx.lineTo(innerX + photoW, photoTop + photoH - r);
      ctx.quadraticCurveTo(innerX + photoW, photoTop + photoH, innerX + photoW - r, photoTop + photoH);
      ctx.lineTo(innerX + r, photoTop + photoH);
      ctx.quadraticCurveTo(innerX, photoTop + photoH, innerX, photoTop + photoH - r);
      ctx.lineTo(innerX, photoTop + r);
      ctx.quadraticCurveTo(innerX, photoTop, innerX + r, photoTop);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, dx, dy, dw, dh);

      // Gradient fade at bottom of photo
      const gradH = photoH * 0.35;
      const grad = ctx.createLinearGradient(0, photoTop + photoH - gradH, 0, photoTop + photoH);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(1, 'rgba(255,255,255,0.85)');
      ctx.fillStyle = grad;
      ctx.fillRect(innerX, photoTop + photoH - gradH, photoW, gradH);
      ctx.restore();
    }

    // --- Name ---
    const nameY = photoTop + photoH + fh * 0.04;
    const fontSize = fw * 0.075;
    ctx.fillStyle = '#111111';
    ctx.font = `bold ${fontSize}px "Segoe UI", Arial, sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillText(member.name, innerX, nameY);

    // --- Role ---
    const roleY = nameY + fontSize * 1.3;
    const roleFontSize = fw * 0.05;
    ctx.fillStyle = '#666666';
    ctx.font = `${roleFontSize}px "Segoe UI", Arial, sans-serif`;
    ctx.fillText(member.role, innerX, roleY);

    // --- Footer divider line ---
    const footerY = fy + fh * 0.88;
    ctx.strokeStyle = '#E8E8E8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(innerX, footerY);
    ctx.lineTo(innerX + innerW, footerY);
    ctx.stroke();

    // --- Footer: department + ID ---
    const footFontSize = fw * 0.038;
    const footY = footerY + fh * 0.025;
    ctx.font = `500 ${footFontSize}px "Segoe UI", Arial, sans-serif`;
    ctx.fillStyle = '#333333';
    ctx.textBaseline = 'top';
    const deptText = member.badges?.[0]?.text || 'SBC Church';
    ctx.fillText(deptText, innerX, footY);

    ctx.restore();

    // === BACK FACE (right half) ===
    const bx = 0.5 * W;
    const by = 0;
    const bw = 0.5 * W;
    const bh = 0.757 * H;

    ctx.save();
    ctx.beginPath();
    ctx.rect(bx, by, bw, bh);
    ctx.clip();

    // Dark background
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(bx, by, bw, bh);

    // SBC logo + text (vertical, centered)
    ctx.save();
    ctx.translate(bx + bw / 2, by + bh / 2);
    ctx.rotate(-Math.PI / 2);
    const logoFontSize = bw * 0.22;
    ctx.font = `bold ${logoFontSize}px "Segoe UI", Arial, sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Cross icon approximation
    const crossSize = logoFontSize * 0.7;
    ctx.fillRect(-ctx.measureText('SBC').width / 2 - crossSize - 15, -crossSize / 2, crossSize * 0.4, crossSize);
    ctx.fillRect(-ctx.measureText('SBC').width / 2 - crossSize - 15 + crossSize * 0.3 - crossSize * 0.5, -crossSize * 0.2, crossSize, crossSize * 0.4);
    ctx.fillText('SBC', crossSize * 0.3, 0);
    ctx.restore();

    ctx.restore();

    const composite = new THREE.CanvasTexture(canvas);
    composite.colorSpace = THREE.SRGBColorSpace;
    composite.flipY = baseMap.flipY;
    composite.anisotropy = 16;
    composite.needsUpdate = true;
    return composite;
  }, [frontImage, frontTex, materials.base.map, member]);

  const [curve] = useState(
    () => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  );
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.5, 0]]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    }
    if (fixed.current) {
      [j1, j2].forEach(ref => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = 'chordal';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, viewport.height / 2 + 2.5, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={e => (e.target.releasePointerCapture(e.pointerId), drag(false))}
            onPointerDown={e => (
              e.target.setPointerCapture(e.pointerId),
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
            )}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={cardMap}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}

useGLTF.preload(cardGLB);
