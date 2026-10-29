import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { systemState, updateEvents, aiDecision, applySoftModifiers } from "../SolarStormSystem.js";
import { useRef } from "react";

/**
 * SolarStormExtension
 * 
 * 7. Integration Into Existing Loop
 * Wraps the standalone logic in a React-Three-Fiber hook layer.
 */
export default function SolarStormExtension({ backendCollisionRisk }) {
 const { scene } = useThree();
 const originalBackground = useRef(scene.background);

 // Instead of a raw window.requestAnimationFrame, React-Three-Fiber 
 // provides useFrame which is the exact equivalent for the 3D context.
 useFrame(() => {
 // 1. Run event manager
 updateEvents(backendCollisionRisk);

 // 2. AI Decision Layer
 const decision = aiDecision(systemState);

 // 3. Apply Safe Mode Behaviour (soft effect)
 applySoftModifiers(decision);

 // 5. Visual Solar Storm Effect (Option A: red overlay)
 // Modify the scene background color based on the storm state.
 if (systemState.solarStorm) {
 scene.background = new THREE.Color(0x330000); // Red effect
 } else {
 scene.background = originalBackground.current || new THREE.Color("#050810"); // Restore default
 }
 });

 // No geometry/mesh returned, this component just injects logic and effects into the loop
 return null;
}
