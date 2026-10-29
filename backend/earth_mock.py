"""Mock AI for detecting Earth disasters from satellite imagery."""

import random
from schemas import EarthEvent

LOCATIONS = [
    "Toshkent", "Samarqand", "Buxoro", "Farg'ona vodiysi", "Xorazm", "Qoraqalpog'iston", "Surxondaryo", "Andijon", "Namangan", "Navoiy"
]

EVENT_TYPES = [
    "Yong'in", "Suv toshqini", "Vayronagarchilik"
]

_active_events: list[EarthEvent] = []

def generate_earth_events(step: int) -> list[EarthEvent]:
    """Occasionally generate or remove earth events to simulate detection."""
    global _active_events
    
    # Force filter out old non-Uzbekistan events
    _active_events = [e for e in _active_events if e.location in LOCATIONS]
    
    # 5% chance to spawn a new event if we have less than 2
    if random.random() < 0.05 and len(_active_events) < 2:
        _active_events.append(
            EarthEvent(
                event=random.choice(EVENT_TYPES),
                location=random.choice(LOCATIONS),
                confidence=round(random.uniform(0.70, 0.98), 2)
            )
        )
        
    # 2% chance to clear the oldest event
    if random.random() < 0.02 and _active_events:
        _active_events.pop(0)
        
    return _active_events
