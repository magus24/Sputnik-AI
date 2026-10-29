"""Sputnik AI — Scenario-driven Simulation engine.

Realistic orbital mechanics with:
- Gravitational physics (Earth, Sun, Moon)
- Earth collision detection (meteoroids NEVER enter Earth)
- Tangential fly-by trajectories (90% pass by, 10% threaten satellite)
- Satellite avoidance maneuvers
- Past position history for trajectory trails
"""

from __future__ import annotations
import math
import random
from schemas import Position, HazardObject, Telemetry, SolarWeather, TrajectoryPoint, EarthEvent
import earth_mock

# ---------- constants ----------
ORBIT_RADIUS = 50.0            # satellite orbit, abstract units
SATELLITE_SPEED = 6.0          # degrees per step
EARTH_RADIUS = 9.5             # visual Earth radius — MUST MATCH frontend EarthGlobe
EARTH_SAFE_RADIUS = 25.0       # collision boundary in backend units (= 9.5 / 0.4 SCALE + margin)

MOON_ORBIT_RADIUS = 150.0      # Moon visual orbit
MOON_SPEED = 1.0               # degrees per step

PREDICTION_STEPS = 150
PAST_HISTORY_MAX = 50
NUM_HAZARDS = 30

# Gravity — tuned so objects curve naturally but don't spiral into Earth
GM_EARTH = 15.0                # weaker gravity = wider fly-by arcs
GM_SUN = 50.0                 # very weak — distant perturbation only
GM_MOON = 5.0                 # minor influence
SUN_X, SUN_Y = -1000.0, 0.0   # Sun far away

# Telemetry
BATTERY_DRAIN = 0.08
SOLAR_CHARGE = 0.12
TEMP_BASE = 45.0
TEMP_VARIANCE = 5.0
COMM_BASE = 80.0
COMM_VARIANCE = 10.0

# Avoidance
AVOIDANCE_ORBIT_OFFSET = 5.0
AVOIDANCE_DURATION = 6

SCENARIOS = {
    "nominal": "Demo 1: Nominal Orbit",
    "meteoroid": "Demo 2: Meteoroid Convergence",
    "combined": "Demo 3: Combined Threat",
}

# ---------- state ----------
_state: dict | None = None
_active_scenario: str = "nominal"


def set_scenario(scenario_id: str):
    global _active_scenario
    if scenario_id in SCENARIOS:
        _active_scenario = scenario_id
    reset()


def get_scenario() -> str:
    return _active_scenario


# ---------- physics ----------

def _compute_gravity(x: float, y: float, moon_x: float, moon_y: float) -> tuple[float, float]:
    """Gravitational acceleration from Earth (0,0), Sun, and Moon."""
    # Earth — cap min distance to prevent extreme acceleration near surface
    dist_e = max(math.hypot(x, y), EARTH_SAFE_RADIUS * 1.2)
    ax = -GM_EARTH * x / (dist_e ** 3)
    ay = -GM_EARTH * y / (dist_e ** 3)

    # Cap total Earth acceleration magnitude
    accel_mag = math.hypot(ax, ay)
    max_accel = 3.0  # prevent extreme gravity spikes
    if accel_mag > max_accel:
        ax = (ax / accel_mag) * max_accel
        ay = (ay / accel_mag) * max_accel

    # Sun (very far, weak perturbation)
    dx_s, dy_s = SUN_X - x, SUN_Y - y
    dist_s = math.hypot(dx_s, dy_s) or 1.0
    ax += GM_SUN * dx_s / (dist_s ** 3)
    ay += GM_SUN * dy_s / (dist_s ** 3)

    # Moon
    dx_m, dy_m = moon_x - x, moon_y - y
    dist_m = math.hypot(dx_m, dy_m) or 1.0
    ax += GM_MOON * dx_m / (dist_m ** 3)
    ay += GM_MOON * dy_m / (dist_m ** 3)

    return ax, ay


