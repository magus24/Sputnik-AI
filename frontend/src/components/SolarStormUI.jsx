import React, { useEffect, useState } from "react";
import { systemState, subscribeToState } from "../SolarStormSystem.js";

/**
 * SolarStormUI
 * 
 * 6. UI Integration (Uzbek language)
 * Displays standalone alerts directly mapped to the standalone solar storm state.
 */
export default function SolarStormUI() {
 const [state, setState] = useState({ ...systemState });

 useEffect(() => {
 // Subscribe to state changes triggered by the 3D loop's updateEvents
 const unsubscribe = subscribeToState((newState) => {
 setState(newState);
 });
 return unsubscribe;
 }, []);

 if (!state.solarStorm && !state.safeMode) {
 return null; // Don't render anything if normal
 }

 return (
 <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
 {state.solarStorm && (
 <div className="bg-red-900/80 border-2 border-[#F85149] rounded-xl px-6 py-4 flex flex-col items-center justify-center animate-pulse ">
 <span className="text-[#E6EDF3] font-black tracking-widest text-lg">QUYOSH BO‘RONI: FAOL</span>
 <span className="text-red-200 font-bold tracking-wider text-sm mt-1">INTENSIVLIK: YUQORI</span>
 </div>
 )}
 
 {state.safeMode && (
 <div className="bg-orange-900/80 border-2 border-orange-500 rounded-xl px-6 py-3 flex flex-col items-center justify-center ">
 <span className="text-[#E6EDF3] font-black tracking-widest text-md">SAFE MODE YOQILDI</span>
 <span className="text-orange-200 font-bold text-xs mt-1">
 Signal Kuchi: {Math.round(state.signalStrength)}%
 </span>
 </div>
 )}
 </div>
 );
}
