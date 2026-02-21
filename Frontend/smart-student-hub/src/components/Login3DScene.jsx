import React, { useRef, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ══════════════════════════════════════════════════════════
   Premium Login 3-D Scene
   – Central glowing book with rising luminous particles
   – Orbiting knowledge shapes (octahedron, icosahedron, torus-knot)
   – Ethereal light rings
   – Ambient star field + mouse parallax
   ══════════════════════════════════════════════════════════ */

/* ───── Background star field ───── */
const Stars = ({ count = 600 }) => {
  const ref = useRef();
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const c1 = new THREE.Color("#818cf8");
    const c2 = new THREE.Color("#c4b5fd");
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 22;
      const mix = Math.random();
      col[i * 3] = c1.r + (c2.r - c1.r) * mix;
      col[i * 3 + 1] = c1.g + (c2.g - c1.g) * mix;
      col[i * 3 + 2] = c1.b + (c2.b - c1.b) * mix;
    }
    return [pos, col];
  }, [count]);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.005;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
        <bufferAttribute attach="attributes-color" array={colors} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} sizeAttenuation transparent opacity={0.55} vertexColors />
    </points>
  );
};

/* ───── Rising luminous particles (from book) ───── */
const RisingParticles = ({ count = 120 }) => {
  const ref = useRef();
  const data = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const seeds = [];
    for (let i = 0; i < count; i++) {
      const s = {
        x: (Math.random() - 0.5) * 1.4,
        z: (Math.random() - 0.5) * 0.8,
        speed: 0.3 + Math.random() * 0.6,
        offset: Math.random() * Math.PI * 2,
        drift: (Math.random() - 0.5) * 0.4,
      };
      seeds.push(s);
      pos[i * 3] = s.x;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = s.z;
    }
    return { pos, seeds };
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const positions = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const s = data.seeds[i];
      const life = ((t * s.speed + s.offset) % 4) / 4; // 0→1 loop
      positions[i * 3] = s.x + Math.sin(t * 0.5 + s.offset) * s.drift * life;
      positions[i * 3 + 1] = life * 3.5 - 1.0; // rise from -1 to 2.5
      positions[i * 3 + 2] = s.z + Math.cos(t * 0.3 + s.offset) * s.drift * life;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={data.pos} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#a78bfa" size={0.045} sizeAttenuation transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
};

