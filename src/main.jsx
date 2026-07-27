import React from "react";
import { createRoot } from "react-dom/client";
import Portfolio from "./views/Portfolio";
import Admin from "./views/Admin";
import CustomCursor from "./components/CustomCursor";
import ErrorBoundary from "./components/ErrorBoundary";
import "./styles.css";

function App() {
  return (
    <>
      <CustomCursor />
      {window.location.pathname.startsWith("/admin") ? <Admin /> : <Portfolio />}
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