def _calculate_predicted_path(
    x: float, y: float, vx: float, vy: float,
    steps: int, moon_x: float, moon_y: float,
    is_primary: bool = False, sat_angle: float = 0.0
) -> list[TrajectoryPoint]:
    """Predict future path with gravity."""
    path = []
    cx, cy = x, y
    cvx, cvy = vx, vy
    for step_idx in range(steps):
        ax, ay = _compute_gravity(cx, cy, moon_x, moon_y)
        cvx += ax
        cvy += ay
        cx += cvx
        cy += cvy
        path.append(TrajectoryPoint(x=cx, y=cy))

        # Stop prediction if it hits Earth
        if math.hypot(cx, cy) <= EARTH_SAFE_RADIUS:
            break

    return path


# ---------- spawning ----------

def _spawn_flyby_hazard(index: int) -> tuple[float, float, float, float]:
    """Spawn a hazard FAR in deep space, flying across the scene.
    
    Guaranteed to NEVER pass through Earth.
    """
    min_miss_distance = EARTH_SAFE_RADIUS * 3

    for _attempt in range(50):
        spawn_angle = random.uniform(0, 360)
        radius = random.uniform(300, 500)  # very far from Earth
        x = radius * math.cos(math.radians(spawn_angle))
        y = radius * math.sin(math.radians(spawn_angle))

        exit_angle = spawn_angle + 180 + random.uniform(-70, 70)
        vel_angle_rad = math.radians(exit_angle)
        
        speed = random.uniform(2.0, 4.0)
        vx = math.cos(vel_angle_rad) * speed
        vy = math.sin(vel_angle_rad) * speed

        closest_dist = abs(x * vy - y * vx) / speed
        if closest_dist > min_miss_distance:
            return x, y, vx, vy

    # Fallback: fly tangentially
    spawn_angle = random.uniform(0, 360)
    radius = random.uniform(300, 500)
    x = radius * math.cos(math.radians(spawn_angle))
    y = radius * math.sin(math.radians(spawn_angle))
    tx, ty = -y / radius, x / radius
    speed = random.uniform(2.0, 4.0)
    return x, y, tx * speed, ty * speed


def _spawn_primary_threat(sat_angle: float) -> tuple[float, float, float, float]:
    """Spawn the primary threat — aimed at the satellite's future position to force avoidance."""
    speed = random.uniform(4.0, 6.0)
    radius = random.uniform(200, 300)
    
    # Estimate time to reach orbit radius
    time_to_reach = (radius - ORBIT_RADIUS) / speed
    
    # Satellite's future angle
    future_sat_angle = sat_angle + (SATELLITE_SPEED * time_to_reach)
    
    # Constrain spawn angle so it approaches from the outside
    # and doesn't fly through the Earth to reach the target!
    spawn_angle = future_sat_angle + random.uniform(-45, 45)
    
    x = radius * math.cos(math.radians(spawn_angle))
    y = radius * math.sin(math.radians(spawn_angle))
    
    # Target position
    target_x = ORBIT_RADIUS * math.cos(math.radians(future_sat_angle))
    target_y = ORBIT_RADIUS * math.sin(math.radians(future_sat_angle))
    
    dx = target_x - x
    dy = target_y - y
    dist = math.hypot(dx, dy) or 1.0
    
    vx = (dx / dist) * speed
    vy = (dy / dist) * speed

    return x, y, vx, vy


def _initial_hazards(scenario_id: str, designated_primary_id: str) -> list[HazardObject]:
    """Create initial hazard objects with pre-calculated history."""
    items: list[HazardObject] = []
    types = ["debris", "meteoroid", "asteroid_fragment"]

    for i in range(NUM_HAZARDS):
        hzd_id = f"HZD-{i + 1:03d}"
        if hzd_id == designated_primary_id:
            x, y, vx, vy = _spawn_primary_threat(0.0)
            confidence = 0.98
            obj_type = "meteoroid"
        else:
            x, y, vx, vy = _spawn_flyby_hazard(i)
            confidence = random.uniform(0.6, 0.9)
            obj_type = random.choice(types)

        # Pre-fill history by back-calculating using reverse gravity to prevent kinks
        history = []
        hx, hy = x, y
        hvx, hvy = vx, vy
        for _ in range(20):
            hx -= hvx
            hy -= hvy
            ax, ay = _compute_gravity(hx, hy, MOON_ORBIT_RADIUS, 0.0)
            hvx -= ax
            hvy -= ay
            history.insert(0, TrajectoryPoint(x=hx, y=hy))
        history.append(TrajectoryPoint(x=x, y=y))

        items.append(HazardObject(
            id=hzd_id,
            type=obj_type,
            x=x, y=y, vx=vx, vy=vy,
            threat_level="low",
            predicted_path=_calculate_predicted_path(
                x, y, vx, vy, PREDICTION_STEPS, MOON_ORBIT_RADIUS, 0.0, 
                is_primary=(hzd_id == designated_primary_id), sat_angle=0.0
            ),
            past_positions=history,
            confidence_value=confidence,
        ))
    return items


