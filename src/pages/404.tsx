"use client";

import { usePathname } from "next/navigation";

function GuidebookPageNotFound() {
  const pathname = usePathname();
  return (
    <>
      <h2>Page not found</h2>
      <p>The page {pathname} was not found.</p>
    </>
  );
}

export default GuidebookPageNotFound;
