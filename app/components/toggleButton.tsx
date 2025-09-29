"use client";
import { useInteractionMode } from "./interactionModeContext";
//import styles from "../../components/toggleButton.module.css";

export default function ToggleButton() {
  const { interactionMode, toggleInteractionMode } = useInteractionMode();

  return (
    <button onClick={toggleInteractionMode} className="toggleButton">
      {interactionMode === "swipe"
        ? "Switch to Tap Mode"
        : "Switch to Swipe Mode"}
    </button>
  );
}
