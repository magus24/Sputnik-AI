import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Line } from "@react-three/drei";

const SCALE = 0.4;
const EARTH_3D_RADIUS = 10.0; // slightly larger than visual Earth (9.5) to avoid clipping

function PastTrail({ pastPositions }) {
 const points = useMemo(() => {
 if (!pastPositions || pastPositions.length < 2) return null;
 return pastPositions
 .map(p => new THREE.Vector3(p.x * SCALE, 0, p.y * SCALE))
 .filter(v => v.length() > EARTH_3D_RADIUS);
 }, [pastPositions]);

 if (!points || points.length < 2) return null;

 return (
 <Line
 points={points}
 color="#94a3b8"
 lineWidth={1.5}
 opacity={0.5}
 transparent
 />
 );
}

function FutureTrajectory({ path, isPrimaryThreat, isSelected }) {
 const points = useMemo(() => {
 return path
 .map(p => new THREE.Vector3(p.x * SCALE, 0, p.y * SCALE))
 .filter(v => v.length() > EARTH_3D_RADIUS);
 }, [path]);

 if (!points || points.length < 2) return null;

 if (isPrimaryThreat) {
 return (
 <Line
 points={points}
 color="#F85149"
 lineWidth={2.5}
 opacity={0.9}
 transparent
 />
 );
 }

 if (isSelected) {
 return (
 <Line
 points={points}
 color="#3BAFDA"
 lineWidth={1.5}
 opacity={0.8}
 transparent
 />
 );
 }

 return (
 <Line
 points={points}
 color="#8B949E"
 lineWidth={0.5}
 opacity={0.25}
 transparent
 />
 );
}

function CollisionMarker({ intersectPoint, elapsedTime }) {
 // Pulsing red ring at predicted collision point
 const scale = 1 + Math.sin(elapsedTime * 5) * 0.3;
 
 return (
 <group position={intersectPoint}>
 <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[scale, scale, scale]}>
 <ringGeometry args={[1.5, 2.0, 32]} />
 <meshBasicMaterial color="#F85149" transparent opacity={0.7} side={THREE.DoubleSide} depthWrite={false} />
 </mesh>
 {/* Inner bright dot */}
 <mesh rotation={[-Math.PI / 2, 0, 0]}>
 <circleGeometry args={[0.5, 16]} />
 <meshBasicMaterial color="#F85149" transparent opacity={0.4} blending={THREE.NormalBlending} depthWrite={false} />
 </mesh>
 </group>
 );
}

