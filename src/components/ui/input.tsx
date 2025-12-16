import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-white/10 bg-zinc-900/50 px-4 py-2 text-sm text-white placeholder:text-zinc-500 transition-all duration-300 focus:outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20 focus:bg-zinc-900/80 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
