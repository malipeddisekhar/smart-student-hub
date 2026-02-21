import React, { useRef, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ══════════════════════════════════════════════════════════
   Admin Login 3-D Scene – "Command Nexus"
   – Holographic shield / hexagonal grid core
   – Triple rotating command rings
   – Data stream rising particles
   – Orbiting security nodes
   – Purple / magenta colour palette
   ══════════════════════════════════════════════════════════ */

/* ───── Star field ───── */
const Stars = ({ count = 500 }) => {
  const ref = useRef();
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const c1 = new THREE.Color("#c084fc");
    const c2 = new THREE.Color("#f0abfc");
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

/* ───── Hexagonal Shield Core ───── */
const HexShield = () => {
  const groupRef = useRef();
  const innerRef = useRef();

  const hexPoints = useMemo(() => {
    const pts = [];
    // Create multiple hex rings
    for (let ring = 0; ring < 3; ring++) {
      const r = 0.4 + ring * 0.35;
      const sides = 6;
      for (let i = 0; i < sides; i++) {
        const a = (i / sides) * Math.PI * 2 - Math.PI / 6;
        pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, ring });
      }
    }
    return pts;
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = clock.elapsedTime * 0.1;
      groupRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.3) * 0.1;
    }
    if (innerRef.current) {
      innerRef.current.scale.setScalar(0.3 + Math.sin(clock.elapsedTime * 1.8) * 0.05);
      innerRef.current.rotation.y = clock.elapsedTime * 0.5;
      innerRef.current.rotation.x = clock.elapsedTime * 0.3;
    }
  });

  return (
    <group position={[0, -0.2, 0]}>
      <group ref={groupRef}>
        {/* Hex grid nodes */}
        {hexPoints.map((p, i) => (
          <mesh key={i} position={[p.x, p.y, 0]}>
            <octahedronGeometry args={[0.04, 0]} />
            <meshStandardMaterial
              color={p.ring === 0 ? "#e879f9" : p.ring === 1 ? "#c084fc" : "#a78bfa"}
              emissive={p.ring === 0 ? "#e879f9" : p.ring === 1 ? "#c084fc" : "#a78bfa"}
              emissiveIntensity={2}
              toneMapped={false}
            />
          </mesh>
        ))}
        {/* Hex edge connections */}
        {[0, 1, 2].map(ring => {
          const r = 0.4 + ring * 0.35;
          return (
            <mesh key={`hex-${ring}`}>
              <torusGeometry args={[r, 0.008, 4, 6]} />
              <meshStandardMaterial
                color="#c084fc"
                emissive="#c084fc"
                emissiveIntensity={1}
                transparent
                opacity={0.4 - ring * 0.1}
                toneMapped={false}
              />
            </mesh>
          );
        })}
      </group>
      {/* Inner core polyhedron */}
      <mesh ref={innerRef}>
        <dodecahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={3} toneMapped={false} wireframe />
      </mesh>
      {/* Glow */}
      <mesh>
        <sphereGeometry args={[0.6, 24, 24]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.8} transparent opacity={0.08} toneMapped={false} side={THREE.BackSide} />
      </mesh>
    </group>
  );
};