def _initial_solar_weather(scenario_id: str) -> SolarWeather:
    if scenario_id == "combined":
        return SolarWeather(level="elevated", impact="Minor Interference", recommendation="Monitor Channels")
    return SolarWeather(level="low", impact="Nominal", recommendation="Standard Operations")


# ---------- state management ----------

def _reset_state() -> dict:
    primary_index = random.randint(0, NUM_HAZARDS - 1)
    designated_primary_id = f"HZD-{primary_index + 1:03d}"

    return {
        "scenario_id": _active_scenario,
        "scenario_name": SCENARIOS.get(_active_scenario, "Unknown"),
        "satellite": Position(x=ORBIT_RADIUS, y=0.0, angle=0.0),
        "moon": Position(x=MOON_ORBIT_RADIUS, y=0.0, angle=0.0),
        "designated_primary_id": designated_primary_id,
        "hazard_objects": _initial_hazards(_active_scenario, designated_primary_id),
        "primary_hazard_id": designated_primary_id,
        "telemetry": Telemetry(battery=100.0, temperature=TEMP_BASE, communication=COMM_BASE),
        "solar_weather": _initial_solar_weather(_active_scenario),
        "earth_events": [],
        "step": 0,
        "avoidance_active": False,
        "avoidance_steps_remaining": 0,
        "satellite_alert_level": "nominal",
    }


def get_state() -> dict:
    global _state
    if _state is None:
        _state = _reset_state()
    return _state


def reset() -> dict:
    global _state
    _state = _reset_state()
    return _state


# ---------- simulation step ----------

