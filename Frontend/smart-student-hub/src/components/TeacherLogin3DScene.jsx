import React, { useRef, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ══════════════════════════════════════════════════════════
   Teacher Login 3-D Scene – "DNA of Knowledge"
   – Double-helix strand with glowing nodes
   – Central pulsing energy core
   – Orbiting atom-like electron rings
   – Floating formula particles
   – Emerald / teal colour palette
   ══════════════════════════════════════════════════════════ */

/* ───── Star field ───── */
const Stars = ({ count = 500 }) => {
  const ref = useRef();
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const c1 = new THREE.Color("#34d399");
    const c2 = new THREE.Color("#a7f3d0");
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 24;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 24;
      const m = Math.random();
      col[i * 3]     = c1.r + (c2.r - c1.r) * m;
      col[i * 3 + 1] = c1.g + (c2.g - c1.g) * m;
      col[i * 3 + 2] = c1.b + (c2.b - c1.b) * m;
    }
    return [pos, col];
  }, [count]);

  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.004; });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
        <bufferAttribute attach="attributes-color" array={colors} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} sizeAttenuation transparent opacity={0.5} vertexColors />
    </points>
  );
};

/* ───── Double Helix DNA strand ───── */
const DoubleHelix = ({ nodeCount = 28 }) => {
  const groupRef = useRef();
  const nodesA = useRef([]);
  const nodesB = useRef([]);
  const connectors = useRef([]);

  const helixData = useMemo(() => {
    const data = [];
    for (let i = 0; i < nodeCount; i++) {
      const t = (i / nodeCount) * Math.PI * 4;
      const y = (i / nodeCount) * 6 - 3;
      const r = 0.7;
      data.push({
        posA: [Math.cos(t) * r, y, Math.sin(t) * r],
        posB: [Math.cos(t + Math.PI) * r, y, Math.sin(t + Math.PI) * r],
        t,
      });
    }
    return data;
  }, [nodeCount]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = clock.elapsedTime * 0.15;

    nodesA.current.forEach((mesh, i) => {
      if (!mesh) return;
      const pulse = 0.08 + Math.sin(clock.elapsedTime * 2 + i * 0.3) * 0.03;
      mesh.scale.setScalar(pulse / 0.08);
    });
    nodesB.current.forEach((mesh, i) => {
      if (!mesh) return;
      const pulse = 0.08 + Math.cos(clock.elapsedTime * 2 + i * 0.3) * 0.03;
      mesh.scale.setScalar(pulse / 0.08);
    });
  });

  return (
    <group ref={groupRef} position={[0, -0.3, 0]}>
      {helixData.map((d, i) => (
        <group key={i}>
          {/* Strand A node */}
          <mesh ref={el => nodesA.current[i] = el} position={d.posA}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1.5} toneMapped={false} />
          </mesh>
          {/* Strand B node */}
          <mesh ref={el => nodesB.current[i] = el} position={d.posB}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={1.5} toneMapped={false} />
          </mesh>
          {/* Connector line between strands */}
          {i % 3 === 0 && (
            <mesh ref={el => connectors.current[i] = el}>
              <cylinderGeometry args={[0.012, 0.012, new THREE.Vector3(...d.posA).distanceTo(new THREE.Vector3(...d.posB)), 6]} />
              <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={0.8} transparent opacity={0.5} toneMapped={false} />
              <group
                position={[
                  (d.posA[0] + d.posB[0]) / 2,
                  (d.posA[1] + d.posB[1]) / 2,
                  (d.posA[2] + d.posB[2]) / 2,
                ]}
              />
            </mesh>
          )}
        </group>
      ))}
      {/* Thin tube-like connections every 3rd node */}
      {helixData.filter((_, i) => i % 3 === 0).map((d, i) => {
        const start = new THREE.Vector3(...d.posA);
        const end = new THREE.Vector3(...d.posB);
        const mid = start.clone().lerp(end, 0.5);
        const len = start.distanceTo(end);
        const dir = end.clone().sub(start).normalize();
        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        return (
          <mesh key={`c-${i}`} position={[mid.x, mid.y, mid.z]} quaternion={quat}>
            <cylinderGeometry args={[0.015, 0.015, len, 6]} />
            <meshStandardMaterial color="#6ee7b7" emissive="#6ee7b7" emissiveIntensity={0.6} transparent opacity={0.4} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};

/* ───── Central pulsing energy core ───── */
const EnergyCore = () => {
  const meshRef = useRef();
  const glowRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.scale.setScalar(0.25 + Math.sin(t * 1.5) * 0.05);
      meshRef.current.rotation.x = t * 0.3;
      meshRef.current.rotation.z = t * 0.2;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(0.55 + Math.sin(t * 1.2) * 0.1);
      glowRef.current.material.opacity = 0.12 + Math.sin(t * 1.5) * 0.05;
    }
  });

  return (
    <group position={[0, -0.3, 0]}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.25, 1]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={3} toneMapped={false} wireframe />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={1} transparent opacity={0.12} toneMapped={false} side={THREE.BackSide} />
      </mesh>
    </group>
  );
};

