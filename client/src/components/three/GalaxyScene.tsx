import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useUniverseStore } from "../../stores/universeStore";
import { useProgressStore } from "../../stores/progressStore";
import { useAuthStore } from "../../stores/authStore";

function Stars() {
  const pointsRef = useRef<THREE.Points | null>(null);
  const positions = useMemo(() => {
    const count = 1200;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 80 * Math.random();
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    const p = pointsRef.current;
    if (!p) return;
    p.rotation.y += delta * 0.03;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        color="#c4b5fd"
        transparent
        opacity={0.55}
        depthWrite={false}
      />
    </points>
  );
}

function PlanetMesh({
  position,
  color,
  onClick,
  isActive,
}: {
  position: THREE.Vector3;
  color: string;
  onClick: () => void;
  isActive: boolean;
}) {
  const meshRef = useRef<THREE.Mesh | null>(null);

  // Create a subtle bump texture for surface detail
  const bumpTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.createImageData(256, 256);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 0.1 + 0.5; // Subtle noise
      data[i] = data[i + 1] = data[i + 2] = Math.floor(noise * 255); // RGB
      data[i + 3] = 255; // Alpha
    }

    ctx.putImageData(imageData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  useFrame((_, delta) => {
    meshRef.current && (meshRef.current.rotation.y += delta * 0.35);
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerDown={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <sphereGeometry args={[2.6, 64, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 0.8 : 0.4}
          metalness={0.2}
          roughness={0.6}
          clearcoat={0.3}
          clearcoatRoughness={0.1}
          bumpMap={bumpTexture}
          bumpScale={0.02}
        />
      </mesh>

      {/* Inner glow for depth */}
      <mesh>
        <sphereGeometry args={[2.7, 64, 64]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isActive ? 0.15 : 0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Outer atmospheric glow */}
      <mesh>
        <sphereGeometry args={[3.1, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isActive ? 0.25 : 0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Invisible hit area improves clicking accuracy */}
      <mesh>
        <sphereGeometry args={[3.9, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

function TopicNode({
  position,
  planetColor,
  onClick,
}: {
  position: THREE.Vector3;
  planetColor: string;
  onClick: () => void;
}) {
  const ref = useRef<THREE.Mesh | null>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.position.y += Math.sin(ref.current.position.x + ref.current.position.z + delta * 2) * 0.0003;
    ref.current.rotation.y += delta * 0.5;
  });

  return (
    <group position={position}>
      <mesh
        ref={ref}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          onClick();
        }}
        scale={hovered ? 1.35 : 1}
      >
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshStandardMaterial
          color={planetColor}
          emissive={planetColor}
          emissiveIntensity={hovered ? 1.4 : 0.9}
          roughness={0.3}
          metalness={0.15}
        />
      </mesh>
      <mesh scale={1.4} position={[0, 0, 0]}>
        <sphereGeometry args={[0.65, 16, 16]} />
        <meshBasicMaterial
          color={planetColor}
          transparent
          opacity={hovered ? 0.25 : 0.14}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* label is intentionally omitted in 3D to keep scene clean */}
    </group>
  );
}

function CameraRig({ children }: { children: React.ReactNode }) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const transition = useRef<{ active: boolean; targetPos: THREE.Vector3; targetLookAt: THREE.Vector3 }>({
    active: false,
    targetPos: new THREE.Vector3(),
    targetLookAt: new THREE.Vector3(),
  });

  useFrame(() => {
    const t = transition.current;
    if (!t.active) return;

    const pos = new THREE.Vector3().copy(camera.position);
    pos.lerp(t.targetPos, 0.08);
    camera.position.copy(pos);

    const ctrl = controlsRef.current;
    if (ctrl?.target) {
      ctrl.target.lerp(t.targetLookAt, 0.08);
      ctrl.update();
    }

    if (camera.position.distanceTo(t.targetPos) < 0.25) {
      transition.current.active = false;
    }
  });

  // Expose transition control via custom events (simple/robust for this app).
  useEffect(() => {
    const onTransition = (e: any) => {
      transition.current.targetPos = e.detail.pos;
      transition.current.targetLookAt = e.detail.lookAt;
      transition.current.active = true;
      const ctrl = controlsRef.current;
      if (ctrl) ctrl.enableDamping = true;
    };
    window.addEventListener("universe:cameraTransition", onTransition as any);
    return () => window.removeEventListener("universe:cameraTransition", onTransition as any);
  }, []);

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom
        enableRotate
        minDistance={8}
        maxDistance={80}
        makeDefault
        enableDamping
        dampingFactor={0.07}
      />
      {children}
    </>
  );
}

export default function GalaxyScene() {
  const { planets, selectedPlanetSlug, selectPlanet, selectTopic } = useUniverseStore();
  const { upsertProgress } = useProgressStore();
  const { status: authStatus, accessToken } = useAuthStore();
  const canPersist = authStatus === "authenticated" && Boolean(accessToken);

  const planetPositions = useMemo(() => {
    const base = new THREE.Vector3(0, 0, 0);
    const radius = 22;
    return planets.map((p, i) => {
      const theta = (i / Math.max(1, planets.length)) * Math.PI * 2 + Math.PI * 0.15;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      const y = Math.sin(theta * 2) * 0.2;
      return { slug: p.planet.slug, position: base.clone().add(new THREE.Vector3(x, y, z)) };
    });
  }, [planets]);

  const selectedPlanet = selectedPlanetSlug
    ? planets.find((p) => p.planet.slug === selectedPlanetSlug) || null
    : null;

  const galaxyCamera = new THREE.Vector3(0, 12, 38);
  const originLookAt = new THREE.Vector3(0, 0, 0);

  useEffect(() => {
    // Drive camera transitions whenever a planet/cluster is selected.
    const dispatch = (pos: THREE.Vector3, lookAt: THREE.Vector3) => {
      window.dispatchEvent(
        new CustomEvent("universe:cameraTransition", {
          detail: { pos, lookAt },
        })
      );
    };

    if (!selectedPlanetSlug) {
      dispatch(galaxyCamera, originLookAt);
      return;
    }

    const match = planetPositions.find((p) => p.slug === selectedPlanetSlug);
    if (!match) return;
    const lookAt = match.position.clone();
    const dir = match.position.clone().normalize();
    const targetPos = match.position
      .clone()
      .add(dir.multiplyScalar(18))
      .add(new THREE.Vector3(0, 8, 0));
    dispatch(targetPos, lookAt);
  }, [selectedPlanetSlug, planetPositions]);

  const showTopics = Boolean(selectedPlanet && selectedPlanetSlug);

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 12, 38], fov: 45, near: 0.1, far: 200 }}
      onPointerMissed={() => {
        // Clicking empty space returns to galaxy.
        if (selectedPlanetSlug) selectPlanet(null);
      }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[15, 25, 15]} intensity={1.0} />
      <pointLight position={[-15, -5, -15]} intensity={0.6} />
      <pointLight position={[0, -20, 10]} intensity={0.4} />

      <Stars />
      <CameraRig>
        {/* Planet ring */}
        {planetPositions.map(({ slug, position }) => {
          const p = planets.find((pp) => pp.planet.slug === slug);
          if (!p) return null;
          const isActive = selectedPlanetSlug === slug;
          return (
            <PlanetMesh
              key={slug}
              position={position}
              color={p.planet.themeColor}
              isActive={isActive}
              onClick={() => {
                if (selectedPlanetSlug === slug) {
                  selectPlanet(null);
                  return;
                }
                selectPlanet(slug);
              }}
            />
          );
        })}

        {/* Topic nodes for selected cluster */}
        {showTopics && selectedPlanet ? (
          <>
            {selectedPlanet.topics.map((topic, idx) => {
              const angle = (idx / Math.max(1, selectedPlanet.topics.length)) * Math.PI * 2;
              const r = 6.2;
              const x = Math.cos(angle) * r;
              const z = Math.sin(angle) * r;
              const y = ((idx % 2) - 0.5) * 0.9;
              const match = planetPositions.find((pp) => pp.slug === selectedPlanetSlug);
              const base = match?.position || new THREE.Vector3(0, 0, 0);
              const pos = base.clone().add(new THREE.Vector3(x, y, z));
              return (
                <TopicNode
                  key={topic.id}
                  position={pos}
                  planetColor={selectedPlanet.planet.themeColor}
                  onClick={async () => {
                    selectTopic(topic);
                    // Mark as in-progress when user opens the panel (auth only).
                    if (canPersist) {
                      await upsertProgress(topic.id, {
                        status: "in_progress",
                        lastStepIndex: 0,
                        attempts: 0,
                      });
                    }
                  }}
                />
              );
            })}
          </>
        ) : null}

        {/* Return-to-galaxy hint */}
        {showTopics ? (
          <mesh position={[0, -8, 0]} visible={false}>
            {/* placeholder; no 3D button to keep it simple */}
          </mesh>
        ) : null}
      </CameraRig>
    </Canvas>
  );
}