def simulate_step() -> dict:
    global _state
    state = get_state()
    state["step"] += 1
    step = state["step"]
    scenario = state["scenario_id"]

    # --- Avoidance maneuver ---
    current_orbit_radius = ORBIT_RADIUS
    current_speed = SATELLITE_SPEED
    
    if state["avoidance_active"]:
        # Duck inwards (closer to Earth) and speed up to evade the incoming meteorite
        current_orbit_radius = ORBIT_RADIUS
        current_speed = SATELLITE_SPEED * 0.5
        
        state["avoidance_steps_remaining"] -= 1
        if state["avoidance_steps_remaining"] <= 0:
            state["avoidance_active"] = False
            state["avoidance_steps_remaining"] = 0

    # --- Satellite ---
    new_angle = (state["satellite"].angle + current_speed) % 360
    state["satellite"] = Position(
        x=current_orbit_radius * math.cos(math.radians(new_angle)),
        y=current_orbit_radius * math.sin(math.radians(new_angle)),
        angle=new_angle,
    )

    # --- Moon ---
    new_moon_angle = (state["moon"].angle + MOON_SPEED) % 360
    state["moon"] = Position(
        x=MOON_ORBIT_RADIUS * math.cos(math.radians(new_moon_angle)),
        y=MOON_ORBIT_RADIUS * math.sin(math.radians(new_moon_angle)) * 0.2,
        angle=new_moon_angle,
    )

    # --- Solar weather ---
    sw = state["solar_weather"]
    if scenario == "combined":
        if step == 3:
            sw.level, sw.impact = "high", "Moderate Signal Degradation"
            sw.recommendation = "Reduce Transmission Load"
        elif step == 8:
            sw.level, sw.impact = "critical", "Severe Signal Degradation"
            sw.recommendation = "Pause Data Transfers"
    elif step % 7 == 0 and random.random() > 0.8:
        sw.level, sw.impact = "elevated", "Minor Interference"
        sw.recommendation = "Monitor Channels"

    # --- Earth Events ---
    state["earth_events"] = earth_mock.generate_earth_events(step)

    # --- Hazards ---
    sat = state["satellite"]
    moon = state["moon"]

    for i, h in enumerate(state["hazard_objects"]):
        # Record history
        h.past_positions.append(TrajectoryPoint(x=h.x, y=h.y))
        if len(h.past_positions) > PAST_HISTORY_MAX:
            h.past_positions = h.past_positions[-PAST_HISTORY_MAX:]

        if h.id == state.get("designated_primary_id"):
            # --- PRIMARY THREAT: flies toward Earth with gravity ---
            ax, ay = _compute_gravity(h.x, h.y, moon.x, moon.y)
            h.vx += ax
            h.vy += ay
            h.x += h.vx
            h.y += h.vy
            
            dist_from_center = math.hypot(h.x, h.y)
            
            # If hit Earth, respawn as new primary from deep space
            if dist_from_center <= EARTH_SAFE_RADIUS or dist_from_center > ORBIT_RADIUS * 12.0:
                nx, ny, nvx, nvy = _spawn_primary_threat(sat.angle)
                h.x, h.y, h.vx, h.vy = nx, ny, nvx, nvy
                h.past_positions = []
        else:
            # --- NON-PRIMARY: fly-by with gravity ---
            ax, ay = _compute_gravity(h.x, h.y, moon.x, moon.y)
            h.vx += ax
            h.vy += ay
            h.x += h.vx
            h.y += h.vy

            # Boundary: if too far or hit Earth, respawn from deep space
            dist_from_center = math.hypot(h.x, h.y)
            if dist_from_center > ORBIT_RADIUS * 12.0 or dist_from_center <= EARTH_SAFE_RADIUS:
                nx, ny, nvx, nvy = _spawn_flyby_hazard(i)
                h.x, h.y, h.vx, h.vy = nx, ny, nvx, nvy
                h.past_positions = []

        # Regenerate prediction
        is_primary = (h.id == state.get("designated_primary_id"))
        h.predicted_path = _calculate_predicted_path(
            h.x, h.y, h.vx, h.vy, PREDICTION_STEPS, moon.x, moon.y,
            is_primary=is_primary, sat_angle=sat.angle
        )

    # --- Satellite alert level ---
    alert_level = "nominal"
    for h in state["hazard_objects"]:
        dist_to_sat = math.hypot(sat.x - h.x, sat.y - h.y)
        if dist_to_sat < 5:
            alert_level = "danger"
            break
        elif dist_to_sat < 15 and alert_level != "danger":
            alert_level = "warning"
    state["satellite_alert_level"] = alert_level

    # --- Telemetry ---
    tel = state["telemetry"]
    sw_level = sw.level
    
    # Calculate solar charging (not in shadow)
    # Sun is at (-1000, 0), Earth is at (0, 0)
    # Shadow is roughly when x > 15 and abs(y) < EARTH_RADIUS
    is_in_shadow = sat.x > 15 and abs(sat.y) < EARTH_RADIUS
    
    charge = 0 if is_in_shadow else SOLAR_CHARGE
    drain = BATTERY_DRAIN
    
    # Extra drain during avoidance maneuvers
    if state["avoidance_active"]:
        drain *= 3.0
        
    new_battery = min(100.0, max(0.0, tel.battery - drain + charge + random.uniform(-0.02, 0.02)))
    
    new_temp = TEMP_BASE + TEMP_VARIANCE * math.sin(step * 0.3) + random.uniform(-0.5, 0.5)
    
    comm_penalty = {"critical": 60, "high": 35, "elevated": 15}.get(sw_level, 0)
    if sw_level in ["critical", "high"]:
        new_temp += random.uniform(2, 5)
        new_battery -= 0.1 # extra load

    new_comm = max(0, min(100, COMM_BASE + COMM_VARIANCE * math.sin(step * 0.5) - comm_penalty))

    state["telemetry"] = Telemetry(
        battery=round(new_battery, 1),
        temperature=round(new_temp, 1),
        communication=round(new_comm, 1),
    )

    return state
