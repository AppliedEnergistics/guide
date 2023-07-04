export default async function decompress(response: Response): Promise<Response>;
export default async function decompress(blob: Blob): Promise<Response>;
export default async function decompress(
  response: Response | Blob
): Promise<Response> {
  let blob: Blob;
  if (response instanceof Blob) {
    blob = response;
  } else {
    blob = await response.blob();
  }

  // Fallback for browsers without support for DecompressionStream
  if (typeof DecompressionStream === "undefined") {
    const fallbackDecompress = await import("./decompressFallback.ts");
    const data = await fallbackDecompress.default(blob);
    return new Response(data);
  }

  const ds = new DecompressionStream("gzip");
  const decompressedStream = blob.stream().pipeThrough(ds);
  return new Response(decompressedStream);
}
