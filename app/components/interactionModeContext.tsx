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

export const InteractionModeContext = createContext<
  InteractionModeContextType | undefined
>(undefined);

export function InteractionModeProvider({ children }: { children: ReactNode }) {
  const [interactionMode, setInteractionModeState] =
    useState<InteractionMode>("swipe");

  const setInteractionModeStateLogged = useCallback(
    (value: InteractionMode | ((prev: InteractionMode) => InteractionMode)) => {
      setInteractionModeState((prev) => {
        const next =
          typeof value === "function"
            ? (value as (p: InteractionMode) => InteractionMode)(prev)
            : value;
        console.log("global mode changed to:", next); //debug log
        return next;
      });
    },
    []
  );

  const setInteractionMode = useCallback(
    (mode: InteractionMode) => {
      //console.log("global mode changed to:", mode); //debug log
      setInteractionModeStateLogged(mode);
    },
    [setInteractionModeStateLogged]
  );

  const toggleInteractionMode = useCallback(() => {
    setInteractionModeStateLogged((prev) =>
      prev === "swipe" ? "tap" : "swipe"
    );
  }, [setInteractionModeStateLogged]);

  //reset to swipe mode
  const resetToSwipeMode = useCallback(() => {
    console.log("Resetting interaction mode to swipe");
    setInteractionModeStateLogged("swipe");
  }, [setInteractionModeStateLogged]);

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
