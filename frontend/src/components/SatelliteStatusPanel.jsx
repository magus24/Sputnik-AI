export default function SatelliteStatusPanel({ telemetry, healthStatus }) {
 if (!telemetry) return null;

 const getBarColor = (val, thresholds) => {
 if (val <= thresholds.critical) return "from-red-500 to-red-600";
 if (val <= thresholds.warning) return "from-yellow-400 to-yellow-500";
 return "from-[#3FB950] to-emerald-500";
 };

 const getTextColor = (val, thresholds) => {
 if (val <= thresholds.critical) return "text-[#F85149]";
 if (val <= thresholds.warning) return "text-yellow-400";
 return "text-[#3FB950]";
 };

 const batVal = Math.round(telemetry.battery);
 const batColor = getBarColor(telemetry.battery, { critical: 25, warning: 50 });
 const batTextColor = getTextColor(telemetry.battery, { critical: 25, warning: 50 });
 
 const sigVal = Math.round(telemetry.communication);
 const sigColor = getBarColor(telemetry.communication, { critical: 40, warning: 60 });
 const sigTextColor = getTextColor(telemetry.communication, { critical: 40, warning: 60 });
 
 const tempVal = Math.round(telemetry.temperature);
 const tempColor = tempVal >= 80 ? "from-red-500 to-red-600" : tempVal >= 65 ? "from-yellow-400 to-yellow-500" : "from-[#3FB950] to-emerald-500";
 const tempTextColor = tempVal >= 80 ? "text-[#F85149]" : tempVal >= 65 ? "text-yellow-400" : "text-[#3FB950]";

 const statusColor = healthStatus === "critical" ? "text-[#F85149]" : healthStatus === "warning" ? "text-yellow-400" : "text-[#3FB950]";

 return (
 <div 
 style={{ 
 padding: '20px', 
 backgroundColor: '#111821', 
 
 borderRadius: '20px', 
 border: '1px solid #1F2A36',
 
 flexShrink: 0
 }}
 className="flex flex-col gap-6"
 >
 <div className="flex items-center gap-3">
 <div style={{ width: '36px', height: '36px', backgroundColor: '#111821', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3498db', border: '1px solid #1F2A36', fontSize: '18px' }}>
 🛰️
 </div>
 <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#E6EDF3', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
 Sputnik holati
 </h3>
 </div>

 <div className="flex flex-col gap-5">
 {/* BATARYA */}
 <div className="space-y-2">
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
 <span style={{ fontSize: '10px', fontWeight: '900', color: '#9BA7B4', textTransform: 'uppercase' }}>Batarya</span>
 <span style={{ fontSize: '13px', fontWeight: '900', fontFamily: 'monospace' }} className={batTextColor}>{batVal}%</span>
 </div>
 <div style={{ height: '6px', backgroundColor: '#1F2A36', borderRadius: '10px', border: '1px solid #1F2A36', overflow: 'hidden' }}>
 <div 
 style={{ 
 height: '100%', 
 transition: 'width 1s ease-out', 
 width: `${Math.max(4, Math.min(100, batVal))}%`,
 background: batColor.includes('green') ? '#3FB950' : batColor.includes('yellow') ? '#f1c40f' : '#F85149'
 }} 
 />
 </div>
 </div>

 {/* HARORAT */}
 <div className="space-y-2">
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
 <span style={{ fontSize: '10px', fontWeight: '900', color: '#9BA7B4', textTransform: 'uppercase' }}>Harorat</span>
 <span style={{ fontSize: '13px', fontWeight: '900', fontFamily: 'monospace' }} className={tempTextColor}>{tempVal}°C</span>
 </div>
 <div style={{ height: '6px', backgroundColor: '#1F2A36', borderRadius: '10px', border: '1px solid #1F2A36', overflow: 'hidden' }}>
 <div 
 style={{ 
 height: '100%', 
 transition: 'width 1s ease-out', 
 width: `${Math.max(4, Math.min(100, (tempVal / 100) * 100))}%`,
 background: tempColor.includes('emerald') ? '#3FB950' : tempColor.includes('yellow') ? '#f1c40f' : '#F85149'
 }} 
 />
 </div>
 </div>

 {/* ALOQA */}
 <div className="space-y-2">
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
 <span style={{ fontSize: '10px', fontWeight: '900', color: '#9BA7B4', textTransform: 'uppercase' }}>Aloqa</span>
 <span style={{ fontSize: '13px', fontWeight: '900', fontFamily: 'monospace' }} className={sigTextColor}>{sigVal}%</span>
 </div>
 <div style={{ height: '6px', backgroundColor: '#1F2A36', borderRadius: '10px', border: '1px solid #1F2A36', overflow: 'hidden' }}>
 <div 
 style={{ 
 height: '100%', 
 transition: 'width 1s ease-out', 
 width: `${Math.max(4, Math.min(100, sigVal))}%`,
 background: sigColor.includes('blue') ? '#4C82F7' : sigColor.includes('yellow') ? '#f1c40f' : '#F85149'
 }} 
 />
 </div>
 </div>

 {/* TIZIM HOLATI */}
 <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #1F2A36', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '4px', paddingRight: '4px' }}>
 <span style={{ fontSize: '10px', fontWeight: '900', color: '#9BA7B4', textTransform: 'uppercase' }}>Holati</span>
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '900' }} className={statusColor}>
 <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'currentColor' }} className="animate-pulse" />
 {healthStatus?.toUpperCase() || "OK"}
 </div>
 </div>
 </div>
 </div>
 );
}

