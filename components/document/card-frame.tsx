import type { ComponentProps, ReactNode } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * The one card layout shared by the editor canvas, the reader view, and
 * print: picture beside the sentences. The responsive layout stacks them in
 * narrow containers (it follows the nearest `@container`, so a phone frame
 * inside the preview behaves like a phone).
 */
export function CardFrame({
  layout = "row",
  image,
  imageSlot,
  label,
  children,
  className,
  ...props
}: Omit<ComponentProps<"article">, "children"> & {
  layout?: "row" | "responsive";
  image?: { src: string; alt: string } | null;
  /** Replaces the plain picture, e.g. with a selectable button in the editor. */
  imageSlot?: ReactNode;
  label?: ReactNode;
  children: ReactNode;
}) {
  const picture =
    imageSlot ??
    (image ? (
      <Image
        src={image.src}
        alt={image.alt}
        width={320}
        height={240}
        unoptimized
        className="aspect-[4/3] w-full rounded-xl object-cover"
      />
    ) : null);

  return (
    <article
      className={cn(
        "flex gap-5 rounded-2xl bg-card p-5 ring-1 ring-hairline",
        layout === "responsive" ? "flex-col @min-[40rem]:flex-row" : "flex-row",
        className,
      )}
      {...props}
    >
      {picture && (
        <div
          className={cn(
            "shrink-0",
            layout === "responsive" ? "w-full @min-[40rem]:w-[38%]" : "w-[36%]",
          )}
        >
          {picture}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {label}
        {children}
      </div>
    </article>
  );
}

export function SectionHeading({
  number,
  children,
  className,
}: {
  number: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        aria-hidden="true"
        className="flex size-[1.6em] shrink-0 items-center justify-center rounded-full bg-foreground text-[0.8em] font-bold text-background"
      >
        {number}
      </span>
      {children}
    </div>
  );
}
