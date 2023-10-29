"use client";

import { createContext, useContext } from "react";

type GuidePageTitleSetter = (title: string) => void;

const context = createContext<GuidePageTitleSetter>(() => {});

export function useGuidePageTitleSetter() {
  return useContext(context);
}

export const GuidePageTitleProvider = context.Provider;
