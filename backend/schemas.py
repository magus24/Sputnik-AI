"""Pydantic schemas for Orbital Guardian AI."""

from __future__ import annotations
from pydantic import BaseModel
from typing import Optional


# ---------- primitives ----------

class Position(BaseModel):
    x: float
    y: float
    angle: float  # degrees along orbit


class TrajectoryPoint(BaseModel):
    x: float
    y: float


class HazardObject(BaseModel):
    id: str
    type: str            # "debris" | "meteoroid" | "asteroid_fragment"
    x: float
    y: float
    vx: float
    vy: float
    threat_level: str    # "low" | "medium" | "high" | "critical"
    predicted_path: list[TrajectoryPoint]
    past_positions: list[TrajectoryPoint] = []
    confidence_value: float = 1.0
    threat_score: int = 0
    current_distance: float = 0.0
    closest_approach: float = 0.0
    time_to_closest_approach: Optional[int] = None


class Telemetry(BaseModel):
    battery: float       # 0-100 %
    temperature: float   # °C
    communication: float # 0-100 %


class SolarWeather(BaseModel):
    level: str           # "low" | "elevated" | "high" | "critical"
    impact: str
    recommendation: str


# ---------- derived ----------

class HealthStatus(BaseModel):
    status: str          # "nominal" | "warning" | "critical"
    issues: list[str]


class Alert(BaseModel):
    level: str           # "info" | "warning" | "critical"
    message: str


class Event(BaseModel):
    type: str            # "collision_risk" | "overheating" | "solar_storm" | "earth_event"
    severity: str        # "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    priority: int        # 1 = highest
    description: str


class EarthEvent(BaseModel):
    event: str           # "fire" | "flood" | "destruction"
    location: str
    confidence: float


class Decision(BaseModel):
    decision: str        # e.g., "UKLONISH + XAVFSIZ REJIM"
    reason: list[str]    # list of reasons for the decision


# ---------- composite ----------

class FullState(BaseModel):
    scenario_id: str
    scenario_name: str
    satellite: Position
    moon: Position
    hazard_objects: list[HazardObject]
    primary_hazard_id: Optional[str]
    telemetry: Telemetry
    solar_weather: SolarWeather
    collision_risk: str
    orbital_risk_score: int
    solar_risk_score: int
    combined_mission_risk_score: int
    nearest_hazard_id: Optional[str]
    nearest_hazard_distance: float
    time_to_closest_approach: Optional[int]
    health_status: str
    issues: list[str]
    alerts: list[Alert]
    events: list[Event]
    earth_events: list[EarthEvent]
    priority_queue: list[Event]
    decision: str
    reason: list[str]
    step: int


class StatusResponse(BaseModel):
    system: str
    status: str
