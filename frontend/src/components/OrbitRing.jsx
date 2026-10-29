import { useMemo } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";

const SCALE = 0.4;
const ORBIT_RADIUS = 50 * SCALE;

export default function OrbitRing({ satAngle }) {
 const points = useMemo(() => {
 const pts = [];
 for (let i = 0; i <= 128; i++) {
 const a = (i / 128) * Math.PI * 2;
 pts.push(new THREE.Vector3(Math.cos(a) * ORBIT_RADIUS, 0, Math.sin(a) * ORBIT_RADIUS));
 }
 return pts;
 }, []);

 const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

 const projectedPoints = useMemo(() => {
 if (satAngle === undefined || satAngle === null || isNaN(satAngle)) return [];
 const pts = [];
 const SATELLITE_SPEED = 6.0;
 const PREDICTION_STEPS = 15;
 for(let i=0; i<=PREDICTION_STEPS; i++) {
 const angle = (satAngle + SATELLITE_SPEED * i) * (Math.PI / 180);
 pts.push(new THREE.Vector3(Math.cos(angle) * ORBIT_RADIUS, 0, Math.sin(angle) * ORBIT_RADIUS));
 }
 return pts;
 }, [satAngle]);

 return (
 <group>
 <line geometry={geometry}>
 <lineBasicMaterial color='#4C82F7' opacity={0.2} transparent linewidth={1} />
 </line>

 {projectedPoints.length > 0 && (
 <Line
 points={projectedPoints}
 color='#4C82F7'
 lineWidth={2}
 opacity={0.8}
 transparent
 dashed
 dashSize={0.5}
 gapSize={0.5}
 />
 )}
 </group>
 );
}
