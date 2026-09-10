"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex cursor-pointer items-center gap-2 text-2sm leading-none font-medium text-foreground/85 select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 has-data-disabled:cursor-not-allowed has-data-disabled:text-muted-foreground/70 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-data-disabled:cursor-not-allowed peer-data-disabled:text-muted-foreground/70",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
