export default function ThreatStatusPanel({ primaryHazard }) {
 if (!primaryHazard) return null;

 const closestApproach = primaryHazard.closest_approach ? `${primaryHazard.closest_approach.toFixed(1)} km` : "N/A";

 let timeToIntersect = "—";
 if (primaryHazard.time_to_closest_approach !== undefined) {
 timeToIntersect = `${primaryHazard.time_to_closest_approach} soniya`;
 }

 const riskMap = {
 "low": "XAVFSIZ",
 "medium": "O'RTACHA",
 "high": "XAVFLI",
 "critical": "XAVFLI"
 };
 const status = riskMap[primaryHazard.threat_level] || "XAVFSIZ";

 const colorMap = {
 "XAVFLI": "#F85149",
 "O'RTACHA": "#D29922",
 "XAVFSIZ": "#3FB950"
 };
 const statusColor = colorMap[status] || "#3FB950";

 return (
 <div className="bg-[#111821] rounded-md p-5 ">
 <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#8B949E] font-semibold text-center mb-3">
 XAVF HOLATI
 </h3>

 <div className="text-center mb-4">
 <span className="text-2xl font-extrabold uppercase tracking-wide" style={{ color: statusColor }}>
 XAVF: {status}
 </span>
 </div>

 <div className="flex justify-center gap-8 text-xs font-mono text-[#E6EDF3]">
 <div className="flex flex-col items-center gap-0.5">
 <span className="text-[10px] text-[#8B949E] uppercase tracking-wider">Masofa</span>
 <span className="text-sm font-bold">{closestApproach}</span>
 </div>
 <div className="flex flex-col items-center gap-0.5">
 <span className="text-[10px] text-[#8B949E] uppercase tracking-wider">Vaqt</span>
 <span className="text-sm font-bold">{timeToIntersect}</span>
 </div>
 </div>
 </div>
 );
}
