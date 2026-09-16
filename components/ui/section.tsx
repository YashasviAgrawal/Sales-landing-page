import type { ReactNode } from "react";

export function Section({
  id,
  children,
  className = "",
  bleed = false,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  bleed?: boolean;
}) {
  return (
    <section
      id={id}
      className={`section-y scroll-mt-24 ${className}`}
    >
      <div className={bleed ? "" : "mx-auto w-full max-w-[1240px] gutter-x"}>
        {children}
      </div>
    </section>
  );
}
