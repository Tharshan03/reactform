import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// tes composants restent dans src/components/*
import BookingFormApp from "./components/BookingFormApp.jsx";

const mountEl = document.getElementById("padpt-booking-root");
if (mountEl) {
  createRoot(mountEl).render(<BookingFormApp />);
}
