"use client";
import { ReactNode, useEffect, useState } from "react";

function CyclingIngredient({ children }: { children: ReactNode[] }) {
  const [visibleIndex, setVisibleIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleIndex((idx) => ++idx % children.length);
    }, 1000);
    return () => clearInterval(interval);
  }, [children]);

  return children[visibleIndex];
}

export default CyclingIngredient;
