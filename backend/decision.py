"""Orbital Guardian AI — Priority-based Decision Engine."""

from __future__ import annotations
from schemas import Decision, Event


def make_decision(priority_queue: list[Event]) -> Decision:
    """Evaluate priority events and produce a unified action."""
    
    if not priority_queue:
        return Decision(
            decision="NORMAL REJIM",
            reason=["Barcha tizimlar me'yorida ishlayapti", "Trayektoriya xavfsiz"]
        )

    # Collect decisions and reasons based on events
    actions = set()
    reasons = []
    
    # Process the most critical events first
    for event in priority_queue:
        if event.type == "collision_risk":
            if event.severity == "CRITICAL":
                actions.add("UKLONISH")
                reasons.append("Sun'iy yo'ldosh to'qnashib ketishi mumkin va to'qnashmaslik uchun tezligini o'zgartirmoqda")
            elif event.severity == "HIGH":
                actions.add("ORBITA MOSLASHUVI")
                reasons.append("Yaqinlashish xavfi yuqori")
                
        elif event.type == "overheating":
            actions.add("XAVFSIZ REJIM")
            reasons.append("Harorat me'yoridan oshgan")
            
        elif event.type == "solar_storm":
            actions.add("YUKLAMANI KAMAYTIRISH")
            reasons.append("Quyosh bo'roni faollashgan")
            
        elif event.type == "earth_event":
            # Earth events don't usually require satellite action unless requested,
            # but we can add tracking mode.
            actions.add("FAOL KUZATUV")
            reasons.append(event.description)

    # Combine actions into a cohesive string
    if not actions:
        actions.add("KUZATUV")
        reasons.append("Kichik anomaliyalar qayd etildi")
        
    # Standardize order for UI
    order = {"UKLONISH": 1, "ORBITA MOSLASHUVI": 2, "XAVFSIZ REJIM": 3, "YUKLAMANI KAMAYTIRISH": 4, "FAOL KUZATUV": 5, "KUZATUV": 6}
    sorted_actions = sorted(list(actions), key=lambda x: order.get(x, 99))
    
    final_decision = " + ".join(sorted_actions)

    return Decision(
        decision=final_decision,
        reason=reasons
    )
