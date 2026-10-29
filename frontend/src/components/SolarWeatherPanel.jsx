export default function SolarWeatherPanel({ solarWeather }) {
 if (!solarWeather) return null;

 const levelColorMap = {
 "low": "#3FB950",
 "elevated": "#D29922",
 "high": "#F85149",
 "critical": "#F85149"
 };

 const levelUzbekMap = {
 "low": "Past",
 "elevated": "O'rtacha",
 "high": "Yuqori",
 "critical": "Xavfli"
 };

 const levelColor = levelColorMap[solarWeather.level] || "#8B949E";
 const levelText = levelUzbekMap[solarWeather.level] || solarWeather.level;

 const signalImpact = solarWeather.level === "elevated" || solarWeather.level === "high" || solarWeather.level === "critical"
 ? "Signal pasayadi"
 : "";

 return (
 <div className="bg-[#111821] rounded-md p-5 ">
 <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#8B949E] font-semibold text-center mb-3">
 QUYOSH HOLATI
 </h3>

 <div className="text-center">
 <span className="text-[#8B949E] text-sm font-mono">Quyosh: </span>
 <span className="text-sm font-bold font-mono" style={{ color: levelColor }}>{levelText}</span>
 </div>

 {signalImpact && (
 <div className="text-center text-xs text-[#8B949E] font-mono mt-1.5">
 Ta'sir: {signalImpact}
 </div>
 )}
 </div>
 );
}
