import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

export function SceneDebugger() {
 const { gl } = useThree();
 
 useEffect(() => {
 const interval = setInterval(() => {
 console.log(`[RENDER CALLS] ${gl.info.render.calls}`);
 }, 2000);
 
 return () => clearInterval(interval);
 }, [gl]);
 
 return null;
}
