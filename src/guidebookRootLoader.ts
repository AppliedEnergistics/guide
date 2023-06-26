import { LoaderFunctionArgs } from "react-router-dom";

export default async function ({ params }: LoaderFunctionArgs) {
  const version = params.version;
  if (!version) {
    throw new Error("Version parameter missing");
  }

  return fetch(`guide-assets/${version}/guide.json.gz`)
    .then((response) => {
      if (!response.ok) {
        throw response;
      }
      return response.blob();
    })
    .then((blob) => {
      const ds = new DecompressionStream("gzip");
      const decompressedStream = blob.stream().pipeThrough(ds);
      return new Response(decompressedStream).json();
    });
}
