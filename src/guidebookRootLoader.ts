import { LoaderFunctionArgs } from "react-router-dom";

export default async function ({ params }: LoaderFunctionArgs) {
  const version = params.version;
  if (!version) {
    throw new Error("Version parameter missing");
  }

  return fetch(`guide-assets/${version}/!index.json`);
}
