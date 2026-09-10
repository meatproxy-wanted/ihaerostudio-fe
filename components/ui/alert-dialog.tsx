"use client";

import * as React from "react";
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  dialogOverlayClassName,
  dialogPopupClassName,
  wiggle,
} from "@/components/ui/dialog";

/**
 * TDS AlertDialog / ConfirmDialog: a 320px card with a bold title, a
 * medium-weight description and equal-width 48px buttons. Tapping the dim
 * never closes it; the card wiggles instead.
 */
function AlertDialog({ ...props }: AlertDialogPrimitive.Root.Props) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger({ ...props }: AlertDialogPrimitive.Trigger.Props) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  );
}

function AlertDialogPortal({ ...props }: AlertDialogPrimitive.Portal.Props) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  );
}

function AlertDialogOverlay({
  className,
  ...props
}: AlertDialogPrimitive.Backdrop.Props) {
  return (
    <AlertDialogPrimitive.Backdrop
      data-slot="alert-dialog-overlay"
      className={cn(dialogOverlayClassName, className)}
      {...props}
    />
  );
}

function AlertDialogContent({
  className,
  size = "default",
  ref,
  ...props
}: AlertDialogPrimitive.Popup.Props & {
  size?: "default" | "sm";
}) {
  const popupRef = React.useRef<HTMLDivElement>(null);

  return (
    <AlertDialogPortal>
      <AlertDialogOverlay onClick={() => wiggle(popupRef.current)} />
      <AlertDialogPrimitive.Popup
        ref={(node) => {
          popupRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn(
          dialogPopupClassName,
          "group/alert-dialog-content flex w-full flex-col gap-5 p-6 data-[size=default]:max-w-[calc(100%-2rem)] data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-sm",
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn(
        "grid gap-2 text-left has-data-[slot=alert-dialog-media]:grid-cols-[auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-4",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "-mx-2 -mb-2 mt-1 flex gap-2 *:h-12 *:flex-1 *:rounded-[14px] *:text-base",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogMedia({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-media"
      className={cn(
        "row-span-2 inline-flex size-12 items-center justify-center rounded-full bg-muted *:[svg:not([class*='size-'])]:size-6",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(
        "font-heading text-xl leading-[1.35] font-bold tracking-tight whitespace-pre-line",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn(
        "text-md leading-normal font-medium whitespace-pre-line text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="alert-dialog-action"
      className={cn(className)}
      {...props}
    />
  );
}

function AlertDialogCancel({
  className,
  variant = "secondary",
  size = "default",
  ...props
}: AlertDialogPrimitive.Close.Props &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-cancel"
      className={cn(className)}
      render={<Button variant={variant} size={size} />}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
