import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px", color: "#ff6038", background: "#090909", minHeight: "100vh", fontFamily: "monospace", overflow: "auto" }}>
          <h2>Application Rendering Crash Caught by ErrorBoundary:</h2>
          <pre style={{ fontSize: "16px", background: "#111", padding: "15px", border: "1px solid #333" }}>{this.state.error?.toString()}</pre>
          <h3>Stack Trace:</h3>
          <pre style={{ fontSize: "12px", background: "#111", padding: "15px", border: "1px solid #333", whiteSpace: "pre-wrap" }}>{this.state.error?.stack}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}
