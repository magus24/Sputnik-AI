export default function PriorityQueuePanel({ priorityQueue }) {
 if (!priorityQueue) return null;

 const getSeverityColor = (severity) => {
 switch (severity) {
 case "CRITICAL":
 case "HIGH": return "text-[#F85149]";
 case "MEDIUM": return "text-yellow-400";
 case "LOW": return "text-[#4C82F7]";
 default: return "text-[#9BA7B4]";
 }
 };

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
 <div style={{ backgroundColor: '#111821', padding: '16px 20px', borderBottom: '1px solid #1F2A36', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
 <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#E6EDF3', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
 Prioritet Navbati
 </h3>
 <span style={{ fontSize: '8px', color: '#9BA7B4', fontWeight: '900', textTransform: 'uppercase', opacity: 0.5 }}>RANKING</span>
 </div>
 
 <div style={{ padding: '16px' }} className="flex flex-col gap-3 overflow-y-auto flex-1 custom-scrollbar">
 {priorityQueue.length === 0 ? (
 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0', color: '#9BA7B4', gap: '8px', opacity: '0.4' }}>
 <span style={{ fontSize: '24px' }}>📋</span>
 <span style={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }}>Navbat bo'sh</span>
 </div>
 ) : (
 priorityQueue.map((event, idx) => {
 const colorClass = getSeverityColor(event.severity);
 const isFirst = idx === 0;
 
 return (
 <div 
 key={idx} 
 style={{ 
 display: 'flex', 
 alignItems: 'center', 
 gap: '12px', 
 padding: '12px 16px', 
 borderRadius: '16px', 
 backgroundColor: '#111821', 
 border: isFirst ? '1px solid #3D2020' : '1px solid #1F2A36',
 }}
 >
 <div style={{ width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '12px', backgroundColor: isFirst ? '#1F1518' : '#1A2030', color: isFirst ? '#F85149' : '#9BA7B4', border: '1px solid #1F2A36' }}>
 {idx + 1}
 </div>
 
 <div style={{ flex: 1, minWidth: 0 }}>
 <div style={{ fontSize: '9px', fontWeight: '900', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>
 {event.type.replace('_', ' ')}
 </div>
 <div style={{ fontSize: '13px', fontWeight: '900', color: 'white', truncate: 'true', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
 {event.description.split(':')[0]}
 </div>
 </div>
 
 <div style={{ fontSize: '10px', fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', opacity: 0.8 }} className={colorClass}>
 {event.severity}
 </div>
 </div>
 );
 })
 )}
 </div>
 </div>
 );
}

