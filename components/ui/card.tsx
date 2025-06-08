import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "premium" | "glass" | "hover" | "gradient"
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variantClasses = {
    default: "bg-card text-card-foreground",
    premium: "border-amber-200 dark:border-amber-800 shadow-amber-100/20 dark:shadow-amber-700/10",
    glass: "bg-white/30 dark:bg-black/30 backdrop-blur-md border-white/20 dark:border-white/10",
    hover: "transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
    gradient: "bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950 dark:to-amber-900/50",
  }

  return (
    <div
      ref={ref}
      className={cn("rounded-xl border bg-card text-card-foreground shadow-sm", variantClasses[variant], className)}
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "premium"
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variantClasses = {
    default: "",
    premium: "border-b border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/20",
  }

  return (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", variantClasses[variant], className)} {...props} />
  )
})
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    variant?: "default" | "gradient"
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variantClasses = {
    default: "text-2xl font-semibold leading-none tracking-tight",
    gradient: "text-2xl font-semibold leading-none tracking-tight gold-text",
  }

  return <h3 ref={ref} className={cn(variantClasses[variant], className)} {...props} />
})
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
