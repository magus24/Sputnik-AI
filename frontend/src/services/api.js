import { useEffect, useState } from 'react';

const API_BASE = "/api";
const WS_BASE = `ws://${window.location.host}/ws`;

export async function fetchFullState() {
 const res = await fetch(`${API_BASE}/full-state`);
 if (!res.ok) throw new Error("Failed to fetch state");
 return res.json();
}

export async function simulateStep() {
 const res = await fetch(`${API_BASE}/simulate-step`, { method: "POST" });
 if (!res.ok) throw new Error("Failed to simulate step");
 return res.json();
}

export async function resetSimulation() {
 const res = await fetch(`${API_BASE}/reset`, { method: "POST" });
 if (!res.ok) throw new Error("Failed to reset");
 return res.json();
}

export async function setScenario(scenario_id) {
 const res = await fetch(`${API_BASE}/scenario`, {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ scenario_id })
 });
 if (!res.ok) throw new Error("Failed to set scenario");
 return res.json();
}

export function useSputnikWebSocket() {
 const [state, setState] = useState(null);
 const [error, setError] = useState(null);
 const [isConnected, setIsConnected] = useState(false);

 useEffect(() => {
 // If running in dev mode, hardcode the backend port to 8000
 // Otherwise use window.location.host
 const wsUrl = window.location.port === "5173" || window.location.port === "3000" 
 ? `ws://127.0.0.1:8000/ws`
 : WS_BASE;
 
 let ws = null;
 let reconnectTimeout = null;
 let isComponentMounted = true;

 const connect = () => {
 if (!isComponentMounted) return;
 console.log("Connecting WebSocket to:", wsUrl);
 ws = new WebSocket(wsUrl);

 ws.onopen = () => {
 console.log('WebSocket Connected');
 setIsConnected(true);
 setError(null);
 };

 ws.onmessage = (event) => {
 try {
 const data = JSON.parse(event.data);
 setState(data);
 } catch (err) {
 console.error('Failed to parse WebSocket message', err);
 }
 };

 ws.onerror = (err) => {
 console.error('WebSocket error:', err);
 setError('WebSocket connection error');
 };

 ws.onclose = () => {
 console.log('WebSocket Disconnected. Reconnecting in 3s...');
 setIsConnected(false);
 ws = null;
 if (isComponentMounted) {
 reconnectTimeout = setTimeout(connect, 3000);
 }
 };
 };

 connect();

 return () => {
 isComponentMounted = false;
 if (reconnectTimeout) clearTimeout(reconnectTimeout);
 if (ws) ws.close();
 };
 }, []);

 return { state, error, isConnected };
}
