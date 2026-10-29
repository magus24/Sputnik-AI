import { useState, useMemo } from "react";
import SpaceScene3D from "../components/SpaceScene3D.jsx";
import SatelliteStatusPanel from "../components/SatelliteStatusPanel.jsx";
import AlertsPanel from "../components/AlertsPanel.jsx";
import EarthMonitorPanel from "../components/EarthMonitorPanel.jsx";
import { GlobalErrorBoundary } from "../ErrorBoundary.jsx";
import PriorityQueuePanel from "../components/PriorityQueuePanel.jsx";
import AIDecisionPanel from "../components/AIDecisionPanel.jsx";
import SystemActionsPanel from "../components/SystemActionsPanel.jsx";
import { useProgress } from "@react-three/drei";
import { useSputnikWebSocket } from "../services/api.js";
import SolarStormUI from "../components/SolarStormUI.jsx";

function LoaderOverlay() {
 const { active, progress } = useProgress();
 if (!active) return null;
 return (
 <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B0F14] z-50 gap-4 rounded-[24px]">
 <div className="w-12 h-12 border-4 border-[#1F2A36] border-t-[#4C82F7] rounded-full animate-spin" />
 <span className="text-[#4C82F7] text-xs font-bold tracking-[0.3em] uppercase animate-pulse">
 Sinxronizatsiya... {progress.toFixed(0)}%
 </span>
 </div>
 );
}

