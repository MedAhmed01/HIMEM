import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-all duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm",
        secondary:
          "border-transparent bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700",
        destructive:
          "border-transparent bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-sm",
        success:
          "border-transparent bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm",
        warning:
          "border-transparent bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm",
        outline:
          "border-2 border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
