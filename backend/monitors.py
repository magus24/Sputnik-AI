"""Orbital Guardian AI — Monitors for hazard collision risk and satellite health."""

from __future__ import annotations
import math
from schemas import Position, HazardObject, Telemetry, HealthStatus, Event, EarthEvent, SolarWeather

# ---------- predictive risk ----------

def calculate_closest_approach(satellite: Position, hazards: list[HazardObject]) -> tuple[str | None, float, int | None]:
    """
    Evaluates the predicted paths of hazards matching against projected satellite positions.
    Modifies hazard objects in-place with dynamic prediction attributes.
    Returns: primary_threat_id, min_static_dist_overall, intersect_time_overall
    """
    if not hazards:
        return None, float("inf"), None
        
    primary_id = None
    highest_threat_score = -1
    global_min_dist = float("inf")
    global_intersect_time = None
    
    # Simple predictive step simulation locally relative
    # For MVP we will assume satellite traverses orbit circle
    import simulator
    sat_speed = simulator.SATELLITE_SPEED
    sat_radius = simulator.ORBIT_RADIUS
    
    for h in hazards:
        # 1. Update static distance
        h.current_distance = math.hypot(satellite.x - h.x, satellite.y - h.y)
        if h.current_distance < global_min_dist:
            global_min_dist = h.current_distance
            
        # 2. Project path intersections
        sat_angle = satellite.angle
        h.closest_approach = h.current_distance
        h.time_to_closest_approach = None
        
        for tick, p_pt in enumerate(h.predicted_path):
            pred_sat_angle = (sat_angle + (sat_speed * (tick + 1))) % 360
            pred_sat_x = sat_radius * math.cos(math.radians(pred_sat_angle))
            pred_sat_y = sat_radius * math.sin(math.radians(pred_sat_angle))
            
            p_dist = math.hypot(pred_sat_x - p_pt.x, pred_sat_y - p_pt.y)
            if p_dist < h.closest_approach:
                h.closest_approach = p_dist
                h.time_to_closest_approach = tick + 1

        # Calculate threat score (0-100)
        base_score = 0.0
        if h.closest_approach < 15:
            base_score += 50
        elif h.closest_approach < 30:
            base_score += 25
            
        if h.time_to_closest_approach is not None:
            time_factor = max(0, 50 - (h.time_to_closest_approach * 3))
            base_score += time_factor
            
        base_score += max(0, (100 - h.closest_approach) * 0.2)
        
        h.threat_score = min(100, int(base_score * h.confidence_value))
        
        # Only the primary (designated) threat gets elevated threat_level
        # All others stay "low" so they don't turn red
        designated_id = simulator.get_state().get("designated_primary_id")
        if h.id == designated_id:
            h.threat_level = collision_risk(h.closest_approach, h.time_to_closest_approach)
            primary_id = h.id
            if h.closest_approach < 15:
                global_intersect_time = h.time_to_closest_approach
        else:
            h.threat_level = "low"

    return primary_id, global_min_dist, global_intersect_time


def collision_risk(nearest_dist: float, intersect_time: int | None) -> str:
    """Return 'low', 'medium', or 'high' based on predictive interception."""
    if intersect_time is not None:
        if intersect_time <= 3:
            return "critical"
        if intersect_time <= 7:
            return "high"
        return "medium"
        
    if nearest_dist < 15:
        return "high"
    if nearest_dist < 30:
        return "medium"
    return "low"


# ---------- health ----------

def evaluate_health(telemetry: Telemetry) -> HealthStatus:
    """Analyse telemetry and return overall health + issue list."""
    issues: list[str] = []
    worst = "nominal"

    if telemetry.battery < 15:
        issues.append("Battery critical")
        worst = "critical"
    elif telemetry.battery < 25:
        issues.append("Battery low")
        if worst != "critical":
            worst = "warning"

    if telemetry.temperature > 85:
        issues.append("Temperature critical")
        worst = "critical"
    elif telemetry.temperature > 70:
        issues.append("Temperature elevated")
        if worst != "critical":
            worst = "warning"

    if telemetry.communication < 25:
        issues.append("Communication degraded critically")
        worst = "critical"
    elif telemetry.communication < 40:
        issues.append("Communication weak")
        if worst != "critical":
            worst = "warning"

    return HealthStatus(status=worst, issues=issues)


# ---------- events & priority queue ----------

def generate_events(
    state: dict, 
    health: HealthStatus, 
    solar_weather: SolarWeather,
    earth_events: list[EarthEvent]
) -> list[Event]:
    """Analyze state to generate system events and order them by priority."""
    events: list[Event] = []
    
    # 1. Collision Risk (Highest Priority)
    risk_level = state.get("collision_risk", "low")
    if risk_level in ["high", "critical"]:
        events.append(Event(
            type="collision_risk",
            severity=risk_level.upper(),
            priority=1 if risk_level == "critical" else 2,
            description=f"To'qnashuv xavfi: {risk_level.upper()}"
        ))

    # 2. Overheating (Health)
    if "Temperature critical" in health.issues or "Temperature elevated" in health.issues:
        severity = "CRITICAL" if "Temperature critical" in health.issues else "HIGH"
        events.append(Event(
            type="overheating",
            severity=severity,
            priority=3 if severity == "CRITICAL" else 4,
            description=f"Harorat oshishi: {severity}"
        ))

    # 3. Solar Storm
    if solar_weather.level in ["high", "critical"]:
        events.append(Event(
            type="solar_storm",
            severity=solar_weather.level.upper(),
            priority=5 if solar_weather.level == "critical" else 6,
            description=f"Quyosh bo'roni: {solar_weather.level.upper()}"
        ))
        
    # 4. Earth Events
    for e in earth_events:
        severity = "HIGH" if e.confidence > 0.9 else "MEDIUM"
        events.append(Event(
            type="earth_event",
            severity=severity,
            priority=7 if severity == "HIGH" else 8,
            description=f"Yerdagi voqea: {e.event} ({e.location})"
        ))

    # Sort events by priority (1 is highest priority, so sort ascending)
    events.sort(key=lambda x: x.priority)
    
    return events
