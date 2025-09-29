import { useState, TouchEvent, useCallback } from "react";
import { useInteractionMode } from "./interactionModeContext";
import { to } from "@react-spring/web";

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
  const { interactionMode, toggleInteractionMode } = useInteractionMode();

  //const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const [longPressTimeout, setLongPressTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const LONG_PRESS_DELAY = 800; // ms

  const minSwipeDistance = 20; // Minimum distance to consider a swipe
  const dragThreshold = 5; // Minimum distance to consider a drag

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

      setLongPressTimeout(timeout);
    },
    [longPressTimeout, isDragging]
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
      if (dx > dragThreshold || (dy > dragThreshold && !isDragging)) {
        setIsDragging(true);

        // clear long press timeout when dragging starts
        if (longPressTimeout) {
          clearTimeout(longPressTimeout);
          setLongPressTimeout(null);
        }
      }
      setTouchEnd({ x: touch.clientX, y: touch.clientY });
    },
    [touchStart, dragThreshold, longPressTimeout, isDragging]
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
    const dy = Math.abs(touchEnd.y - touchStart.y);
    const dt = Date.now() - touchStart.time;

    // If quick tap: no dragging.
    if (!isDragging && dt < 200 && dx < dragThreshold && dy < dragThreshold) {
      if (interactionMode === "tap") {
        return "tap"; // already in tap mode
      }
      //setInteractionMode("tap");
      return null;
    }

    // handle swipe in swipe mode
    if (dx > minSwipeDistance && interactionMode === "swipe") {
      if (dx > dy) {
        return "swipe"; // valid swipe gesture
      }
    }

    return null; //neither
  }, [
    touchStart,
    touchEnd,
    isDragging,
    dragThreshold,
    minSwipeDistance,
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
