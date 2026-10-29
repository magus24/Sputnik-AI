export default function AlertsPanel({ events }) {
 if (!events) return null;

 const getSeverityStyles = (severity) => {
 switch (severity) {
 case "CRITICAL":
 case "HIGH":
 return {
 bg: "bg-[#F85149]",
 border: "border-[#1F2A36]",
 text: "text-[#F85149]",
 iconBg: "bg-[#F85149]",
 badge: "bg-[#F85149] text-[#E6EDF3]"
 };
 case "MEDIUM":
 return {
 bg: "bg-[#D29922]",
 border: "border-yellow-500/20",
 text: "text-yellow-400",
 iconBg: "bg-[#D29922]",
 badge: "bg-[#D29922] text-[#3FB950]lack"
 };
 case "LOW":
 return {
 bg: "bg-[#4C82F7]",
 border: "border-[#1F2A36]",
 text: "text-[#4C82F7]",
 iconBg: "bg-[#4C82F7]",
 badge: "bg-[#4C82F7] text-[#E6EDF3]"
 };
 default:
 return {
 bg: "bg-slate-500/10",
 border: "border-slate-500/20",
 text: "text-[#9BA7B4]",
 iconBg: "bg-slate-500/20",
 badge: "bg-slate-500 text-[#E6EDF3]"
 };
 }
 };

 return (
 <div 
 style={{ 
 backgroundColor: '#0F1720', 
 
 borderRadius: '20px', 
 border: '1px solid #1F2A36',
 
 }}
 className="flex flex-col overflow-hidden"
 >
 <div style={{ backgroundColor: '#111821', padding: '12px 16px', borderBottom: '1px solid #1F2A36', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#F85149', }} className="animate-ping" />
 <h3 style={{ fontSize: '9px', fontWeight: '900', color: '#E6EDF3', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
 Ogohlantirishlar
 </h3>
 </div>
 {events.length > 0 && (
 <span style={{ fontSize: '8px', backgroundColor: '#F85149', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: '900' }}>
 {events.length}
 </span>
 )}
 </div>
 
 <div style={{ padding: '12px' }} className="flex flex-col gap-2 overflow-y-auto flex-1 custom-scrollbar">
 {events.length === 0 ? (
 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 0', color: '#9BA7B4', gap: '6px', opacity: '0.4' }}>
 <span style={{ fontSize: '20px' }}>✅</span>
 <span style={{ fontSize: '8px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Xavfsiz</span>
 </div>
 ) : (
 events.map((event, idx) => {
 const s = getSeverityStyles(event.severity);
 const isBlinking = event.severity === "CRITICAL" || event.severity === "HIGH";
 
 return (
 <div 
 key={idx} 
 style={{ 
 display: 'flex', 
 gap: '10px', 
 padding: '8px 12px', 
 borderRadius: '12px', 
 backgroundColor: '#111821',
 border: `1px solid ${s.border.includes('red') ? '#1F1518' : s.border.includes('yellow') ? '#1F1D14' : '#141D2E'}`,
 alignItems: 'center'
 }}
 >
 <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#111821', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} className={isBlinking ? 'animate-pulse' : ''}>
 <span style={{ fontSize: '14px' }}>⚠️</span>
 </div>
 
 <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
 <span style={{ fontSize: '7px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: s.text.includes('red') ? '#F85149' : s.text.includes('yellow') ? '#fbbf24' : '#60a5fa' }}>
 {event.severity}
 </span>
 <span style={{ fontSize: '7px', color: '#9BA7B4', fontFamily: 'monospace', opacity: 0.5 }}>LIVE</span>
 </div>
 <div style={{ fontSize: '10px', fontWeight: '900', color: 'white', letterSpacing: '-0.01em', truncate: 'true', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
 {event.description.split(':')[0]}
 </div>
 <div style={{ fontSize: '8px', color: '#9BA7B4', lineHeight: '1.2', fontWeight: '500' }}>
 {event.description}
 </div>
 </div>
 </div>
 );
 })
 )}
 </div>
 </div>
 );
}

