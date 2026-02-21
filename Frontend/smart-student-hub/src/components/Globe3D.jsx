import React, { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ───────── Stars background ───────── */
const Stars = ({ count = 1200 }) => {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.012;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#818cf8" size={0.018} sizeAttenuation transparent opacity={0.7} />
    </points>
  );
};

/* ───────── Wireframe sphere ───────── */
const WireGlobe = () => {
  const meshRef = useRef();
  const glowRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
      meshRef.current.rotation.x += delta * 0.04;
    }
    if (glowRef.current) {
      glowRef.current.rotation.y += delta * 0.15;
      glowRef.current.rotation.x += delta * 0.04;
    }
  });

  return (
    <group>
      {/* Main wireframe sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.6, 36, 36]} />
        <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.25} />
      </mesh>

      {/* Slightly larger glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.68, 36, 36]} />
        <meshBasicMaterial color="#818cf8" wireframe transparent opacity={0.08} />
      </mesh>

      {/* Latitude rings for tech-globe feel */}
      {[-0.8, 0, 0.8].map((y, i) => {
        const radius = Math.sqrt(1.6 * 1.6 - y * y);
        return (
          <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius - 0.005, radius + 0.005, 80]} />
            <meshBasicMaterial color="#a5b4fc" transparent opacity={0.35} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </group>
  );
};

/* ───────── Dot sphere overlay ───────── */
const DotSphere = () => {
  const ref = useRef();
  const positions = useMemo(() => {
    const pts = [];
    const count = 600;
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(1 - (2 * i) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 1.62;
      pts.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
    }
    return new Float32Array(pts);
  }, []);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.15;
      ref.current.rotation.x += delta * 0.04;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#c7d2fe" size={0.025} sizeAttenuation transparent opacity={0.55} />
    </points>
  );
};

/* ───────── Mouse parallax controller ───────── */
const Parallax = ({ children }) => {
  const groupRef = useRef();
  const mouse = useRef({ x: 0, y: 0 });
  const { size } = useThree();

  const handlePointerMove = useCallback(
    (e) => {
      mouse.current.x = (e.clientX / size.width - 0.5) * 2;
      mouse.current.y = -(e.clientY / size.height - 0.5) * 2;
    },
    [size]
  );

  // Attach listener on the canvas parent
  React.useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [handlePointerMove]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y +=
        (mouse.current.x * 0.15 - groupRef.current.rotation.y) * 0.04;
      groupRef.current.rotation.x +=
        (mouse.current.y * 0.1 - groupRef.current.rotation.x) * 0.04;
    }
  });

  return <group ref={groupRef}>{children}</group>;
};

/* ───────── Exported component ───────── */
const Globe3D = () => {
  return (
    <div className="w-full h-full" style={{ minHeight: 340 }}>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[4, 3, 5]} intensity={0.8} color="#818cf8" />
        <pointLight position={[-3, -2, 3]} intensity={0.3} color="#6366f1" />

        {/* Stars */}
        <Stars />

        {/* Globe with parallax */}
        <Parallax>
          <WireGlobe />
          <DotSphere />
        </Parallax>
      </Canvas>
    </div>
  );
};

export default Globe3D;
