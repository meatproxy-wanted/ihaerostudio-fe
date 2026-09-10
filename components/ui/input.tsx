"use client";

import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

function Input({
  className,
  type,
  size = "default",
  ...props
}: Omit<React.ComponentProps<"input">, "size"> & {
  size?: "default" | "sm";
}) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      data-size={size}
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-input bg-card px-3 py-1 text-sm font-medium transition-[color,border-color,background-color] duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:font-normal placeholder:text-muted-foreground/80 hover:border-primary/50 focus-visible:border-primary disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:hover:border-destructive aria-invalid:focus-visible:border-destructive data-[size=sm]:h-8 data-[size=sm]:rounded-[8px] data-[size=sm]:px-2.5 data-[size=sm]:text-2sm",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
