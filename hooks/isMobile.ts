import { useEffect, useState } from "react";

export function isMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    // only run once
    setIsMobile(window.innerWidth < breakpoint);
  }, [breakpoint]);

  return isMobile;
}
