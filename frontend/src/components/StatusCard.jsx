export default function StatusCard({ label, value, unit, max, alertLevel = "nominal" }) {
 const pct = Math.min(100, Math.max(0, (value / max) * 100));
 
 let barColor = "bg-[#3BAFDA]";
 let textColor = "text-[#3BAFDA]";
 if (alertLevel === "warning") {
 barColor = "bg-[#fbbf24]";
 textColor = "text-[#fbbf24]";
 } else if (alertLevel === "critical") {
 barColor = "bg-[#F85149]";
 textColor = "text-[#F85149]";
 }

 return (
 <div className="bg-[#111827] border border-[#1F2A36] p-3 rounded-sm flex flex-col gap-2">
 <div className="flex items-center justify-between">
 <span className="text-[10px] uppercase text-[#9BA7B4] font-medium tracking-wide">{label}</span>
 <span className={`text-xs font-semibold ${textColor}`}>
 {typeof value === "number" ? Math.round(value) : value} {unit}
 </span>
 </div>
 <div className="w-full h-[4px] bg-[#0b1220] rounded-none overflow-hidden">
 <div
 className={`h-full ${barColor} transition-all duration-300 ease-in-out`}
 style={{ width: `${pct}%` }}
 />
 </div>
 </div>
 );
}
