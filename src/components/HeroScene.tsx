import { Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

type PointerTarget = { x: number; y: number };

const scenePalette = {
  ember: "#ff6a10",
  amber: "#ff9a3d",
  copper: "#7a3214",
  midnight: "#150c08",
  cool: "#93b9ca",
};

function HeroObject({
  mobile,
  reduced,
  pointer,
}: {
  mobile: boolean;
  reduced: boolean;
  pointer: React.RefObject<PointerTarget>;
}) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const shell = useRef<THREE.Mesh>(null);
  const orbit = useRef<THREE.Group>(null);
  const coreMat = useRef<THREE.MeshStandardMaterial>(null);
  const glow = useRef<THREE.PointLight>(null);
  const t = useRef(0);

  useFrame(({ camera }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    t.current += delta;
    const time = t.current;
    const px = reduced ? 0 : pointer.current?.x ?? 0;
    const py = reduced ? 0 : pointer.current?.y ?? 0;
    const ease = 1 - Math.exp(-3.6 * delta);

    if (group.current) {
      group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, px * 0.42, ease);
      group.current.position.y = THREE.MathUtils.lerp(
        group.current.position.y,
        -py * 0.26 + Math.sin(time * 0.55) * 0.22,
        ease,
      );
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, py * 0.22, ease);
      group.current.rotation.z = THREE.MathUtils.lerp(
        group.current.rotation.z,
        -px * 0.16 + Math.sin(time * 0.3) * 0.05,
        ease,
      );
    }
    if (core.current) {
      core.current.rotation.y += delta * 0.35;
      core.current.rotation.x += delta * 0.12;
    }
    if (shell.current) {
      shell.current.rotation.y -= delta * 0.18;
      shell.current.rotation.x += delta * 0.07;
    }
    if (orbit.current) orbit.current.rotation.z += delta * 0.1;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, px * 0.22, ease);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, -py * 0.16, ease);
    camera.lookAt(0, 0, 0);

    const pulse = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(time * 1.05));
    if (coreMat.current) coreMat.current.emissiveIntensity = 0.5 + pulse * 1.5;
    if (glow.current) glow.current.intensity = 8 + pulse * 14;
  });

  const segments = mobile ? [128, 12] : [220, 24];
  const satellites = useMemo(
    () =>
      Array.from({ length: mobile ? 5 : 8 }, (_, index) => {
        const angle = (index / (mobile ? 5 : 8)) * Math.PI * 2;
        const radius = 2.35 + (index % 2) * 0.3;
        return {
          position: [Math.cos(angle) * radius, Math.sin(angle) * radius, Math.sin(angle * 2) * 0.42] as [
            number,
            number,
            number,
          ],
          scale: 0.045 + (index % 3) * 0.018,
        };
      }),
    [mobile],
  );

  return (
    <group ref={group} scale={mobile ? 0.8 : 1}>
      <pointLight ref={glow} position={[0, 0, 1.6]} color={scenePalette.amber} distance={14} intensity={12} />
      <mesh ref={core}>
        <torusKnotGeometry args={[1.15, 0.34, segments[0], segments[1], 2, 3]} />
        <meshStandardMaterial
          ref={coreMat}
          color={scenePalette.midnight}
          emissive={scenePalette.ember}
          emissiveIntensity={1.2}
          roughness={0.25}
          metalness={0.85}
        />
      </mesh>
      <mesh ref={shell} scale={1.75}>
        <icosahedronGeometry args={[1.15, mobile ? 1 : 2]} />
        <meshBasicMaterial
          color={scenePalette.amber}
          wireframe
          transparent
          opacity={mobile ? 0.12 : 0.16}
        />
      </mesh>
      <group ref={orbit} rotation-x={Math.PI / 3.4}>
        <mesh>
          <torusGeometry args={[2.55, 0.012, 6, 180]} />
          <meshBasicMaterial color={scenePalette.copper} transparent opacity={0.5} />
        </mesh>
        {satellites.map((satellite, index) => (
          <mesh key={index} position={satellite.position} scale={satellite.scale}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color={index % 3 === 0 ? scenePalette.cool : scenePalette.amber} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function HeroScene() {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const [mobile, setMobile] = useState(false);
  const [reduced, setReduced] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const pointer = useRef<PointerTarget>({ x: 0, y: 0 });

  useEffect(() => {
    setReady(true);
    setMobile(window.matchMedia("(max-width: 768px)").matches);
    setReduced(prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (mobile || reduced) return;
    const onPointerMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    const onPointerLeave = () => {
      pointer.current.x = 0;
      pointer.current.y = 0;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onPointerLeave);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);
    };
  }, [mobile, reduced]);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setVisible(entries.some((e) => e.isIntersecting)),
      { threshold: 0.01 },
    );
    io.observe(el);
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const dpr = useMemo<[number, number]>(() => (mobile ? [1, 1.5] : [1, 2]), [mobile]);

  return (
    <div
      ref={host}
      aria-hidden="true"
      className="hero-scene pointer-events-none absolute top-1/2 right-[-8%] hidden h-[34rem] w-[34rem] -translate-y-1/2 opacity-90 md:block lg:right-[2%]"
    >
      <span className="heading-glow inset-8" />
      {ready && (
        <Canvas
          className="relative"
          dpr={dpr}
          frameloop={reduced ? "demand" : visible ? "always" : "never"}
          gl={{ antialias: !mobile, powerPreference: "high-performance", alpha: true }}
          camera={{ position: [0, 0, 6], fov: 45 }}
        >
          <ambientLight intensity={0.42} />
          <directionalLight position={[4, 6, 5]} intensity={1.25} color={scenePalette.amber} />
          <directionalLight position={[-4, -2, 3]} intensity={0.7} color={scenePalette.cool} />
          <Suspense fallback={null}>
            <Environment resolution={64}>
              <Lightformer intensity={2.4} position={[0, 5, 1]} scale={[8, 3, 1]} />
              <Lightformer intensity={1.3} color={scenePalette.amber} position={[-5, 0, 1]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
              <Lightformer intensity={0.8} color={scenePalette.cool} position={[5, -1, 0]} rotation-y={-Math.PI / 2} scale={[5, 2, 1]} />
            </Environment>
            <HeroObject mobile={mobile} reduced={reduced} pointer={pointer} />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
