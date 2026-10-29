export default function RecommendationPanel({ decision, explanation }) {
 if (!decision) return null;

 const decisionMap = {
 "MONITOR": "MONITOR",
 "monitor_ready": "MONITOR",
 "MONITOR_READY": "MONITOR",
 "AVOIDANCE_MANEUVER": "QOCHISH",
 "avoidance_maneuver": "QOCHISH",
 "ADJUST_TRANSMISSION": "SIGNALNI HIMOYA QILISH",
 "adjust_transmission": "SIGNALNI HIMOYA QILISH",
 "POWER_DOWN_NON_ESSENTIAL": "TIZIMLARNI O'CHIRISH",
 "power_down_non_essential": "TIZIMLARNI O'CHIRISH"
 };

 const translatedDecision = decisionMap[decision] || decision.replace(/_/g, ' ').toUpperCase();

 // Color mapping — normalize the key
 const normalizedKey = decision.toUpperCase();
 let actionColor = "#3FB950"; // default green
 let shortExplanation = "Obyektlar kuzatilmoqda";

 if (normalizedKey.includes("AVOIDANCE") || normalizedKey.includes("QOCHISH")) {
 actionColor = "#F85149";
 shortExplanation = "Obyekt yaqinlashmoqda";
 } else if (normalizedKey.includes("ADJUST") || normalizedKey.includes("TRANSMISSION") || normalizedKey.includes("POWER")) {
 actionColor = "#D29922";
 shortExplanation = "Signal zaiflashmoqda";
 }

 return (
 <div className="bg-[#111821] rounded-md p-5 ">
 <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#8B949E] font-semibold text-center mb-4">
 TAVSIYA (AI)
 </h3>

 <div className="text-center">
 <div
 className="text-3xl font-extrabold uppercase tracking-wider"
 style={{ color: actionColor }}
 >
 {translatedDecision}
 </div>

 <div className="text-xs text-[#8B949E] mt-2 font-mono">
 {shortExplanation}
 </div>
 </div>
 </div>
 );
}
