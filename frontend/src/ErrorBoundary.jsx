import React from 'react';

export class GlobalErrorBoundary extends React.Component {
 constructor(props) {
 super(props);
 this.state = { hasError: false, error: null };
 }

 static getDerivedStateFromError(error) {
 return { hasError: true, error };
 }

 componentDidCatch(error, info) {
 console.error("[REACT CRASH]", error, info);
 window.__MY_ERROR__ = error.toString() + "\n" + info.componentStack;
 }

 render() {
 if (this.state.hasError) {
 return <div style={{ color: 'red' }}>Error: {this.state.error.toString()}</div>;
 }
 return this.props.children;
 }
}