export default function Dashboard() {
 const { state, error, isConnected } = useSputnikWebSocket();
 const [selectedObjectId, setSelectedObjectId] = useState(null);
 const [speedMultiplier, setSpeedMultiplier] = useState(1);

 const activeThreatObj = useMemo(() => {
 if (!state || !state.hazard_objects || !state.primary_hazard_id) return null;
 return state.hazard_objects.find(h => h.id === state.primary_hazard_id);
 }, [state]);

 const activeAlertsCount = state?.events?.length || 0;

 if (error && !state) {
 return (
 <div className="flex items-center justify-center h-screen w-screen bg-[#0B0F14]">
 <div className="bg-[#111821] text-[#E6EDF3] p-8 border border-[#1F2A36] rounded-2xl max-w-md text-center space-y-6">
 <div className="text-5xl">📡</div>
 <h2 className="text-xl font-black text-[#F85149] uppercase tracking-widest">Tizim Xatosi</h2>
 <p className="text-sm text-[#9BA7B4] leading-relaxed">{error}</p>
 <button className="w-full bg-[#F85149] hover:bg-[#F85149] px-6 py-3 rounded-xl text-[#E6EDF3] font-bold transition-all " onClick={() => window.location.reload()}>Qayta ulanish</button>
 </div>
 </div>
 );
 }

 if (!state) {
 return (
 <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#0B0F14] space-y-4">
 <div className="w-12 h-12 border-4 border-[#1F2A36] border-t-[#4C82F7] rounded-full animate-spin" />
 <span className="text-[#9BA7B4] text-[10px] font-bold tracking-[0.3em] uppercase animate-pulse">Sun'iy yo'ldoshga ulanilmoqda...</span>
 </div>
 );
 }

 return (
 <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#0B0F14] text-[#E6EDF3] font-sans selection:bg-[#4C82F7] relative">
 <SolarStormUI />
 {/* Header */}
 <header className="flex items-center justify-between px-8 py-4 border-b border-[#1F2A36] bg-[#111821] shrink-0 z-20">
 <div className="flex items-center gap-4">
 <div className="relative group">
 <div className="absolute -inset-1 from-blue-600 to-cyan-[#3BAFDA] rounded-full hidden transition duration-1000 group-hover:duration-200"></div>
 <div className="relative w-12 h-12 bg-[#111821] rounded-full flex items-center justify-center text-2xl border border-[#1F2A36]">🛰️</div>
 </div>
 <div className="flex flex-col">
 <h1 className="text-2xl font-black tracking-tighter text-[#E6EDF3] uppercase leading-none italic">
 Sputnik <span className="text-[#4C82F7]">AI</span>
 </h1>
 <div className="flex items-center gap-2 mt-2">
 <span className="text-[9px] text-[#9BA7B4] font-black uppercase tracking-[0.25em] opacity-70">Avtonom Boshqaruv Tizimi</span>
 </div>
 </div>
 </div>

 <div className="hidden xl:flex items-center gap-10">
 <HeaderStat icon="🛡️" label="Tizim holati" value="BARQAROR" color="text-[#3FB950]" />
 <HeaderStat icon="🧠" label="AI Rejimi" value="AKTIV" color="text-[#4C82F7]" />
 <HeaderStat icon="📅" label="Missiya Kuni" value="12" color="text-slate-100" font="font-mono" />
 </div>

 <div className="flex items-center gap-4">
 <button 
 onClick={async () => {
 const nextSpeed = speedMultiplier === 1 ? 5 : 1;
 setSpeedMultiplier(nextSpeed);
 try {
 await fetch('/api/speed', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ multiplier: nextSpeed })
 });
 } catch (e) {
 console.error("Failed to set speed", e);
 }
 }}
 className={`px-5 py-2 rounded-xl flex items-center gap-3 transition-all border cursor-pointer ${speedMultiplier > 1 ? 'bg-[#4C82F7] border-[#1F2A36] text-[#4C82F7] ' : 'bg-[#111821] border-[#1F2A36] text-[#9BA7B4] hover:bg-[#21262D]'}`}
 >
 <span>⏩</span>
 <span className="font-black text-xs tracking-widest uppercase">Tezlashtirish</span>
 <div className={`w-8 h-6 rounded flex items-center justify-center text-[10px] font-black ${speedMultiplier > 1 ? 'bg-[#4C82F7] text-[#E6EDF3]' : 'bg-slate-800 text-slate-300'}`}>
 {speedMultiplier}x
 </div>
 </button>

 <div className="bg-[#F85149] border border-[#1F2A36] text-[#F85149] px-5 py-2 rounded-xl flex items-center gap-3 transition-all hover:bg-[#F85149] cursor-pointer ">
 <span className="animate-pulse">⚠️</span>
 <span className="font-black text-xs tracking-widest uppercase">Ogohlantirish</span>
 <div className="bg-[#F85149] text-[#E6EDF3] w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black ">
 {activeAlertsCount}
 </div>
 </div>
 </div>
 </header>

 {/* Main Content */}
 <div 
 style={{ padding: '20px', gap: '20px', display: 'flex', flex: 1, overflow: 'hidden' }}
 >
 
 {/* Left Column */}
 <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }} className="custom-scrollbar pr-1">
 <SatelliteStatusPanel telemetry={state.telemetry} healthStatus={state.health_status} />
 <AlertsPanel events={state.events} />
 <EarthMonitorPanel earthEvents={state.earth_events} />
 </div>

 {/* Middle Column (MAXIMIZED) */}
 <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: '400px' }}>
 {/* 3D Scene */}
 <div style={{ flex: 1, borderRadius: '24px', border: '1px solid #1F2A36', overflow: 'hidden', position: 'relative', backgroundColor: '#0B0F14', }}>
 <LoaderOverlay />
 <GlobalErrorBoundary>
 <SpaceScene3D
 state={state}
 selectedObjectId={selectedObjectId}
 onSelectObject={setSelectedObjectId}
 />
 </GlobalErrorBoundary>
 </div>
 </div>

 {/* Right Column */}
 <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }} className="custom-scrollbar pr-1">
 <AIDecisionPanel 
 decision={state.decision} 
 reason={state.reason} 
 collisionRisk={state.collision_risk} 
 missionRisk={state.combined_mission_risk_score} 
 />

 <div style={{ backgroundColor: '#0F1720', borderRadius: '24px', border: '1px solid #1F2A36', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', }}>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#111821', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#4C82F7', border: '1px solid #1F2A36' }}>🚀</div>
 <h3 style={{ fontSize: '9px', fontWeight: '900', color: '#E6EDF3', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
 Amaliyot
 </h3>
 </div>
 {state.avoidance_active && <div className="text-[8px] text-[#4C82F7] font-black animate-pulse uppercase tracking-[0.1em]">Aktiv</div>}
 </div>

 <div className="space-y-3 px-1">
 <div style={{ fontSize: '10px', fontWeight: '700', color: '#9BA7B4', lineHeight: '1.4' }}>
 {state.avoidance_active ? "Orbital manevr bajarilmoqda..." : "Tizim kutish rejimida."}
 </div>
 <div className="relative pt-1">
 <div style={{ height: '6px', backgroundColor: '#1F2A36', borderRadius: '10px', overflow: 'hidden', border: '1px solid #1F2A36' }}>
 <div 
 style={{ 
 width: state.avoidance_active ? '65%' : '0%',
 height: '100%',
 background: '#4C82F7',
 transition: 'width 1s ease-in-out'
 }}
 ></div>
 </div>
 </div>
 </div>
 </div>

 <PriorityQueuePanel priorityQueue={state.priority_queue} />
 <SystemActionsPanel decision={state.decision} />
 
 <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '16px', borderTop: '1px solid #1F2A36', paddingLeft: '4px', paddingRight: '4px' }}>
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '8px', fontWeight: '900', color: '#9BA7B4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
 <span>AI CONTROL CENTER</span>
 <span style={{ color: isConnected ? '#3FB950' : '#F85149' }}>{isConnected ? 'ONLINE' : 'OFFLINE'}</span>
 </div>
 </div>
 </div>

 </div>
 
 <style>{`
 .custom-scrollbar::-webkit-scrollbar { width: 4px; }
 .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
 .custom-scrollbar::-webkit-scrollbar-thumb { background: #30363D; border-radius: 10px; }
 .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #484F58; }
 `}</style>
 </div>
 );
}

function HeaderStat({ icon, label, value, color, font = "" }) {
 return (
 <div className="flex items-center gap-3">
 <span className="text-xl opacity-80">{icon}</span>
 <div className="flex flex-col">
 <span className="text-[8px] text-[#9BA7B4] font-black uppercase tracking-[0.2em] mb-0.5">{label}</span>
 <span className={`text-[13px] font-black tracking-tight ${color} ${font}`}>{value}</span>
 </div>
 </div>
 );
}

