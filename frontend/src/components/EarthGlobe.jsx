import { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Realistic Earth globe with:
 * - NASA blue marble diffuse texture (local)
 * - Topology bump map (local)
 * - Specular map for ocean highlights (local)
 * - 2-layer atmosphere glow (BackSide rendering)
 *
 * Earth radius = 9.5 (matches backend EARTH_RADIUS)
 */
export default function EarthGlobe() {
 const earthRef = useRef();

 const [dayMap, bumpMap, specMap] = useLoader(THREE.TextureLoader, [
 "/textures/earth-blue-marble.jpg",
 "/textures/earth-topology.png",
 "/textures/earth-water.png",
 ]);

 useFrame((_, delta) => {
 if (earthRef.current) earthRef.current.rotation.y += delta * 0.04;
 });

 return (
 <group>
 {/* Earth surface */}
 <mesh ref={earthRef}>
 <sphereGeometry args={[9.5, 64, 64]} />
 <meshPhongMaterial
 color="#002244"
 map={dayMap}
 bumpMap={bumpMap}
 bumpScale={0.05}
 specularMap={specMap}
 specular={new THREE.Color(0x333333)}
 shininess={25}
 />
 </mesh>

 {/* Inner atmosphere — bright blue rim */}
 <mesh>
 <sphereGeometry args={[9.8, 64, 64]} />
 <meshBasicMaterial
 color="#4da6ff"
 transparent
 opacity={0.12}
 blending={THREE.NormalBlending}
 depthWrite={false}
 side={THREE.BackSide}
 />
 </mesh>

 {/* Outer atmosphere — faint halo */}
 <mesh>
 <sphereGeometry args={[10.5, 64, 64]} />
 <meshBasicMaterial
 color="#1a8cff"
 transparent
 opacity={0.06}
 blending={THREE.NormalBlending}
 depthWrite={false}
 side={THREE.BackSide}
 />
 </mesh>
 </group>
 );
}