/* ───── Triple Command Rings ───── */
const CommandRings = () => {
  const ringsRef = useRef([]);

  const configs = useMemo(() => [
    { radius: 1.4, tubeR: 0.012, speed: 0.35, tiltX: Math.PI / 2, tiltZ: 0, color: "#a855f7", segments: 80 },
    { radius: 1.7, tubeR: 0.01, speed: -0.25, tiltX: Math.PI / 2 + 0.6, tiltZ: 0.4, color: "#e879f9", segments: 80 },
    { radius: 1.1, tubeR: 0.01, speed: 0.45, tiltX: Math.PI / 2 - 0.5, tiltZ: -0.3, color: "#c084fc", segments: 60 },
    { radius: 2.0, tubeR: 0.007, speed: 0.15, tiltX: Math.PI / 2 + 0.2, tiltZ: 0.8, color: "#f0abfc", segments: 100 },
  ], []);

  useFrame(({ clock }) => {
    ringsRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.rotation.z = clock.elapsedTime * configs[i].speed;
    });
  });

  return (
    <group position={[0, -0.2, 0]}>
      {configs.map((cfg, i) => (
        <group key={i} ref={el => ringsRef.current[i] = el} rotation={[cfg.tiltX, 0, cfg.tiltZ]}>
          <mesh>
            <torusGeometry args={[cfg.radius, cfg.tubeR, 8, cfg.segments]} />
            <meshStandardMaterial
              color={cfg.color}
              emissive={cfg.color}
              emissiveIntensity={1.5}
              transparent
              opacity={0.3}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

/* ───── Security Nodes (orbiting) ───── */
const SecurityNodes = ({ count = 6 }) => {
  const groupRef = useRef();
  const nodesRef = useRef([]);

  const nodeData = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      angle: (i / count) * Math.PI * 2,
      radius: 1.4 + (i % 2) * 0.5,
      speed: 0.2 + (i % 3) * 0.1,
      yOffset: (Math.random() - 0.5) * 1.2,
      size: 0.06 + Math.random() * 0.04,
      color: ["#a855f7", "#e879f9", "#c084fc", "#f0abfc", "#d946ef", "#8b5cf6"][i],
    }));
  }, [count]);

  useFrame(({ clock }) => {
    nodesRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const d = nodeData[i];
      const a = d.angle + clock.elapsedTime * d.speed;
      mesh.position.x = Math.cos(a) * d.radius;
      mesh.position.z = Math.sin(a) * d.radius;
      mesh.position.y = d.yOffset + Math.sin(clock.elapsedTime + i) * 0.2 - 0.2;
      const s = 1 + Math.sin(clock.elapsedTime * 2 + i) * 0.3;
      mesh.scale.setScalar(s);
    });
  });

  return (
    <group>
      {nodeData.map((d, i) => (
        <mesh key={i} ref={el => nodesRef.current[i] = el}>
          <octahedronGeometry args={[d.size, 0]} />
          <meshStandardMaterial color={d.color} emissive={d.color} emissiveIntensity={3} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

/* ───── Data Stream Particles (rising columns) ───── */
const DataStream = ({ count = 100 }) => {
  const ref = useRef();
  const [positions, initY] = useMemo(() => {
    const p = new Float32Array(count * 3);
    const iy = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.5 + Math.random() * 1.6;
      p[i * 3]     = Math.cos(angle) * r;
      p[i * 3 + 1] = (Math.random() - 0.5) * 5 - 0.2;
      p[i * 3 + 2] = Math.sin(angle) * r;
      iy[i] = p[i * 3 + 1];
    }
    return [p, iy];
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += 0.008;
      if (arr[i * 3 + 1] > 3) arr[i * 3 + 1] = -3;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.rotation.y = clock.elapsedTime * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#d946ef" transparent opacity={0.55} sizeAttenuation blending={THREE.AdditiveBlending} />
    </points>
  );
};

/* ───── Flat scanning plane ───── */
const ScanPlane = () => {
  const ref = useRef();

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = -0.2 + Math.sin(clock.elapsedTime * 0.8) * 1.5;
    ref.current.material.opacity = 0.06 + Math.sin(clock.elapsedTime * 0.8) * 0.03;
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.3, 2.2, 36]} />
      <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={1} transparent opacity={0.06} toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  );
};

/* ───── Mouse parallax ───── */
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
    camera.lookAt(0, -0.2, 0);
  });

  return null;
};

/* ═══════ Main export ═══════ */
const AdminLogin3DScene = () => (
  <div style={{ width: "100%", height: "100%", background: "transparent" }}>
    <Canvas
      camera={{ position: [0, 0.5, 7.5], fov: 34 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.12} />
      <pointLight position={[3, 4, 3]} intensity={0.6} color="#a855f7" />
      <pointLight position={[-3, -2, 2]} intensity={0.3} color="#e879f9" />

      <Stars />
      <HexShield />
      <CommandRings />
      <SecurityNodes />
      <DataStream />
      <ScanPlane />
      <MouseParallax />
    </Canvas>
  </div>
);

export default AdminLogin3DScene;
