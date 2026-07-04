'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const LOGO_PATH: [number, number][] = [
  [-0.0269,0.9231],[-0.0654,0.9154],[-0.0846,0.9077],[-0.1038,0.9000],[-0.1154,0.8923],[-0.1308,0.8846],[-0.1462,0.8769],[-0.1577,0.8692],[-0.1692,0.8615],[-0.1846,0.8538],[-0.2000,0.8462],[-0.2115,0.8385],
  [-0.2231,0.8308],[-0.2385,0.8231],[-0.2538,0.8154],[-0.2654,0.8077],[-0.2769,0.8000],[-0.2923,0.7923],[-0.3038,0.7846],[-0.3192,0.7769],[-0.3308,0.7692],[-0.3462,0.7615],[-0.3577,0.7538],[-0.3731,0.7462],
  [-0.3846,0.7385],[-0.4000,0.7308],[-0.4115,0.7231],[-0.4269,0.7154],[-0.4385,0.7077],[-0.4538,0.7000],[-0.4654,0.6923],[-0.4808,0.6846],[-0.4923,0.6769],[-0.5077,0.6692],[-0.5192,0.6615],[-0.5346,0.6538],
  [-0.5462,0.6462],[-0.5615,0.6385],[-0.5731,0.6308],[-0.5885,0.6231],[-0.6000,0.6154],[-0.6154,0.6077],[-0.6269,0.6000],[-0.6423,0.5923],[-0.6538,0.5846],[-0.6692,0.5769],[-0.6808,0.5692],[-0.6962,0.5615],
  [-0.7077,0.5538],[-0.7154,0.5462],[-0.7269,0.5385],[-0.7346,0.5308],[-0.7462,0.5231],[-0.7538,0.5154],[-0.7615,0.5077],[-0.7654,0.5000],[-0.7731,0.4923],[-0.7808,0.4846],[-0.7846,0.4769],[-0.7885,0.4692],
  [-0.7923,0.4615],[-0.7962,0.4538],[-0.8000,0.4462],[-0.8038,0.4385],[-0.8077,0.4308],[-0.8115,0.4231],[-0.8154,0.4154],[-0.8154,0.4077],[-0.8192,0.4000],[-0.8192,0.3923],[-0.8231,0.3846],[-0.8231,0.3769],
  [-0.8231,0.3692],[-0.8269,0.3615],[-0.8269,0.3538],[-0.8269,0.3462],[-0.8269,0.3385],[-0.8269,0.3308],[-0.8269,0.3231],[-0.8269,0.3154],[-0.8269,0.3077],[-0.8269,0.3000],[-0.8269,0.2923],[-0.8269,0.2846],
  [-0.8269,0.2769],[-0.8269,0.2692],[-0.8269,0.2615],[-0.8269,0.2538],[-0.8269,0.2462],[-0.8269,0.2385],[-0.8269,0.2308],[-0.8269,0.2231],[-0.8269,0.2154],[-0.8269,0.2077],[-0.8269,0.2000],[-0.8269,0.1923],
  [-0.8269,0.1846],[-0.8269,0.1769],[-0.8269,0.1692],[-0.8269,0.1615],[-0.8269,0.1538],[-0.8269,0.1462],[-0.8269,0.1385],[-0.8269,0.1308],[-0.8269,0.1231],[-0.8269,0.1154],[-0.8269,0.1077],[-0.8269,0.1000],
  [-0.8269,0.0923],[-0.8269,0.0846],[-0.8269,0.0769],[-0.8269,0.0692],[-0.8269,0.0615],[-0.8269,0.0538],[-0.8269,0.0462],[-0.8269,0.0385],[-0.8269,0.0308],[-0.8269,0.0231],[-0.8269,0.0154],[-0.8269,0.0077],
  [-0.8269,0.0000],[-0.8269,-0.0077],[-0.8269,-0.0154],[-0.8269,-0.0231],[-0.8269,-0.0308],[-0.8269,-0.0385],[-0.8308,-0.0462],[-0.8308,-0.0538],[-0.8308,-0.0615],[-0.8308,-0.0692],[-0.8308,-0.0769],[-0.8308,-0.0846],
  [-0.8308,-0.0923],[-0.8308,-0.1000],[-0.8308,-0.1077],[-0.8308,-0.1154],[-0.8308,-0.1231],[-0.8308,-0.1308],[-0.8308,-0.1385],[-0.8308,-0.1462],[-0.8308,-0.1538],[-0.8308,-0.1615],[-0.8308,-0.1692],[-0.8308,-0.1769],
  [-0.8308,-0.1846],[-0.8308,-0.1923],[-0.8308,-0.2000],[-0.8308,-0.2077],[-0.8308,-0.2154],[-0.8308,-0.2231],[-0.8308,-0.2308],[-0.8308,-0.2385],[-0.8308,-0.2462],[-0.8308,-0.2538],[-0.8308,-0.2615],[-0.8308,-0.2692],
  [-0.8308,-0.2769],[-0.8308,-0.2846],[-0.8308,-0.2923],[-0.8308,-0.3000],[-0.8308,-0.3077],[-0.8308,-0.3154],[-0.8308,-0.3231],[-0.8308,-0.3308],[-0.8308,-0.3385],[-0.8308,-0.3462],[-0.8308,-0.3538],[-0.8308,-0.3615],
  [-0.8269,-0.3692],[-0.8269,-0.3769],[-0.8269,-0.3846],[-0.8269,-0.3923],[-0.8231,-0.4000],[-0.8231,-0.4077],[-0.8231,-0.4154],[-0.8192,-0.4231],[-0.8192,-0.4308],[-0.8154,-0.4385],[-0.8154,-0.4462],[-0.8115,-0.4538],
  [-0.8077,-0.4615],[-0.8038,-0.4692],[-0.8000,-0.4769],[-0.7962,-0.4846],[-0.7923,-0.4923],[-0.7846,-0.5000],[-0.7808,-0.5077],[-0.7731,-0.5154],[-0.7654,-0.5231],[-0.7577,-0.5308],[-0.7462,-0.5385],[-0.7346,-0.5462],
  [-0.7231,-0.5538],[-0.7077,-0.5615],[-0.6962,-0.5692],[-0.6808,-0.5769],[-0.6692,-0.5846],[-0.6577,-0.5923],[-0.6423,-0.6000],[-0.6308,-0.6077],[-0.6154,-0.6154],[-0.6038,-0.6231],[-0.5885,-0.6308],[-0.5769,-0.6385],
  [-0.5654,-0.6462],[-0.5500,-0.6538],[-0.5385,-0.6615],[-0.5231,-0.6692],[-0.5115,-0.6769],[-0.4962,-0.6846],[-0.4846,-0.6923],[-0.4731,-0.7000],[-0.4577,-0.7077],[-0.4462,-0.7154],[-0.4308,-0.7231],[-0.4192,-0.7308],
  [-0.4038,-0.7385],[-0.3923,-0.7462],[-0.3808,-0.7538],[-0.3654,-0.7615],[-0.3538,-0.7692],[-0.3385,-0.7769],[-0.3269,-0.7846],[-0.3115,-0.7923],[-0.3000,-0.8000],[-0.2885,-0.8077],[-0.2731,-0.8154],[-0.2615,-0.8231],
  [-0.2462,-0.8308],[-0.2346,-0.8385],[-0.2192,-0.8462],[-0.2077,-0.8538],[-0.1962,-0.8615],[-0.1808,-0.8692],[-0.1692,-0.8769],[-0.1538,-0.8846],[-0.1423,-0.8923],[-0.1231,-0.9000],[-0.1077,-0.9077],[-0.0846,-0.9154],
  [-0.0500,-0.9231],[0.0269,-0.9231],[0.0577,-0.9154],[0.0808,-0.9077],[0.1000,-0.9000],[0.1154,-0.8923],[0.1308,-0.8846],[0.1423,-0.8769],[0.1577,-0.8692],[0.1692,-0.8615],[0.1846,-0.8538],[0.1962,-0.8462],
  [0.2115,-0.8385],[0.2231,-0.8308],[0.2385,-0.8231],[0.2500,-0.8154],[0.2654,-0.8077],[0.2769,-0.8000],[0.2923,-0.7923],[0.3038,-0.7846],[0.3192,-0.7769],[0.3308,-0.7692],[0.3462,-0.7615],[0.3577,-0.7538],
  [0.3692,-0.7462],[0.3846,-0.7385],[0.4000,-0.7308],[0.4115,-0.7231],[0.4231,-0.7154],[0.4385,-0.7077],[0.4500,-0.7000],[0.4654,-0.6923],[0.4769,-0.6846],[0.4923,-0.6769],[0.5038,-0.6692],[0.5192,-0.6615],
  [0.5308,-0.6538],[0.5462,-0.6462],[0.5577,-0.6385],[0.5731,-0.6308],[0.5846,-0.6231],[0.6000,-0.6154],[0.6115,-0.6077],[0.6269,-0.6000],[0.6385,-0.5923],[0.6538,-0.5846],[0.6654,-0.5769],[0.6808,-0.5692],
  [0.6923,-0.5615],[0.7077,-0.5538],[0.7192,-0.5462],[0.7308,-0.5385],[0.7385,-0.5308],[0.7500,-0.5231],[0.7577,-0.5154],[0.7692,-0.5077],[0.7769,-0.5000],[0.7846,-0.4923],[0.7885,-0.4846],[0.7962,-0.4769],
  [0.8000,-0.4692],[0.8077,-0.4615],[0.8115,-0.4538],[0.8154,-0.4462],[0.8192,-0.4385],[0.8192,-0.4308],[0.8231,-0.4231],[0.8231,-0.4154],[0.8269,-0.4077],[0.8269,-0.4000],[0.8308,-0.3923],[0.8308,-0.3846],
  [0.8308,-0.3769],[0.8308,-0.3692],[0.8308,-0.3615],[0.8308,-0.3538],[0.8346,-0.3462],[0.8346,-0.3385],[0.8346,-0.3308],[0.8346,-0.3231],[0.8346,-0.3154],[0.8346,-0.3077],[0.8346,-0.3000],[0.8346,-0.2923],
  [0.8346,-0.2846],[0.8346,-0.2769],[0.8346,-0.2692],[0.8346,-0.2615],[0.8346,-0.2538],[0.8346,-0.2462],[0.8346,-0.2385],[0.8346,-0.2308],[0.8346,-0.2231],[0.8346,-0.2154],[0.8346,-0.2077],[0.8308,-0.2000],
  [0.8308,-0.1923],[0.8308,-0.1846],[0.8308,-0.1769],[0.8308,-0.1692],[0.8308,-0.1615],[0.8308,-0.1538],[0.8308,-0.1462],[0.8308,-0.1385],[0.8308,-0.1308],[0.8308,-0.1231],[0.8308,-0.1154],[0.8308,-0.1077],
  [0.8308,-0.1000],[0.8308,-0.0923],[0.8308,-0.0846],[0.8308,-0.0769],[0.8308,-0.0692],[0.8308,-0.0615],[0.8308,-0.0538],[0.8308,-0.0462],[0.8308,-0.0385],[0.8308,-0.0308],[0.8308,-0.0231],[0.8308,-0.0154],
  [0.8308,-0.0077],[0.8308,0.0000],[0.8308,0.0077],[0.8308,0.0154],[0.8308,0.0231],[0.8308,0.0308],[0.8308,0.0385],[0.8308,0.0462],[0.8308,0.0538],[0.8308,0.0615],[0.8308,0.0692],[0.8308,0.0769],
  [0.8308,0.0846],[0.8308,0.0923],[0.8308,0.1000],[0.8308,0.1077],[0.8308,0.1154],[0.8308,0.1231],[0.8308,0.1308],[0.8308,0.1385],[0.8308,0.1462],[0.8308,0.1538],[0.8308,0.1615],[0.8308,0.1692],
  [0.8308,0.1769],[0.8308,0.1846],[0.8308,0.1923],[0.8308,0.2000],[0.8308,0.2077],[0.8346,0.2154],[0.8346,0.2231],[0.8346,0.2308],[0.8346,0.2385],[0.8346,0.2462],[0.8346,0.2538],[0.8346,0.2615],
  [0.8346,0.2692],[0.8346,0.2769],[0.8346,0.2846],[0.8346,0.2923],[0.8346,0.3000],[0.8346,0.3077],[0.8346,0.3154],[0.8346,0.3231],[0.8346,0.3308],[0.8308,0.3385],[0.8308,0.3462],[0.8308,0.3538],
  [0.8308,0.3615],[0.8269,0.3692],[0.8269,0.3769],[0.8231,0.3846],[0.8231,0.3923],[0.8192,0.4000],[0.8154,0.4077],[0.8154,0.4154],[0.8115,0.4231],[0.8077,0.4308],[0.8038,0.4385],[0.8000,0.4462],
  [0.7962,0.4538],[0.7885,0.4615],[0.7846,0.4692],[0.7769,0.4769],[0.7692,0.4846],[0.7654,0.4923],[0.7577,0.5000],[0.7500,0.5077],[0.7385,0.5154],[0.7308,0.5231],[0.7192,0.5308],[0.7077,0.5385],
  [0.6962,0.5462],[0.6846,0.5538],[0.6692,0.5615],[0.6577,0.5692],[0.6423,0.5769],[0.6308,0.5846],[0.6154,0.5923],[0.6038,0.6000],[0.5923,0.6077],[0.5769,0.6154],[0.5654,0.6231],[0.5500,0.6308],
  [0.5385,0.6385],[0.5231,0.6462],[0.5115,0.6538],[0.4962,0.6615],[0.4846,0.6692],[0.4731,0.6769],[0.4577,0.6846],[0.4462,0.6923],[0.4308,0.7000],[0.4192,0.7077],[0.4038,0.7154],[0.3923,0.7231],
  [0.3769,0.7308],[0.3654,0.7385],[0.3538,0.7462],[0.3385,0.7538],[0.3269,0.7615],[0.3115,0.7692],[0.3000,0.7769],[0.2846,0.7846],[0.2731,0.7923],[0.2577,0.8000],[0.2462,0.8077],[0.2346,0.8154],
  [0.2192,0.8231],[0.2077,0.8308],[0.1923,0.8385],[0.1808,0.8462],[0.1654,0.8538],[0.1538,0.8615],[0.1423,0.8692],[0.1269,0.8769],[0.1154,0.8846],[0.0962,0.8923],[0.0808,0.9000],[0.0615,0.9077],
  [0.0385,0.9154],[-0.0038,0.9231],[-0.0269,0.9231]
];

