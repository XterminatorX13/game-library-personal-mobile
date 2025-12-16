import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider transition-all focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-white/10 text-white backdrop-blur-md hover:bg-white/20",
        secondary:
          "border-white/10 bg-zinc-900/60 text-zinc-300 backdrop-blur-md hover:bg-zinc-800/80",
        destructive:
          "border-rose-500/20 bg-rose-500/10 text-rose-400",
        outline: "border-white/20 text-zinc-400 hover:text-white hover:border-white/40",
        gold: "border-amber-500/30 bg-amber-500/10 text-amber-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
