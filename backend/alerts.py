"""Orbital Guardian AI — Alert generator."""

from __future__ import annotations
from schemas import Alert, Telemetry, HealthStatus, SolarWeather
from typing import Optional


def generate_alerts(
    collision_risk: str,
    time_to_intersect: int | None,
    solar_weather: SolarWeather,
    telemetry: Telemetry,
    health: HealthStatus,
) -> list[Alert]:
    """Build an ordered list of alerts from current conditions."""
    alerts: list[Alert] = []

    # --- collision ---
    if collision_risk == "critical":
        alerts.append(Alert(level="critical", message=f"IMMINENT COLLISION PREDICTED (T-{time_to_intersect})"))
    elif collision_risk == "high":
        alerts.append(Alert(level="critical", message="Hazard intersecting safety sphere"))
    elif collision_risk == "medium":
        alerts.append(Alert(level="warning", message="Tracking converging object vector"))

    # --- health issues ---
    for issue in health.issues:
        level = "critical" if "critical" in issue.lower() else "warning"
        alerts.append(Alert(level=level, message=issue))

    # --- solar weather ---
    if solar_weather.level == "critical":
        alerts.append(Alert(level="critical", message="Solar flux reaching destructive thresholds"))
    elif solar_weather.level == "high":
        alerts.append(Alert(level="warning", message="High solar interference degrading Tx/Rx"))


    # --- all clear ---
    if not alerts:
        alerts.append(Alert(level="info", message="Systems Nominal. Orbit clear."))

    return alerts
