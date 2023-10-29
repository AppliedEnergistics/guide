"use client";

import Link, { LinkProps } from "next/link";
import { PropsWithChildren } from "react";
import { usePathname } from "next/navigation";

export default function ActiveLink({
  children,
  ...props
}: PropsWithChildren<LinkProps>) {
  const pathname = usePathname();
  return <Link {...props}>{children}</Link>;
}
