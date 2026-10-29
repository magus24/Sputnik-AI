export default function AIDecisionPanel({ decision, reason, collisionRisk, missionRisk }) {
 if (!decision) return null;

 const getRiskColor = (risk) => {
 switch (risk) {
 case "critical":
 case "high": return "#F85149";
 case "medium": return "#D29922";
 case "low": return "#3FB950";
 default: return "#8B949E";
 }
 };

 const riskText = collisionRisk === "critical" || collisionRisk === "high" ? "YUQORI" : collisionRisk === "medium" ? "O'RTA" : "PAST";
 const riskColor = getRiskColor(collisionRisk);

 return (
 <div 
 style={{ 
 backgroundColor: '#0F1720', 
 
 borderRadius: '20px', 
 border: '1px solid #1F2A36',
 
 flexShrink: 0
 }}
 className="flex flex-col overflow-hidden"
 >
 <div style={{ backgroundColor: '#111821', padding: '16px 20px', borderBottom: '1px solid #1F2A36', display: 'flex', alignItems: 'center', gap: '12px' }}>
 <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#111821', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7', border: '1px solid #1F2A36', fontSize: '18px' }}>
 🧠
 </div>
 <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#E6EDF3', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
 AI Qarorlari
 </h3>
 </div>
 
 <div style={{ padding: '20px' }} className="flex flex-col gap-6">
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111821', padding: '16px', borderRadius: '16px', border: '1px solid #1F2A36' }}>
 <div className="space-y-1">
 <div style={{ fontSize: '10px', color: '#9BA7B4', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Xavf darajasi</div>
 <div style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.02em', color: riskColor }}>
 {riskText}
 </div>
 </div>
 
 <div className="flex flex-col items-center gap-1">
 <div className="relative w-12 h-12 flex items-center justify-center">
 <svg className="w-full h-full transform -rotate-90">
 <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-[#E6EDF3]/5" />
 <circle 
 cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" 
 strokeDasharray={126} 
 strokeDashoffset={126 - (126 * missionRisk) / 100} 
 strokeLinecap="round" 
 className="transition-all duration-1000 ease-out"
 style={{ color: riskColor }}
 />
 </svg>
 <span style={{ position: 'absolute', fontSize: '12px', fontWeight: '900', color: 'white' }}>{missionRisk}%</span>
 </div>
 <div style={{ fontSize: '8px', color: '#9BA7B4', fontWeight: '900', textTransform: 'uppercase' }}>Umumiy</div>
 </div>
 </div>

 <div className="space-y-2">
 <div style={{ fontSize: '10px', color: '#9BA7B4', fontWeight: '900', textTransform: 'uppercase', paddingLeft: '8px' }}>Tizim Qarori</div>
 <div style={{ backgroundColor: '#111821', border: '1px solid #1F2A36', padding: '14px 16px', borderRadius: '14px' }}>
 <div style={{ fontSize: '14px', fontWeight: '900', color: '#3FB950', lineHeight: '1.4' }}>
 {decision}
 </div>
 </div>
 </div>

 <div className="space-y-3">
 <div style={{ fontSize: '10px', color: '#9BA7B4', fontWeight: '900', textTransform: 'uppercase', paddingLeft: '8px' }}>Asoslantirish:</div>
 <div className="space-y-2.5 px-2">
 {reason && reason.map((r, i) => (
 <div key={i} className="flex items-start gap-3 text-[11px] text-[#9BA7B4] leading-relaxed font-medium">
 <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#3FB950', marginTop: '6px', flexShrink: 0 }} />
 <span>{r}</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
}

