export default function SimulateButton({ onClick, loading, step }) {
 return (
 <button className="btn-simulate" onClick={onClick} disabled={loading}>
 {loading ? "HISOBLANMOQDA..." : "DAVOM ETTIR"}
 </button>
 );
}
