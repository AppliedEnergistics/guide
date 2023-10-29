"use client";

import { useEffect, useState } from "react";
import ErrorText from "@component/ErrorText.tsx";
import css from "@component/recipes/recipe.module.css";
import type { FluidInfo } from "../../build-data/Guide.ts";

/**
 * Cycles through the fluids that this recipe can be done in.
 */
export function FluidTransformCircumstance({
  baseUrl,
  fluids,
}: {
  baseUrl: string;
  fluids: FluidInfo[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let interval: number | undefined;
    if (fluids.length > 1) {
      interval = window.setInterval(
        () => setCurrentIndex((idx) => (idx + 1) % fluids.length),
        1000,
      );
    }

    return () => {
      if (interval !== undefined) {
        window.clearInterval(interval);
      }
      setCurrentIndex(0);
    };
  }, [fluids]);

  if (fluids.length == 0) {
    return <ErrorText>No fluids in transform recipe</ErrorText>;
  }

  const fluidInfo = fluids[currentIndex % fluids.length];

  return (
    <>
      <img className={css.fluidIcon} src={baseUrl + fluidInfo.icon} alt="" />
      {" Throw in " + fluidInfo.displayName}
    </>
  );
}
