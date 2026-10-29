import { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

const MOON_ORBIT_RADIUS = 55; // visual orbit radius around Earth in scene units
const MOON_ORBIT_SPEED = 0.08; // radians per second — slow, smooth

export default function Moon() {
 const meshRef = useRef();
 const angleRef = useRef(0);

 const colorMap = useLoader(THREE.TextureLoader, "/textures/earth-topology.png");

 useFrame((_, delta) => {
 if (!meshRef.current) return;
 
 // Smooth client-side orbit
 angleRef.current += delta * MOON_ORBIT_SPEED;
 
 meshRef.current.position.x = Math.cos(angleRef.current) * MOON_ORBIT_RADIUS;
 meshRef.current.position.z = Math.sin(angleRef.current) * MOON_ORBIT_RADIUS;
 meshRef.current.position.y = Math.sin(angleRef.current * 0.3) * 3; // slight y wobble
 
 meshRef.current.rotation.y += delta * 0.1;
 });

 return (
 <mesh ref={meshRef}>
 <sphereGeometry args={[2.5, 32, 32]} />
 <meshStandardMaterial
 color="#aaaaaa"
 bumpMap={colorMap}
 bumpScale={0.05}
 roughness={1.0}
 metalness={0.0}
 flatShading
 />
 </mesh>
 );
}
