import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SCALE = 0.4;

export default function SatelliteModel({ position, alertLevel = "nominal" }) {
 const groupRef = useRef();
 const glowRef = useRef();

 const targetPos = useMemo(() => {
 if (!position || position.x === undefined || position.y === undefined) return new THREE.Vector3(0, 0, 0);
 return new THREE.Vector3(position.x * SCALE, 0, position.y * SCALE);
 }, [position?.x, position?.y]);

 useFrame((state, delta) => {
 if (!groupRef.current) return;
 groupRef.current.position.lerp(targetPos, 0.08);
 groupRef.current.rotation.y += delta * 0.2;
 
 // Pulse glow ring when alert
 if (glowRef.current && alertLevel !== "nominal") {
 const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
 glowRef.current.scale.set(pulse, pulse, pulse);
 }
 });

 // Dynamic colors based on alert level
 const bodyColor = alertLevel === "danger" ? "#F85149" : 
 alertLevel === "warning" ? "#D29922" : "#e2e8f0";
 
 const glowColor = alertLevel === "danger" ? "#F85149" : 
 alertLevel === "warning" ? "#D29922" : null;

 const bodyMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
 color: bodyColor, roughness: 0.5, metalness: 0.8 
 }), [bodyColor]);
 
 const panelMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
 color: "#1F2A36", roughness: 0.2, metalness: 0.9 
 }), []);

 return (
 <group ref={groupRef} position={position && position.x !== undefined ? [position.x * SCALE, 0, position.y * SCALE] : [0, 0, 0]}>
 {/* Main Bus */}
 <mesh material={bodyMaterial}>
 <boxGeometry args={[0.5, 0.5, 0.5]} />
 </mesh>

 {/* Solar Panel Array Left */}
 <mesh material={panelMaterial} position={[-0.8, 0, 0]}>
 <boxGeometry args={[1.0, 0.02, 0.6]} />
 </mesh>

 {/* Solar Panel Array Right */}
 <mesh material={panelMaterial} position={[0.8, 0, 0]}>
 <boxGeometry args={[1.0, 0.02, 0.6]} />
 </mesh>
 
 {/* Connector arms */}
 <mesh material={bodyMaterial} position={[-0.3, 0, 0]}>
 <cylinderGeometry args={[0.02, 0.02, 0.4]} rotation={[0, 0, Math.PI / 2]} />
 </mesh>
 <mesh material={bodyMaterial} position={[0.3, 0, 0]}>
 <cylinderGeometry args={[0.02, 0.02, 0.4]} rotation={[0, 0, Math.PI / 2]} />
 </mesh>
 
 {/* Antenna */}
 <mesh material={bodyMaterial} position={[0, 0.4, 0]}>
 <cylinderGeometry args={[0.02, 0.02, 0.3]} />
 </mesh>

 {/* Alert glow ring — only visible during warning/danger */}
 {glowColor && (
 <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]}>
 <ringGeometry args={[1.0, 1.3, 32]} />
 <meshBasicMaterial 
 color={glowColor} 
 transparent 
 opacity={0.6} 
 blending={THREE.NormalBlending} 
 depthWrite={false} 
 side={THREE.DoubleSide} 
 />
 </mesh>
 )}
 </group>
 );
}