interface HeroLogoProps {
  /** Path to your logo PNG (default: './logo.png') */
  logoTexturePath?: string;
  /** Background color (default: 'transparent') */
  backgroundColor?: string;
  /** Replace "WEBSITE NAME" text */
  brandName?: string;
  /** Replace "Coming Soon" text */
  tagline?: string;
}

export default function HeroLogo({
  logoTexturePath = '/images/logo.png',
  backgroundColor = 'transparent',
  brandName = '',
  tagline = '',
}: HeroLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const prevXRef = useRef(0);
  const prevYRef = useRef(0);
  const targetRotXRef = useRef(0);
  const targetRotYRef = useRef(0);
  const curRotXRef = useRef(0);
  const curRotYRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── Scene ──
    const scene = new THREE.Scene();
    if (backgroundColor && backgroundColor !== 'transparent') {
      scene.background = new THREE.Color(backgroundColor);
    } else {
      scene.background = null;
    }

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0.15, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // ── Build 3D shape ──
    const s = new THREE.Shape();
    s.moveTo(LOGO_PATH[0][0], LOGO_PATH[0][1]);
    for (let i = 1; i < LOGO_PATH.length; i++) s.lineTo(LOGO_PATH[i][0], LOGO_PATH[i][1]);
    s.closePath();

    const geo = new THREE.ExtrudeGeometry(s, {
      steps: 1, depth: 0.22,
      bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.03, bevelSegments: 8,
    });
    geo.center();
    geo.computeBoundingBox();
    if (geo.boundingBox && geo.attributes.uv) {
      const bb = geo.boundingBox;
      const uvAttr = geo.attributes.uv;
      for (let i = 0; i < uvAttr.count; i++) {
        const u = (uvAttr.getX(i) - bb.min.x) / (bb.max.x - bb.min.x);
        const v = (uvAttr.getY(i) - bb.min.y) / (bb.max.y - bb.min.y);
        uvAttr.setXY(i, u, v);
      }
    }

    // ── White material — texture loads onto this ──
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.15,
      roughness: 0.25,
      clearcoat: 0.1,
      clearcoatRoughness: 0.4,
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: true,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    scene.add(mesh);

    // Subtle blue glow behind
    const gMat = new THREE.MeshPhysicalMaterial({
      color: 0x4466ff,
      emissive: 0x2244cc,
      emissiveIntensity: 0.1,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
      roughness: 0.5,
      metalness: 0.1,
    });
    const gMesh = new THREE.Mesh(geo.clone(), gMat);
    gMesh.position.z = -0.02;
    scene.add(gMesh);

    // ── Load texture ──
    new THREE.TextureLoader().load(
      logoTexturePath,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.repeat.set(1, 1);
        mat.map = tex;
        mat.needsUpdate = true;
      },
      undefined,
      () => {
        mat.color.setHex(0x4488ff);
      }
    );

    // ── Lights ──
    scene.add(new THREE.AmbientLight(0x444488, 0.5));
    const key = new THREE.DirectionalLight(0xaaaaff, 2.0);
    key.position.set(2, 3, 4);
    key.castShadow = true;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x5577ff, 0.7);
    fill.position.set(-3, 0, -2);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 0.6);
    rim.position.set(0, -2, 3);
    scene.add(rim);
    const back = new THREE.DirectionalLight(0x7755ff, 0.3);
    back.position.set(0, 0, -5);
    scene.add(back);

    // ── Particles ──
    const pGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(600);
    for (let i = 0; i < 600; i++) pos[i] = (Math.random() - 0.5) * 12;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({
        color: 0x6688ff,
        size: 0.012,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    scene.add(pts);

    // ── Mouse / Touch Interactive Rotation ──
    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      prevXRef.current = e.clientX;
      prevYRef.current = e.clientY;
      container.style.cursor = 'grabbing';
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isDraggingRef.current) {
        const dx = e.clientX - prevXRef.current;
        const dy = e.clientY - prevYRef.current;
        targetRotYRef.current += dx * 0.012;
        targetRotXRef.current += dy * 0.012;
        prevXRef.current = e.clientX;
        prevYRef.current = e.clientY;
      }
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
      if (container) container.style.cursor = 'grab';
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    container.style.cursor = 'grab';

    // ── Animation ──
    let animationId: number;
    const clock = new THREE.Clock();

    function animate() {
      const t = clock.getElapsedTime();
      const fy = Math.sin(t * 0.5) * 0.14;
      mesh.position.y = fy;
      gMesh.position.y = fy;

      if (!isDraggingRef.current) {
        targetRotYRef.current += (0 - targetRotYRef.current) * 0.05;
        targetRotXRef.current += (0 - targetRotXRef.current) * 0.05;
      }

      curRotYRef.current += (targetRotYRef.current - curRotYRef.current) * 0.08;
      curRotXRef.current += (targetRotXRef.current - curRotXRef.current) * 0.08;

      mesh.rotation.y = curRotYRef.current + Math.sin(t * 0.055) * 0.04;
      mesh.rotation.x = curRotXRef.current;
      gMesh.rotation.y = mesh.rotation.y;
      gMesh.rotation.x = mesh.rotation.x;

      pts.rotation.y = t * 0.006;
      camera.position.x = Math.sin(t * 0.035) * 0.2;
      camera.position.z = 4.2 + Math.sin(t * 0.02) * 0.08;
      camera.lookAt(0, fy, 0);
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    }
    animate();

    // ── Resize ──
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    addEventListener('resize', onResize);

    // ── Cleanup ──
    return () => {
      cancelAnimationFrame(animationId);
      removeEventListener('resize', onResize);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [logoTexturePath, backgroundColor]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '400px',
        overflow: 'hidden',
        background: backgroundColor,
      }}
    >
      {brandName && (
        <div
          style={{
            position: 'absolute',
            bottom: '8%',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            pointerEvents: 'none',
            animation: 'heroFadeIn 2s ease 1.5s forwards',
            opacity: 0,
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(1.2rem, 4vw, 2rem)',
              fontWeight: 300,
              letterSpacing: '0.15em',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '0.2rem',
            }}
          >
            {brandName}
          </h1>
          {tagline && (
            <p
              style={{
                fontSize: 'clamp(0.7rem, 2vw, 0.85rem)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              {tagline}
            </p>
          )}
        </div>
      )}
      <style>{`
        @keyframes heroFadeIn { to { opacity: 1; } }
      `}</style>
    </div>
  );
}
