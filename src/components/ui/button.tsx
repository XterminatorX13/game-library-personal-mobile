import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/30 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary "Lingote" - White button with shimmer
        default: "btn-shimmer bg-white text-black hover:bg-zinc-100 shadow-[0_0_20px_-5px_rgba(255,255,255,0.15)] rounded-full font-medium tracking-wide",
        // Gold/Gemini style
        gold: "btn-shimmer-gold bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700 text-black font-bold shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.5)] rounded-full bg-[length:200%_auto] hover:bg-right",
        destructive:
          "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 rounded-full",
        outline:
          "border border-white/10 bg-transparent hover:bg-white/5 hover:border-white/20 text-zinc-400 hover:text-white rounded-full",
        secondary:
          "bg-zinc-900/60 text-zinc-300 border border-white/5 hover:border-white/15 hover:bg-zinc-800/80 backdrop-blur-md rounded-full",
        ghost: "hover:bg-white/5 hover:text-white text-zinc-500 rounded-lg",
        link: "text-amber-400 underline-offset-4 hover:underline hover:text-amber-300",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
