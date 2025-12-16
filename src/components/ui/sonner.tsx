"use client"

import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      icons={{
        success: <CircleCheck className="h-4 w-4 text-emerald-400" />,
        info: <Info className="h-4 w-4 text-amber-400" />,
        warning: <TriangleAlert className="h-4 w-4 text-amber-500" />,
        error: <OctagonX className="h-4 w-4 text-rose-400" />,
        loading: <LoaderCircle className="h-4 w-4 animate-spin text-zinc-400" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-zinc-950 group-[.toaster]:text-white group-[.toaster]:border group-[.toaster]:border-white/10 group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-zinc-400 group-[.toast]:text-sm",
          actionButton:
            "group-[.toast]:bg-white group-[.toast]:text-black group-[.toast]:rounded-full group-[.toast]:font-medium group-[.toast]:shadow-md",
          cancelButton:
            "group-[.toast]:bg-zinc-800 group-[.toast]:text-zinc-300 group-[.toast]:rounded-full group-[.toast]:border group-[.toast]:border-white/10",
          success: "group-[.toaster]:border-emerald-500/20",
          error: "group-[.toaster]:border-rose-500/20",
          warning: "group-[.toaster]:border-amber-500/20",
          info: "group-[.toaster]:border-amber-500/20",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
