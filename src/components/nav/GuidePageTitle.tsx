"use client";
import { ReactElement, useEffect } from "react";
import { useGuidePageTitleSetter } from "@component/nav/GuidePageTitleProvider.tsx";

export interface GuidePageTitleProps {
  title: ReactElement | undefined;
}

function GuidePageTitle({ title }: GuidePageTitleProps) {
  const setPageTitle = useGuidePageTitleSetter();
  useEffect(() => {
    setPageTitle(title ?? null);
    return () => {
      setPageTitle(null);
    };
  }, [setPageTitle, title]);
  return null;
}

export default GuidePageTitle;
