import { useState, TouchEvent, useCallback } from "react";
import { InteractionMode } from "./types";
import { start } from "repl";

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

export function useSwipeDetection() {
  const [touchStart, setTouchStart] = useState<TouchPoint | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);
  const [interactionMode, setInteractionMode] =
    useState<InteractionMode>("swipe");

  //const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const [longPressTimeout, setLongPressTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const LONG_PRESS_DELAY = 800; // ms

  const minSwipeDistance = 50; // Minimum distance to consider a swipe
  const dragThreshold = 10; // Minimum distance to consider a drag

  /**
   * handle the start of a touch gesture
   */
  const onTouchStart = useCallback(
    (e: TouchEvent) => {
      const touch = e.targetTouches[0];
      const startTime = Date.now();

      setTouchStart({
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      });
      //setTouchStartTime(startTime);
      setIsDragging(false); // reset dragging state

      // clear any existing timeout
      if (longPressTimeout) {
        clearTimeout(longPressTimeout);
      }

      const timeout = setTimeout(() => {
        console.log("Long press detected, toggling mode"); //debug
        // toggle interaction mode on long press
        setInteractionMode((prev) => {
          const newMode = prev === "swipe" ? "tap" : "swipe";
          console.log("Mode changed from", prev, "to", newMode); //debug
          return newMode;
        });

        //provide haptic feedback if avail
        if ("vibrate" in navigator) {
          navigator.vibrate(50); // 50ms vibration
        }
      }, LONG_PRESS_DELAY);

      setLongPressTimeout(timeout);
    },
    [longPressTimeout]
  );

  /**
   * handle touch movement during gesture
   */
  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!touchStart) return; //no touch

      const touch = e.targetTouches[0];
      const dx = Math.abs(touch.clientX - touchStart.x);
      const dy = Math.abs(touch.clientY - touchStart.y);

      //if movement > threshold in any direction, drag
      if (dx > dragThreshold || dy > dragThreshold) {
        setIsDragging(true);

        // clear long press timeout when dragging starts
        if (longPressTimeout) {
          clearTimeout(longPressTimeout);
          setLongPressTimeout(null);
        }
      }
      setTouchEnd({ x: touch.clientX, y: touch.clientY });
    },
    [touchStart, dragThreshold, longPressTimeout]
  );

  /**
   * handle end of touch
   * final gesture type based on movement/timing
   * returns gesture type or null, if uncertain
   */
  const onTouchEnd = useCallback(() => {
    // clear long press timeout
    if (longPressTimeout) {
      clearTimeout(longPressTimeout);
      setLongPressTimeout(null);
    }

    if (!touchStart || !touchEnd) return null; //no touch

    const dx = Math.abs(touchEnd.x - touchStart.x);
    const dt = Date.now() - touchStart.time;

    // If quick tap: no dragging.
    if (
      !isDragging &&
      dt < 200 &&
      dx < dragThreshold &&
      interactionMode === "tap"
    ) {
      //setInteractionMode("tap");
      return "tap";
    }

    return null; //neither
  }, [
    touchStart,
    touchEnd,
    isDragging,
    dragThreshold,
    interactionMode,
    longPressTimeout,
  ]);

  return {
    interactionMode,
    isDragging,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
