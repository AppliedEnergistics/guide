import type { Metadata } from "next";
import "./index.css";
import { PropsWithChildren } from "react";

export const metadata: Metadata = {
  title: "AE2 Players Guide",
  metadataBase: new URL("https://guide.appliedenergistics.org"),
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
