"use client";
import { useEffect } from "react";
import { useGuidePageTitleSetter } from "@component/nav/GuidePageTitleProvider.tsx";

export interface GuidePageTitleProps {
  title: string;
}

function GuidePageTitle({ title }: GuidePageTitleProps) {
  const setPageTitle = useGuidePageTitleSetter();
  useEffect(() => {
    setPageTitle(title);
    return () => {
      setPageTitle("");
    };
  }, [setPageTitle, title]);
  return null;
}

export default GuidePageTitle;
