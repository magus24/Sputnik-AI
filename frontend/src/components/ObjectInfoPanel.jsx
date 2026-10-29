export default function ObjectInfoPanel({ objectData }) {
 if (!objectData) return null;

 const speed = Math.sqrt((objectData.vx || 0) ** 2 + (objectData.vy || 0) ** 2).toFixed(1);
 const currentDistance = objectData.current_distance
 ? `${objectData.current_distance.toFixed(1)} km`
 : "N/A";

 const statusMap = {
 low: { text: "Xavfsiz", color: '#3FB950' },
 medium: { text: "O'rtacha", color: '#D29922' },
 high: { text: "Xavfli", color: '#F85149' },
 critical: { text: "Xavfli", color: '#F85149' },
 };
 const status = statusMap[objectData.threat_level] || statusMap.low;

 return (
 <div className="bg-[#111821] rounded-md p-4 ">
 <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#8B949E] font-semibold text-center mb-3">
 OBYEKT
 </h3>

 <div className="grid grid-cols-2 gap-y-2.5 text-[11px] text-[#8B949E]">
 <div className="uppercase tracking-wider">ID</div>
 <div className="text-right text-[#E6EDF3] font-mono font-semibold">{objectData.id}</div>

 <div className="uppercase tracking-wider">Masofa</div>
 <div className="text-right text-[#E6EDF3] font-mono">{currentDistance}</div>

 <div className="uppercase tracking-wider">Tezlik</div>
 <div className="text-right text-[#E6EDF3] font-mono">{speed} km/s</div>

 <div className="uppercase tracking-wider">Holat</div>
 <div className="text-right font-bold font-mono" style={{ color: status.color }}>
 {status.text}
 </div>
 </div>
 </div>
 );
}
