import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#139a9d] to-[#0f7a7d] text-white hover:opacity-90 shadow-lg shadow-[#139a9d]/25",
        destructive:
          "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:opacity-90 shadow-lg shadow-red-500/25",
        outline:
          "border-2 border-[#139a9d]/30 bg-white/80 backdrop-blur-sm shadow-sm hover:bg-[#139a9d]/10 hover:border-[#139a9d]/50 text-slate-700",
        secondary:
          "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-900 hover:from-slate-200 hover:to-slate-300",
        ghost:
          "hover:bg-[#139a9d]/10 hover:text-[#139a9d]",
        link: "text-[#139a9d] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-lg gap-1.5 px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "size-10",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
