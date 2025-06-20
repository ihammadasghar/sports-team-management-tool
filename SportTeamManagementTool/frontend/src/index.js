import React from "react";
import ReactDOM from "react-dom/client"; // For React 18+
import AppWrapper from "./App"; // Import the AppWrapper from App.js

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);
