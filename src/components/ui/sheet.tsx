"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-[100] bg-black/60 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  style: styleProp,
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}) {
  const NAVBAR_H = 64;
  const GAP_TOP  = NAVBAR_H + 12;
  const GAP_BTM  = 20;

  const sideStyles: Record<string, React.CSSProperties> = {
    left:   { position: "fixed", top: GAP_TOP, left: 0,   bottom: GAP_BTM, width: "78%", maxWidth: "340px" },
    right:  { position: "fixed", top: GAP_TOP, right: 0,  bottom: GAP_BTM, width: "78%", maxWidth: "340px" },
    top:    { position: "fixed", top: 0,    left: 12, right: 12 },
    bottom: { position: "fixed", bottom: 0, left: 12, right: 12 },
  }

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        style={{ ...sideStyles[side], ...styleProp }}
        className={cn(
          "z-[101] flex flex-col bg-background text-sm shadow-2xl transition duration-200 ease-in-out",
          "data-ending-style:opacity-0 data-starting-style:opacity-0",
          side === "left"  && "rounded-r-2xl sheet-fade-glow data-ending-style:-translate-x-full data-starting-style:-translate-x-full",
          side === "right" && "rounded-l-2xl sheet-fade-glow data-ending-style:translate-x-full data-starting-style:translate-x-full",
          side === "top"   && "rounded-b-2xl border-b h-auto data-ending-style:-translate-y-full data-starting-style:-translate-y-full",
          side === "bottom"&& "rounded-t-2xl border-t h-auto data-ending-style:translate-y-full data-starting-style:translate-y-full",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-4 right-4"
                size="icon-sm"
              />
            }
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn(
        "flex flex-col gap-1 px-5 pt-5 pb-3 pr-12",
        className
      )}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        "mt-auto flex flex-col gap-2 px-5 pt-3 pb-5",
        className
      )}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-base font-medium text-foreground", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
