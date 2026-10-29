export default function SystemActionsPanel({ decision }) {
 if (!decision) return null;

 const isActive = (action) => decision.includes(action);

 const actions = [
 { label: "Tezlikni pasaytirish", trigger: "UKLONISH", icon: "⏱️" },
 { label: "Xavfsiz rejimga o'tish", trigger: "XAVFSIZ REJIM", icon: "🛡️" },
 { label: "Yuklamani kamaytirish", trigger: "YUKLAMANI KAMAYTIRISH", icon: "⊗" },
 { label: "Ma'lumot uzatish", trigger: "YUKLAMANI KAMAYTIRISH", icon: "↑" },
 { label: "Termal nazorat", trigger: "XAVFSIZ REJIM", icon: "🌡️" },
 ];

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
 <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#111821', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4C82F7', border: '1px solid #1F2A36', fontSize: '18px' }}>
 ⚙️
 </div>
 <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#E6EDF3', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
 Tizim Amallari
 </h3>
 </div>
 
 <div style={{ padding: '16px' }} className="flex flex-col gap-2">
 {actions.map((act, i) => {
 const active = isActive(act.trigger);
 
 let statusText = "KUTISH";
 let statusBg = '#1A2030';
 let statusTextClass = "#9BA7B4";
 let dotColor = "#4b5563";
 
 if (active) {
 if (act.label === "Ma'lumot uzatish") {
 statusText = "CHEKLANGAN";
 statusBg = '#1F1D14';
 statusTextClass = "#f59e0b";
 dotColor = "#f59e0b";
 } else {
 statusText = "AKTIV";
 statusBg = '#121F1B';
 statusTextClass = "#3FB950";
 dotColor = "#3FB950";
 }
 }

 return (
 <div 
 key={i} 
 style={{ 
 display: 'flex', 
 justifyContent: 'space-between', 
 alignItems: 'center', 
 padding: '12px 16px', 
 borderRadius: '14px', 
 backgroundColor: active ? '#1A2030' : 'transparent',
 opacity: active ? 1 : 0.4
 }}
 >
 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
 <span style={{ fontSize: '16px' }}>{act.icon}</span>
 <span style={{ fontSize: '12px', fontWeight: '900', color: active ? 'white' : '#9BA7B4' }}>
 {act.label}
 </span>
 </div>
 
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', borderRadius: '8px', backgroundColor: statusBg, color: statusTextClass, border: '1px solid currentColor/10' }}>
 <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: dotColor }} className={active ? 'animate-pulse' : ''} />
 <span style={{ fontSize: '10px', fontWeight: '900', fontFamily: 'monospace' }}>
 {statusText}
 </span>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
}