function HazardPiece({ hazard, isPrimary, isNearest, isSelected, satPosition, onSelect, elapsedTime }) {
 const meshRef = useRef();

 const localScale = useMemo(() => {
 const seed = hazard.id.charCodeAt(hazard.id.length - 1);
 return [
 0.6 + (seed % 3) * 0.15,
 0.6 + (seed % 4) * 0.15,
 0.6 + (seed % 5) * 0.15
 ];
 }, [hazard.id]);

 const target = useMemo(
 () => new THREE.Vector3(hazard.x * SCALE, (Math.sin(hazard.x + hazard.y) * 0.5), hazard.y * SCALE),
 [hazard.x, hazard.y]
 );
 
 const intersectPoint = useMemo(() => {
 if (!isPrimary || !hazard.predicted_path || !hazard.predicted_path.length) return null;

 let index = 0;
 if (hazard.time_to_closest_approach && hazard.time_to_closest_approach > 0) {
 index = Math.min(hazard.time_to_closest_approach - 1, hazard.predicted_path.length - 1);
 } else {
 index = hazard.predicted_path.length - 1;
 }

 const endPoint = hazard.predicted_path[index];
 return new THREE.Vector3(endPoint.x * SCALE, 0, endPoint.y * SCALE);
 }, [isPrimary, hazard.predicted_path, hazard.time_to_closest_approach]);

 useFrame((_, delta) => {
 if (!meshRef.current) return;
 meshRef.current.position.lerp(target, 0.08);
 meshRef.current.rotation.x += delta * 1.5;
 meshRef.current.rotation.z += delta * 0.8;
 });

 const materialColor = useMemo(() => {
 if (hazard.threat_level === "critical" || hazard.threat_level === "high") return "#F85149";
 if (hazard.threat_level === "medium") return "#D29922"; // Yellow/Orange for medium risk
 if (isSelected) return "#3BAFDA";
 return "#8B949E";
 }, [hazard.threat_level, isSelected]);

 return (
 <group>
 {/* Object Body */}
 <group 
 ref={meshRef} 
 position={[hazard.x * SCALE, 0, hazard.y * SCALE]}
 onClick={(e) => {
 e.stopPropagation();
 if (onSelect) onSelect(hazard.id);
 }}
 >
 <mesh scale={localScale}>
 <dodecahedronGeometry args={[0.5, 0]} />
 <meshStandardMaterial
 color={materialColor}
 roughness={0.8}
 metalness={0.5}
 flatShading
 />
 </mesh>
 
 {/* Glow effect for all hazards to make them easier to spot */}
 <mesh scale={[localScale[0] * 1.4, localScale[1] * 1.4, localScale[2] * 1.4]}>
 <dodecahedronGeometry args={[0.5, 0]} />
 <meshBasicMaterial 
 color={materialColor} 
 transparent 
 opacity={isPrimary ? 0.4 : isSelected ? 0.3 : 0.15} 
 blending={THREE.NormalBlending} 
 depthWrite={false} 
 />
 </mesh>

 {/* Extra intense core for primary threat */}
 {isPrimary && (
 <mesh scale={[localScale[0] * 1.8, localScale[1] * 1.8, localScale[2] * 1.8]}>
 <dodecahedronGeometry args={[0.5, 0]} />
 <meshBasicMaterial color="#F85149" transparent opacity={0.2} blending={THREE.NormalBlending} depthWrite={false} />
 </mesh>
 )}
 </group>
 
 {/* Past Trail (history) */}
 <PastTrail pastPositions={hazard.past_positions} />
 
 {/* Future Predicted Path */}
 {hazard.predicted_path && hazard.predicted_path.length > 0 && (
 <FutureTrajectory path={hazard.predicted_path} isPrimaryThreat={isPrimary} isSelected={isSelected} />
 )}
 
 {/* Collision marker — pulsing ring at predicted intersection */}
 {intersectPoint && isPrimary && (
 <CollisionMarker intersectPoint={intersectPoint} elapsedTime={elapsedTime} />
 )}
 </group>
 );
}

export default function HazardField({ hazards, nearestHazardId, primaryHazardId, satPosition, selectedObjectId, onSelectObject }) {
 const satTarget = useMemo(() => {
 if (!satPosition || satPosition.x === undefined || satPosition.y === undefined) return null;
 return new THREE.Vector3(satPosition.x * SCALE, 0, satPosition.y * SCALE);
 }, [satPosition?.x, satPosition?.y]);

 // We need elapsed time for the pulsing collision marker
 const clockRef = useRef(0);
 useFrame((state) => {
 clockRef.current = state.clock.elapsedTime;
 });

 return (
 <group>
 {/* Safety perimeter around satellite */}
 {satTarget && (
 <mesh position={satTarget} rotation={[-Math.PI / 2, 0, 0]}>
 <ringGeometry args={[4.8, 5.0, 64]} />
 <meshBasicMaterial color='#4C82F7' transparent opacity={0.15} side={THREE.DoubleSide} depthWrite={false} />
 </mesh>
 )}

 {(hazards || []).map((h) => (
 <HazardPiece
 key={h.id}
 hazard={h}
 isPrimary={h.id === primaryHazardId}
 isNearest={h.id === nearestHazardId}
 isSelected={h.id === selectedObjectId}
 satPosition={satPosition}
 onSelect={onSelectObject}
 elapsedTime={clockRef.current}
 />
 ))}
 </group>
 );
}
