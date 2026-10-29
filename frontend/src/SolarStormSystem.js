/**
 * SolarStormSystem.js
 * 
 * Clean architecture extension layer for Solar Storm simulation.
 * This runs independently of the core physics and collision simulation.
 */

// 1. Global System State (NEW)
export const systemState = {
 solarStorm: false,
 stormIntensity: "LOW",
 collisionRisk: "LOW",
 safeMode: false,
 signalStrength: 100,
 speedFactor: 1.0 // Modifies activity but NOT core orbit logic
};

// Simple event listener array for UI reactivity
const listeners = [];
export function subscribeToState(callback) {
 listeners.push(callback);
 return () => {
 const idx = listeners.indexOf(callback);
 if (idx > -1) listeners.splice(idx, 1);
 };
}

function notifyListeners() {
 const stateCopy = { ...systemState };
 listeners.forEach(cb => cb(stateCopy));
}

// 2. Event Manager (NON-DESTRUCTIVE)
export function updateEvents(backendCollisionRisk) {
 let changed = false;

 // Sync collision risk from the main system to our standalone state
 if (systemState.collisionRisk !== backendCollisionRisk) {
 systemState.collisionRisk = backendCollisionRisk;
 changed = true;
 }

 // Randomly trigger solar storm (simulated 1% chance per update interval)
 // We reduce probability to 0.001 per frame so it doesn't happen constantly at 60fps
 if (!systemState.solarStorm && Math.random() < 0.0005) {
 systemState.solarStorm = true;
 systemState.stormIntensity = "HIGH";
 changed = true;
 
 // Auto-disable storm after some time to simulate passing
 setTimeout(() => {
 systemState.solarStorm = false;
 systemState.stormIntensity = "LOW";
 notifyListeners();
 }, 5000 + Math.random() * 5000); // 5-10 seconds
 }

 if (changed) {
 notifyListeners();
 }
}

// 3. AI Decision Layer (SEPARATE)
export function aiDecision(state) {
 if (state.collisionRisk === "high" || state.collisionRisk === "critical") {
 return "EVASION";
 }

 if (state.solarStorm && state.stormIntensity === "HIGH") {
 return "SAFE_MODE";
 }

 return "NORMAL";
}

// 4. Safe Mode Behavior (SOFT EFFECT)
// Applies soft modifiers without rewriting physics
export function applySoftModifiers(decision) {
 let changed = false;

 const previousSafeMode = systemState.safeMode;
 
 if (decision === "SAFE_MODE") {
 systemState.safeMode = true;
 systemState.speedFactor = 0.5; // Satellite reduces activity/speed logically
 systemState.signalStrength = Math.max(0, systemState.signalStrength - 1); // Gradually reduce
 } else {
 systemState.safeMode = false;
 systemState.speedFactor = 1.0;
 systemState.signalStrength = Math.min(100, systemState.signalStrength + 1); // Gradually recover
 }

 if (previousSafeMode !== systemState.safeMode) {
 changed = true;
 }

 if (changed) {
 notifyListeners();
 }
}
