export default function ScenarioSelector({ currentScenarioId, onSelectScenario, loading }) {
 const scenarios = [
 { id: "nominal", name: "Demo 1: Nominal Orbit" },
 { id: "meteoroid", name: "Demo 2: Meteoroid Convergence" },
 { id: "combined", name: "Demo 3: Combined Threat" }
 ];

 return (
 <div className="flex items-center gap-2">
 <span className="text-[10px] text-[#9BA7B4] uppercase tracking-widest">Scenario</span>
 <select 
 className="bg-[#0b1220] border border-[#1F2A36] text-slate-200 text-xs px-2 py-1 rounded outline-none w-48"
 value={currentScenarioId}
 onChange={(e) => onSelectScenario(e.target.value)}
 disabled={loading}
 >
 {scenarios.map(s => (
 <option key={s.id} value={s.id}>{s.name}</option>
 ))}
 </select>
 </div>
 );
}