/* ───── Glowing open book ───── */
const GlowBook = () => {
  const group = useRef();
  const leftCover = useRef();
  const rightCover = useRef();
  const glowRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.position.y = -0.6 + Math.sin(t * 0.35) * 0.06;
      group.current.rotation.y = Math.sin(t * 0.2) * 0.04;
    }
    // subtle page breathing
    if (leftCover.current) leftCover.current.rotation.y = -0.45 + Math.sin(t * 0.8) * 0.03;
    if (rightCover.current) rightCover.current.rotation.y = 0.45 + Math.sin(t * 0.8 + 0.4) * 0.03;
    // glow pulse
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.12 + Math.sin(t * 1.5) * 0.04;
      glowRef.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.05);
    }
  });

  return (
    <group ref={group} position={[0, -0.8, 0]} rotation={[-0.55, 0, 0]} scale={0.85}>
      {/* Glow plane beneath the book */}
      <mesh ref={glowRef} position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.6, 32]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Spine */}
      <mesh>
        <boxGeometry args={[0.08, 0.12, 1.3]} />
        <meshStandardMaterial color="#312e81" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Left cover */}
      <group ref={leftCover} position={[-0.04, 0, 0]}>
        <mesh position={[-0.5, 0.02, 0]} rotation={[0, -0.45, 0]}>
          <boxGeometry args={[1, 0.05, 1.35]} />
          <meshStandardMaterial color="#4338ca" roughness={0.35} metalness={0.5} emissive="#312e81" emissiveIntensity={0.15} />
        </mesh>
        {/* Pages left */}
        {[0, 1, 2].map(i => (
          <mesh key={`lp${i}`} position={[-0.45 + i * 0.02, 0.04 + i * 0.008, 0]} rotation={[0, -0.42 + i * 0.04, 0]}>
            <boxGeometry args={[0.9, 0.008, 1.2]} />
            <meshStandardMaterial color="#eee8d5" roughness={0.95} metalness={0} emissive="#c4b5fd" emissiveIntensity={0.08} />
          </mesh>
        ))}
      </group>

      {/* Right cover */}
      <group ref={rightCover} position={[0.04, 0, 0]}>
        <mesh position={[0.5, 0.02, 0]} rotation={[0, 0.45, 0]}>
          <boxGeometry args={[1, 0.05, 1.35]} />
          <meshStandardMaterial color="#4338ca" roughness={0.35} metalness={0.5} emissive="#312e81" emissiveIntensity={0.15} />
        </mesh>
        {/* Pages right */}
        {[0, 1, 2].map(i => (
          <mesh key={`rp${i}`} position={[0.45 - i * 0.02, 0.04 + i * 0.008, 0]} rotation={[0, 0.42 - i * 0.04, 0]}>
            <boxGeometry args={[0.9, 0.008, 1.2]} />
            <meshStandardMaterial color="#eee8d5" roughness={0.95} metalness={0} emissive="#c4b5fd" emissiveIntensity={0.08} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

/* ───── Orbiting knowledge shapes ───── */
const OrbitShape = ({ radius, speed, offset, children }) => {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + offset;
    if (!ref.current) return;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.z = Math.sin(t) * radius * 0.5;
    ref.current.position.y = -0.1 + Math.sin(t * 1.5) * 0.35;
    ref.current.rotation.x += 0.008;
    ref.current.rotation.y += 0.012;
  });
  return <group ref={ref}>{children}</group>;
};

const OrbitingShapes = () => (
  <group position={[0, -0.3, 0]}>
    {/* Octahedron */}
    <OrbitShape radius={1.9} speed={0.25} offset={0}>
      <mesh scale={0.18}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#818cf8" transparent opacity={0.5} wireframe emissive="#818cf8" emissiveIntensity={0.4} />
      </mesh>
    </OrbitShape>

    {/* Icosahedron */}
    <OrbitShape radius={2.2} speed={0.18} offset={Math.PI * 0.66}>
      <mesh scale={0.15}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#a78bfa" transparent opacity={0.45} wireframe emissive="#a78bfa" emissiveIntensity={0.35} />
      </mesh>
    </OrbitShape>

    {/* Torus knot */}
    <OrbitShape radius={1.7} speed={0.22} offset={Math.PI * 1.33}>
      <mesh scale={0.1}>
        <torusKnotGeometry args={[1, 0.35, 64, 8, 2, 3]} />
        <meshStandardMaterial color="#c4b5fd" transparent opacity={0.4} wireframe emissive="#c4b5fd" emissiveIntensity={0.3} />
      </mesh>
    </OrbitShape>

    {/* Small dodecahedron */}
    <OrbitShape radius={1.5} speed={0.3} offset={Math.PI * 0.5}>
      <mesh scale={0.12}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#6366f1" transparent opacity={0.45} wireframe emissive="#6366f1" emissiveIntensity={0.4} />
      </mesh>
    </OrbitShape>
  </group>
);

/* ───── Ethereal light rings ───── */
const LightRings = () => {
  const r1 = useRef();
  const r2 = useRef();
  const r3 = useRef();

  useFrame((state, dt) => {
    if (r1.current) { r1.current.rotation.z += dt * 0.06; r1.current.rotation.x += dt * 0.02; }
    if (r2.current) { r2.current.rotation.z -= dt * 0.04; r2.current.rotation.y += dt * 0.03; }
    if (r3.current) { r3.current.rotation.x += dt * 0.05; r3.current.rotation.z += dt * 0.015; }
  });

  return (
    <group position={[0, -0.3, -0.5]}>
      <mesh ref={r1} rotation={[0.6, 0, 0]}>
        <torusGeometry args={[1.6, 0.007, 16, 120]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={r2} rotation={[1.2, 0.4, 0.3]}>
        <torusGeometry args={[1.9, 0.006, 16, 120]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={r3} rotation={[0.3, 1.0, 0.8]}>
        <torusGeometry args={[1.4, 0.006, 16, 100]} />
        <meshBasicMaterial color="#c4b5fd" transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
};

/* ───── Central light orb above book ───── */
const LightOrb = () => {
  const ref = useRef();
  const haloRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) {
      ref.current.position.y = 0.7 + Math.sin(t * 0.6) * 0.12;
      ref.current.scale.setScalar(0.85 + Math.sin(t * 2) * 0.05);
    }
    if (haloRef.current) {
      haloRef.current.position.y = 0.7 + Math.sin(t * 0.6) * 0.12;
      haloRef.current.material.opacity = 0.06 + Math.sin(t * 2) * 0.02;
      haloRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.08);
    }
  });

  return (
    <>
      <mesh ref={ref} position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshBasicMaterial color="#c4b5fd" transparent opacity={0.9} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={haloRef} position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.06} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </>
  );
};

/* ───── Mouse parallax ───── */
const Parallax = ({ children }) => {
  const groupRef = useRef();
  const mouse = useRef({ x: 0, y: 0 });
  const { size } = useThree();

  const onMove = useCallback(
    (e) => {
      mouse.current.x = (e.clientX / size.width - 0.5) * 2;
      mouse.current.y = -(e.clientY / size.height - 0.5) * 2;
    },
    [size]
  );

  useEffect(() => {
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [onMove]);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += (mouse.current.x * 0.12 - groupRef.current.rotation.y) * 0.025;
    groupRef.current.rotation.x += (mouse.current.y * 0.06 - groupRef.current.rotation.x) * 0.025;
  });

  return <group ref={groupRef}>{children}</group>;
};

/* ───── Exported canvas ───── */
const Login3DScene = () => (
  <Canvas
    camera={{ position: [0, 0.8, 5.5], fov: 38 }}
    dpr={[1, 1.5]}
    gl={{ antialias: true, alpha: true }}
    style={{ background: "transparent" }}
  >
    <ambientLight intensity={0.3} />
    <directionalLight position={[2, 5, 4]} intensity={0.6} color="#e0e7ff" />
    <pointLight position={[-2, 3, 3]} intensity={0.6} color="#818cf8" distance={12} />
    <pointLight position={[2, 0, 2]} intensity={0.3} color="#6366f1" distance={10} />
    <pointLight position={[0, 2, 0]} intensity={0.4} color="#c4b5fd" distance={8} />
    <Stars />
    <Parallax>
      <GlowBook />
      <RisingParticles />
      <LightOrb />
      <OrbitingShapes />
      <LightRings />
    </Parallax>
  </Canvas>
);

export default Login3DScene;
