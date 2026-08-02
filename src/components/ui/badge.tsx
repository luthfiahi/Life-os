import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-[var(--c-accent)] focus-visible:ring-[var(--c-accent)]/50 focus-visible:ring-[3px] transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--c-accent)] text-white [a&]:hover:bg-[var(--c-accent)]/90",
        secondary:
          "border-transparent bg-[var(--c-surface)] text-[var(--c-text)] [a&]:hover:bg-[var(--c-card)]",
        destructive:
          "border-transparent bg-[var(--c-accent-2)] text-white [a&]:hover:bg-[var(--c-accent-2)]/90",
        outline:
          "text-[var(--c-text)] border-[var(--c-border)] [a&]:hover:bg-[var(--c-accent)]/10 [a&]:hover:text-[var(--c-text)]",
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