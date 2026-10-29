import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Sun({ position = [-1000, 100, 0], solarWeatherLevel }) {
 const meshRef = useRef();

 useFrame((state, delta) => {
 if (!meshRef.current) return;
 meshRef.current.rotation.y += delta * 0.02;
 const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.01;
 meshRef.current.scale.set(pulse, pulse, pulse);
 });

 const lightColor =
 solarWeatherLevel === "critical" ? "#F85149" :
 solarWeatherLevel === "high" ? "#FF8C00" :
 solarWeatherLevel === "elevated" ? "#D29922" : "#fff5e0";

 const intensity =
 solarWeatherLevel === "critical" ? 3.0 :
 solarWeatherLevel === "high" ? 2.5 : 2.0;

 return (
 <group position={position}>
 {/* Sun body — visible as distant star */}
 <mesh ref={meshRef}>
 <sphereGeometry args={[50, 32, 32]} />
 <meshBasicMaterial color="#ffcc00" />
 </mesh>

 {/* Corona */}
 <mesh>
 <sphereGeometry args={[60, 32, 32]} />
 <meshBasicMaterial
 color={lightColor}
 transparent
 opacity={0.12}
 blending={THREE.NormalBlending}
 depthWrite={false}
 />
 </mesh>

 {/* Directional light — main scene illumination */}
 <directionalLight
 position={[0, 0, 0]}
 intensity={intensity}
 color={lightColor}
 />
 </group>
 );
}
