"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { animate } from "motion/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

const DialogDismissContext = React.createContext(false);

/** TDS dialog wiggle: a quick horizontal shake when the dim is tapped but the dialog refuses to close. */
function wiggle(element: HTMLElement | null) {
  if (!element) return;
  animate(
    element,
    { x: [0, 2, -4, 3, -1, 0] },
    { duration: 0.35, ease: "linear" },
  );
}

const dialogOverlayClassName =
  "fixed inset-0 isolate z-50 bg-overlay transition-none duration-(--duration-spring-quick) ease-spring-quick data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0";

const dialogPopupClassName =
  "fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-[24px] bg-popover text-sm text-popover-foreground shadow-dialog ring-1 ring-hairline transition-none duration-(--duration-spring-quick) ease-spring-quick outline-none data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-bottom-8 data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-bottom-4";

function Dialog({
  disablePointerDismissal = false,
  ...props
}: DialogPrimitive.Root.Props) {
  return (
    <DialogDismissContext.Provider value={disablePointerDismissal}>
      <DialogPrimitive.Root
        data-slot="dialog"
        disablePointerDismissal={disablePointerDismissal}
        {...props}
      />
    </DialogDismissContext.Provider>
  );
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(dialogOverlayClassName, className)}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ref,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean;
}) {
  const disablePointerDismissal = React.useContext(DialogDismissContext);
  const popupRef = React.useRef<HTMLDivElement>(null);

  return (
    <DialogPortal>
      <DialogOverlay
        onClick={
          disablePointerDismissal ? () => wiggle(popupRef.current) : undefined
        }
      />
      <DialogPrimitive.Popup
        ref={(node) => {
          popupRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        data-slot="dialog-content"
        className={cn(
          dialogPopupClassName,
          "grid w-full max-w-[calc(100%-2rem)] gap-5 p-6 sm:max-w-md",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-4 right-4 text-muted-foreground"
                size="icon-sm"
              />
            }
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 pr-6", className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-2 mt-1 -mb-2 flex gap-2 *:h-12 *:flex-1 *:rounded-[14px] *:text-base",
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="secondary" />}>
          Close
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-heading text-xl leading-[1.35] font-bold tracking-tight whitespace-pre-line",
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-md leading-normal font-medium whitespace-pre-line text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  dialogOverlayClassName,
  dialogPopupClassName,
  wiggle,
};
