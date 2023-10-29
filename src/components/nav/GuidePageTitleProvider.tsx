"use client";

import { createContext, ReactElement, useContext } from "react";

type GuidePageTitleSetter = (title: ReactElement | null) => void;

const context = createContext<GuidePageTitleSetter>(() => {});

export function useGuidePageTitleSetter() {
  return useContext(context);
}

export const GuidePageTitleProvider = context.Provider;
