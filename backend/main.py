"""Orbital Guardian AI — FastAPI backend entry point."""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio

from schemas import StatusResponse
from simulator import get_state, simulate_step, reset, set_scenario
from monitors import evaluate_health, calculate_closest_approach, collision_risk, generate_events
from decision import make_decision
from alerts import generate_alerts
from pydantic import BaseModel


app = FastAPI(
    title="Orbital Guardian AI",
    version="0.2.0",
    description="Predictive mission-control AI for satellite protection and orbital monitoring.",
)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- helpers ----------

def _build_full_state() -> dict:
    """Compute predictive data and assemble the full state response."""
    state = get_state()
    sat = state["satellite"]
    moon = state["moon"]
    hazards = state["hazard_objects"]
    tel = state["telemetry"]
    sw = state["solar_weather"]

    primary_id, min_dist, time_to_intersect = calculate_closest_approach(sat, hazards)
    state["primary_hazard_id"] = primary_id  # Update state dynamically
    
    risk = collision_risk(min_dist, time_to_intersect)
    health = evaluate_health(tel)
    
    # --- Trigger avoidance maneuver ---
    if risk in ["critical", "high"] and not state.get("avoidance_active", False):
        from simulator import AVOIDANCE_DURATION
        state["avoidance_active"] = True
        state["avoidance_steps_remaining"] = AVOIDANCE_DURATION



    orbital_risk_score = 0
    if risk == "critical": orbital_risk_score = 95
    elif risk == "high": orbital_risk_score = 80
    elif risk == "medium": orbital_risk_score = 50
    elif risk == "low": orbital_risk_score = 15

    solar_risk_score = 0
    if sw.level == "critical": solar_risk_score = 90
    elif sw.level == "high": solar_risk_score = 75
    elif sw.level == "elevated": solar_risk_score = 45
    elif sw.level == "low": solar_risk_score = 10

    combined_mission_risk_score = min(100, int((orbital_risk_score * 0.7) + (solar_risk_score * 0.3)))

    # --- Events and Priority Queue ---
    earth_events = state.get("earth_events", [])
    events = generate_events(state, health, sw, earth_events)
    
    # Priority queue is just the sorted events list
    priority_queue = events
    
    # AI Decision
    dec = make_decision(priority_queue)
    alert_list = generate_alerts(risk, time_to_intersect, sw, tel, health)

    return {
        "scenario_id": state.get("scenario_id", "nominal"),
        "scenario_name": state.get("scenario_name", "Nominal Orbit"),
        "satellite": sat.model_dump(),
        "moon": moon.model_dump(),
        "hazard_objects": [h.model_dump() for h in hazards],
        "primary_hazard_id": primary_id,
        "telemetry": tel.model_dump(),
        "solar_weather": sw.model_dump(),
        "collision_risk": risk,
        "orbital_risk_score": orbital_risk_score,
        "solar_risk_score": solar_risk_score,
        "combined_mission_risk_score": combined_mission_risk_score,
        "nearest_hazard_id": primary_id,
        "nearest_hazard_distance": round(min_dist, 2),
        "time_to_closest_approach": time_to_intersect,
        "health_status": health.status,
        "issues": health.issues,
        "alerts": [a.model_dump() for a in alert_list],
        "events": [e.model_dump() for e in events],
        "earth_events": [e.model_dump() for e in earth_events],
        "priority_queue": [e.model_dump() for e in priority_queue],
        "decision": dec.decision,
        "reason": dec.reason,
        "step": state["step"],
        "satellite_alert_level": state.get("satellite_alert_level", "nominal"),
        "avoidance_active": state.get("avoidance_active", False),
    }

# ---------- WebSocket Broadcasting ----------
active_connections: list[WebSocket] = []
TICK_RATE = 1.0

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        # Send initial state BEFORE adding to active_connections to prevent concurrent writes from simulation_loop
        await websocket.send_json(_build_full_state())
        active_connections.append(websocket)
        while True:
            # Keep connection open
            data = await websocket.receive_text()
    except Exception:
        if websocket in active_connections:
            active_connections.remove(websocket)

async def simulation_loop():
    while True:
        simulate_step()
        if active_connections:
            state_data = _build_full_state()
            for connection in active_connections:
                try:
                    await connection.send_json(state_data)
                except Exception:
                    pass
        await asyncio.sleep(TICK_RATE)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulation_loop())


# ---------- routes ----------

@app.get("/api/status", response_model=StatusResponse)
def get_status():
    return StatusResponse(system="Orbital Guardian AI", status="running")


@app.get("/api/full-state")
def get_full_state():
    return _build_full_state()


@app.post("/api/simulate-step")
def post_simulate_step():
    simulate_step()
    return _build_full_state()


@app.post("/api/reset")
def post_reset():
    reset()
    return _build_full_state()


class ScenarioRequest(BaseModel):
    scenario_id: str

@app.post("/api/scenario")
def post_set_scenario(req: ScenarioRequest):
    set_scenario(req.scenario_id)
    return _build_full_state()

class SpeedRequest(BaseModel):
    multiplier: float

@app.post("/api/speed")
def post_set_speed(req: SpeedRequest):
    global TICK_RATE
    # multiplier = 1 -> 1.0s, multiplier = 2 -> 0.5s, multiplier = 5 -> 0.2s
    if req.multiplier <= 0:
        req.multiplier = 1.0
    TICK_RATE = 1.0 / req.multiplier
    return {"status": "ok", "tick_rate": TICK_RATE}

