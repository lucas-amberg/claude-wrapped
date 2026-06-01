import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

/** Shared section header: numbered index, title, and an optional sub-line. */
export function SectionHead({
  index,
  title,
  children,
}: {
  index: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Reveal as="header" className="sec-head">
      <span className="sec-index">{index}</span>
      <h2 className="sec-title">{title}</h2>
      {children ? <p className="sec-sub">{children}</p> : null}
    </Reveal>
  );
}
