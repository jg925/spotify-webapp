"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { InteractionMode } from "./types";

interface InteractionModeContextType {
  interactionMode: InteractionMode;
  setInteractionMode: (mode: InteractionMode) => void;
  toggleInteractionMode: () => void;
  resetToSwipeMode: () => void; // forces swipe mode
}

const InteractionModeContext = createContext<
  InteractionModeContextType | undefined
>(undefined);

export function InteractionModeProvider({ children }: { children: ReactNode }) {
  const [interactionMode, setInteractionModeState] =
    useState<InteractionMode>("swipe");

  const setInteractionMode = useCallback((mode: InteractionMode) => {
    console.log("global mode changed to:", mode); //debug log
    setInteractionModeState(mode);
  }, []);

  const toggleInteractionMode = useCallback(() => {
    setInteractionModeState((prev) => (prev === "swipe" ? "tap" : "swipe"));
  }, []);

  //reset to swipe mode
  const resetToSwipeMode = useCallback(() => {
    console.log("Resetting interaction mode to swipe");
    setInteractionModeState("swipe");
  }, []);

  return (
    <InteractionModeContext.Provider
      value={{
        interactionMode,
        setInteractionMode,
        toggleInteractionMode,
        resetToSwipeMode,
      }}
    >
      {children}
    </InteractionModeContext.Provider>
  );
}

export function useInteractionMode() {
  const context = useContext(InteractionModeContext);
  if (context === undefined) {
    throw new Error(
      "useInteractionMode must be used within an InteractionModeProvider"
    );
  }
  return context;
}
