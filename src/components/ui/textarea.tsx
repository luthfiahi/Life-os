import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-[var(--c-border)] placeholder:text-[var(--c-text-muted)] focus-visible:border-[var(--c-accent)] focus-visible:ring-[var(--c-accent)]/50 flex field-sizing-content min-h-16 w-full rounded-md border bg-[var(--c-card)] px-3 py-2 text-sm text-[var(--c-text)] shadow-sm transition-[color,box-shadow] outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
