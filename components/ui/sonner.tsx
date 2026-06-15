"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ toastOptions, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      richColors
      closeButton
      visibleToasts={4}
      gap={10}
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        duration: toastOptions?.duration ?? 3500,
        ...toastOptions,
        classNames: {
          toast:
            "cn-toast border border-border bg-popover px-4 py-3 text-popover-foreground shadow-[0_18px_55px_rgba(0,0,0,0.18)]",
          success: "border-l-4 border-l-[#e3120b]",
          loading: "border-l-4 border-l-foreground",
          error: "border-l-4 border-l-destructive",
          title: "font-serif text-base font-bold tracking-normal",
          description: "text-sm text-muted-foreground",
          icon: "text-[#e3120b]",
          closeButton:
            "border-border bg-background text-foreground hover:bg-muted",
          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
