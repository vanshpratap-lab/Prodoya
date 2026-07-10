import { useRef, useMemo, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// ─── Geodesic helpers ────────────────────────────────────────────────────────
function buildIcosahedron(detail = 3) {
  const geo = new THREE.IcosahedronGeometry(1, detail);
  return geo;
}

function uniqueEdges(geometry) {
  const pos = geometry.attributes.position;
  const indexAttr = geometry.index;
  const edgeSet = new Map();
  const addEdge = (a, b) => {
    const key = a < b ? `${a}_${b}` : `${b}_${a}`;
    if (!edgeSet.has(key)) edgeSet.set(key, [a, b]);
  };
  if (indexAttr) {
    for (let i = 0; i < indexAttr.count; i += 3) {
      const a = indexAttr.getX(i), b = indexAttr.getX(i + 1), c = indexAttr.getX(i + 2);
      addEdge(a, b); addEdge(b, c); addEdge(a, c);
    }
  }
  const edges = [];
  for (const [, [a, b]] of edgeSet) {
    const va = new THREE.Vector3().fromBufferAttribute(pos, a);
    const vb = new THREE.Vector3().fromBufferAttribute(pos, b);
    edges.push([va, vb]);
  }
  return edges;
}

function uniqueVertices(geometry) {
  const pos = geometry.attributes.position;
  const map = new Map();
  for (let i = 0; i < pos.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(pos, i);
    const key = `${v.x.toFixed(5)}_${v.y.toFixed(5)}_${v.z.toFixed(5)}`;
    if (!map.has(key)) map.set(key, v);
  }
  return [...map.values()];
}

// ─── Signal (traveling dot on an edge) ───────────────────────────────────────
function SignalDot({ edges }) {
  const meshRef = useRef();
  const state = useRef({
    active: false,
    t: 0,
    speed: 0.012,
    edgeIndex: 0,
    cooldown: Math.random() * 3 + 2,
  });

  useFrame((_, delta) => {
    const s = state.current;
    if (!meshRef.current) return;

    if (!s.active) {
      s.cooldown -= delta;
      if (s.cooldown <= 0) {
        s.active = true;
        s.t = 0;
        s.edgeIndex = Math.floor(Math.random() * edges.length);
        s.speed = Math.random() * 0.01 + 0.008;
        meshRef.current.visible = true;
      }
    } else {
      s.t += delta * s.speed * 60;
      if (s.t >= 1) {
        s.active = false;
        s.cooldown = Math.random() * 4 + 2;
        meshRef.current.visible = false;
      } else {
        const [a, b] = edges[s.edgeIndex];
        meshRef.current.position.lerpVectors(a, b, s.t);
        meshRef.current.material.opacity = Math.sin(s.t * Math.PI);
      }
    }
  });

  return (
    <mesh ref={meshRef} visible={false}>
      <sphereGeometry args={[0.018, 8, 8]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={1}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Pulsing Nodes ────────────────────────────────────────────────────────────
function NodeLayer({ vertices }) {
  const meshRefs = useRef([]);
  const phases = useMemo(
    () => vertices.map(() => Math.random() * Math.PI * 2),
    [vertices]
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    meshRefs.current.forEach((m, i) => {
      if (!m) return;
      const pulse = 0.7 + 0.3 * Math.sin(t * 1.2 + phases[i]);
      m.material.opacity = pulse;
    });
  });

  return (
    <>
      {vertices.map((v, i) => (
        <mesh
          key={i}
          position={[v.x, v.y, v.z]}
          ref={(el) => (meshRefs.current[i] = el)}
        >
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshBasicMaterial
            color="#aef5ff"
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  );
}

// ─── Wireframe Edge Lines ─────────────────────────────────────────────────────
function EdgeLayer({ edges }) {
  const lineSegmentsRef = useRef();

  const { geometry } = useMemo(() => {
    const positions = [];
    for (const [a, b] of edges) {
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return { geometry: geo };
  }, [edges]);

  return (
    <lineSegments ref={lineSegmentsRef} geometry={geometry}>
      <lineBasicMaterial
        color="#00d9ff"
        transparent
        opacity={0.45}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        linewidth={1}
      />
    </lineSegments>
  );
}

// ─── Main sphere group (rotation + mouse tilt) ────────────────────────────────
function HexfeldGroup({ glowColor, rotationSpeed, isMobile }) {
  const groupRef = useRef();
  const mouse = useRef({ x: 0, y: 0 });
  const targetTilt = useRef({ x: 0, y: 0 });

  const { edges, vertices } = useMemo(() => {
    const detail = isMobile ? 2 : 3;
    const geo = buildIcosahedron(detail);
    return { edges: uniqueEdges(geo), vertices: uniqueVertices(geo) };
  }, [isMobile]);

  // Mouse parallax
  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Continuous Y rotation + slight X wobble
    groupRef.current.rotation.y = t * rotationSpeed;
    groupRef.current.rotation.x = Math.sin(t * 0.25) * 0.12;

    // Smooth mouse tilt
    targetTilt.current.x += (mouse.current.y * 0.18 - targetTilt.current.x) * 0.06;
    targetTilt.current.y += (mouse.current.x * 0.18 - targetTilt.current.y) * 0.06;
    groupRef.current.rotation.x += targetTilt.current.x;
    groupRef.current.rotation.z = targetTilt.current.y * 0.3;
  });

  return (
    <group ref={groupRef}>
      <EdgeLayer edges={edges} />
      <NodeLayer vertices={vertices} />
      {!isMobile && edges.slice(0, 3).map((_, i) => (
        <SignalDot key={i} edges={edges} />
      ))}
    </group>
  );
}

// ─── Scene wrapper ─────────────────────────────────────────────────────────────
function Scene({ glowColor, rotationSpeed, particleCount, isMobile }) {
  return (
    <>
      {/* Ambient scene light */}
      <ambientLight intensity={0.1} />

      {/* Sphere */}
      <HexfeldGroup
        glowColor={glowColor}
        rotationSpeed={rotationSpeed}
        isMobile={isMobile}
      />

      {/* Floating particle dust */}
      <Sparkles
        count={isMobile ? Math.floor(particleCount * 0.4) : particleCount}
        scale={3.5}
        size={1.2}
        speed={0.25}
        opacity={0.55}
        color="#22e5ff"
      />

      {/* Bloom post-processing (desktop only) */}
      {!isMobile && (
        <EffectComposer>
          <Bloom
            intensity={1.8}
            luminanceThreshold={0.05}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      )}
    </>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────
/**
 * HexfeldSphere — 3D geodesic wireframe sphere with glow, particles, and bloom.
 *
 * @param {number}  size           – world-space radius scale (default 1)
 * @param {number}  rotationSpeed  – radians per second (default 0.22)
 * @param {string}  glowColor      – primary edge colour (default '#00d9ff')
 * @param {number}  particleCount  – dust-mote sparkle count (default 120)
 * @param {string}  height         – CSS height of the canvas wrapper (default '520px')
 */
export default function HexfeldSphere({
  size = 1,
  rotationSpeed = 0.22,
  glowColor = '#00d9ff',
  particleCount = 120,
  height = '520px',
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height,
        background: 'transparent',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <Canvas
        camera={{ position: [0, 0.4, 3.2], fov: 48 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        dpr={isMobile ? 1 : Math.min(window.devicePixelRatio, 2)}
      >
        <Suspense fallback={null}>
          <Scene
            glowColor={glowColor}
            rotationSpeed={rotationSpeed}
            particleCount={particleCount}
            isMobile={isMobile}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
