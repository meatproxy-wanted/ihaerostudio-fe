"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-md border border-input bg-card px-3 py-2 text-sm font-medium transition-[color,border-color,background-color] duration-200 outline-none placeholder:font-normal placeholder:text-muted-foreground/80 hover:border-primary/50 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:hover:border-destructive aria-invalid:focus-visible:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
