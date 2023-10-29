import { Guide } from "../build-data/Guide.ts";

/**
 * All custom guide components get a copy of the guide.
 */
export interface CustomGuideElementProps {
  currentPageId?: string;
  guide: Guide;
}