/* ───── Orbiting electron rings ───── */
const ElectronRings = () => {
  const ringsRef = useRef([]);

  const ringConfigs = useMemo(() => [
    { radius: 1.5, speed: 0.4, tiltX: 0.8, tiltZ: 0.2, color: "#10b981" },
    { radius: 1.8, speed: -0.3, tiltX: -0.5, tiltZ: 0.7, color: "#06b6d4" },
    { radius: 1.3, speed: 0.5, tiltX: 0.3, tiltZ: -0.6, color: "#34d399" },
  ], []);

  useFrame(({ clock }) => {
    ringsRef.current.forEach((ring, i) => {
      if (!ring) return;
      const cfg = ringConfigs[i];
      ring.rotation.y = clock.elapsedTime * cfg.speed;
    });
  });

  return (
    <group position={[0, -0.3, 0]}>
      {ringConfigs.map((cfg, i) => (
        <group key={i} ref={el => ringsRef.current[i] = el} rotation={[cfg.tiltX, 0, cfg.tiltZ]}>
          <mesh>
            <torusGeometry args={[cfg.radius, 0.012, 8, 80]} />
            <meshStandardMaterial color={cfg.color} emissive={cfg.color} emissiveIntensity={1.2} transparent opacity={0.35} toneMapped={false} />
          </mesh>
          {/* Electron bead on ring */}
          <mesh position={[cfg.radius, 0, 0]}>
            <sphereGeometry args={[0.06, 10, 10]} />
            <meshStandardMaterial color={cfg.color} emissive={cfg.color} emissiveIntensity={3} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

/* ───── Floating formula particles ───── */
const FormulaParticles = ({ count = 80 }) => {
  const ref = useRef();
  const [positions, speeds] = useMemo(() => {
    const p = new Float32Array(count * 3);
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.2 + Math.random() * 1.5;
      p[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      p[i * 3 + 1] = r * Math.cos(phi) - 0.3;
      p[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      s[i] = 0.3 + Math.random() * 0.7;
    }
    return [p, s];
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const posArr = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      posArr[i * 3 + 1] += Math.sin(clock.elapsedTime * speeds[i] + i) * 0.001;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.rotation.y = clock.elapsedTime * 0.03;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#6ee7b7" transparent opacity={0.6} sizeAttenuation blending={THREE.AdditiveBlending} />
    </points>
  );
};

/* ───── Mouse parallax camera ───── */
const MouseParallax = () => {
  const mouse = useRef({ x: 0, y: 0 });
  const { camera } = useThree();

  const onMove = useCallback((e) => {
    mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [onMove]);

  useFrame(() => {
    camera.position.x += (mouse.current.x * 0.6 - camera.position.x) * 0.03;
    camera.position.y += (-mouse.current.y * 0.4 + 0.5 - camera.position.y) * 0.03;
    camera.lookAt(0, -0.3, 0);
  });

  return null;
};

/* ═══════ Main export ═══════ */
const TeacherLogin3DScene = () => (
  <div style={{ width: "100%", height: "100%", background: "transparent" }}>
    <Canvas
      camera={{ position: [0, 0.5, 7.5], fov: 34 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.15} />
      <pointLight position={[3, 4, 3]} intensity={0.6} color="#34d399" />
      <pointLight position={[-3, -2, 2]} intensity={0.3} color="#06b6d4" />

      <Stars />
      <DoubleHelix />
      <EnergyCore />
      <ElectronRings />
      <FormulaParticles />
      <MouseParallax />
    </Canvas>
  </div>
);

export default TeacherLogin3DScene;
