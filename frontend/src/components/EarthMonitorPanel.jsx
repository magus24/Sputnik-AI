export default function EarthMonitorPanel({ earthEvents }) {
 if (!earthEvents) return null;

 const getEventIcon = (event) => {
 if (event.includes("Yong'in")) return "🔥";
 if (event.includes("Suv toshqini")) return "🌊";
 return "💥";
 };

 const getEventImage = (event) => {
 if (event.includes("Yong'in")) return "https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=300&auto=format&fit=crop";
 if (event.includes("Suv toshqini")) return "https://images.unsplash.com/photo-1547683905-f30e61287313?q=80&w=300&auto=format&fit=crop";
 return "https://images.unsplash.com/photo-1584282591942-0fdbd5b51dd2?q=80&w=300&auto=format&fit=crop";
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
 <div style={{ backgroundColor: '#111821', padding: '12px 16px', borderBottom: '1px solid #1F2A36', display: 'flex', alignItems: 'center', gap: '10px' }}>
 <span style={{ fontSize: '14px' }}>🌍</span>
 <h3 style={{ fontSize: '9px', fontWeight: '900', color: '#E6EDF3', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
 Yer monitoringi
 </h3>
 </div>
 
 <div style={{ padding: '12px' }} className="flex flex-col gap-2 overflow-y-auto flex-1 custom-scrollbar">
 {earthEvents.length === 0 ? (
 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 0', color: '#9BA7B4', gap: '6px', opacity: '0.4' }}>
 <span style={{ fontSize: '20px' }}>📡</span>
 <span style={{ fontSize: '8px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Sokin</span>
 </div>
 ) : (
 earthEvents.map((e, idx) => (
 <div 
 key={idx} 
 style={{ 
 display: 'flex', 
 gap: '10px', 
 backgroundColor: '#111821', 
 padding: '8px 12px', 
 borderRadius: '12px', 
 border: '1px solid #1F2A36',
 alignItems: 'center'
 }}
 >
 <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#111821', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0, border: '1px solid #1F2A36' }}>
 {getEventIcon(e.event)}
 </div>
 <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
 <div style={{ fontSize: '8px', fontWeight: '900', color: '#F85149', textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: '1' }}>
 {e.event}
 </div>
 <div style={{ fontSize: '10px', fontWeight: '900', color: 'white', truncate: 'true', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', lineHeight: '1.2' }}>
 {e.location}
 </div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
 <div style={{ flex: 1, height: '3px', backgroundColor: '#111821', borderRadius: '3px', overflow: 'hidden' }}>
 <div style={{ height: '100%', background: '#4C82F7', width: `${e.confidence * 100}%` }} />
 </div>
 <span style={{ fontSize: '7px', color: '#9BA7B4', fontWeight: '900' }}>{Math.round(e.confidence * 100)}%</span>
 </div>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 );
}

