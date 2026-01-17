import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-slate-400 selection:bg-[#139a9d]/20 selection:text-[#139a9d] h-10 w-full min-w-0 rounded-xl border-2 border-[#139a9d]/20 bg-white px-4 py-2 text-base text-gray-900 shadow-sm transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus:border-[#139a9d] focus:ring-4 focus:ring-[#139a9d]/20",
        "hover:border-[#139a9d]/40",
        "aria-invalid:ring-red-100 aria-invalid:border-red-400",
        className
      )}
      {...props}
    />
  )
}

export { Input }
