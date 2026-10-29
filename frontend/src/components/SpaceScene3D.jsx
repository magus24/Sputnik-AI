import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars, OrbitControls, Html } from "@react-three/drei";
import EarthGlobe from "./EarthGlobe.jsx";
import SatelliteModel from "./SatelliteModel.jsx";
import OrbitRing from "./OrbitRing.jsx";
import HazardField from "./HazardField.jsx";
import Moon from "./Moon.jsx";
import Sun from "./Sun.jsx";
import { SceneDebugger } from "../SceneDebugger.jsx";
import { useThree } from "@react-three/fiber";
import SolarStormExtension from "./SolarStormExtension.jsx";

function CameraSetup() {
 useThree(({ camera }) => {
 camera.lookAt(0, 0, 0);
 });
 return null;
}

export default function SpaceScene3D({ state, selectedObjectId, onSelectObject }) {
 return (
 <Canvas
 camera={{ position: [0, 30, 55], fov: 45, near: 0.1, far: 3000 }}
 style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: "#050810" }}
 gl={{ antialias: true, preserveDrawingBuffer: true }}
 onPointerMissed={() => onSelectObject && onSelectObject(null)}
 >
 <CameraSetup />
 <SceneDebugger />
 <color attach="background" args={["#050810"]} />
 <SolarStormExtension backendCollisionRisk={state.collision_risk} />
 
 {/* Lights and Stars outside Suspense to be visible immediately */}
 <ambientLight intensity={1.5} color="#ffffff" />
 <pointLight position={[20, 20, 20]} intensity={200} color="#ffffff" decay={0} />
 <Stars radius={300} depth={200} count={8000} factor={6} saturation={0} fade speed={0.2} />
 
 {state.solar_weather?.level === 'critical' && (
 <directionalLight color="#ff4444" intensity={2} position={[10, 10, 10]} />
 )}

 {/* Sun — very far away, primary illumination */}
 <Sun position={[-1000, 100, 0]} solarWeatherLevel={state.solar_weather?.level} />

 <Suspense fallback={null}>
 <EarthGlobe />
 </Suspense>

 <OrbitRing satAngle={state.satellite?.angle} />
 <Moon />

 <SatelliteModel
 position={state.satellite}
 alertLevel={state.satellite_alert_level || "nominal"}
 />
 
 {state.avoidance_active && (
 <Html position={[
 (state.satellite?.x || 0) * 0.4, 
 2, 
 (state.satellite?.y || 0) * 0.4
 ]} center zIndexRange={[100, 0]}>
 <div className="bg-[#111821] border border-[#3FB950] rounded p-2 whitespace-nowrap pointer-events-none flex flex-col items-start /20">
 <span className="text-[#3FB950] text-[10px] font-bold uppercase tracking-widest mb-1">MANEVR REJALASHTIRILDI</span>
 <span className="text-[#E6EDF3] text-[10px]">Δv: 2.4 m/s</span>
 <span className="text-slate-300 text-[10px]">ETA: 1 daqiqa 12 soniya</span>
 <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#3FB950]"></div>
 </div>
 </Html>
 )}

 <HazardField
 hazards={state.hazard_objects}
 nearestHazardId={state.nearest_hazard_id}
 primaryHazardId={state.primary_hazard_id}
 satPosition={state.satellite}
 selectedObjectId={selectedObjectId}
 onSelectObject={onSelectObject}
 />

 <OrbitControls
 makeDefault
 enablePan={false}
 enableZoom={true}
 minDistance={15}
 maxDistance={2500}
 autoRotate={false}
 maxPolarAngle={Math.PI * 0.72}
 minPolarAngle={Math.PI * 0.18}
 />
 </Canvas>
 );
}
