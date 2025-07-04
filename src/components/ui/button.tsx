
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { useSoundEffects } from "@/hooks/useSoundEffects"
import { a11y } from "@/lib/accessibility"
import { useUserPreferences } from "@/hooks/useUserPreferences"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95 hover:shadow-md",
  {
    variants: {
      variant: {
        default: "gradient-primary text-inverse hover:shadow-brand-hover hover:scale-105 border-0",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-105",
        outline:
          "border border-border bg-background text-primary hover:bg-muted hover:text-primary hover:scale-105",
        secondary:
          "bg-muted text-primary border border-border hover:bg-muted/80 hover:scale-105",
        ghost: "hover:bg-muted hover:text-primary hover:scale-105",
        link: "text-primary underline-offset-4 hover:underline hover:scale-105",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
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
  soundEnabled?: boolean
  loading?: boolean
  loadingText?: string
  ariaLabel?: string
  ariaPressed?: boolean
  ariaExpanded?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    soundEnabled, 
    onClick, 
    loading = false,
    loadingText,
    ariaLabel,
    ariaPressed,
    ariaExpanded,
    disabled,
    children,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    const { playClick, playSoftClick } = useSoundEffects()
    const { preferences } = useUserPreferences()
    
    // Use user preference for sounds if not explicitly set
    const shouldPlaySound = soundEnabled ?? preferences?.soundEnabled ?? true

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) return
      
      if (shouldPlaySound && !a11y.prefersReducedMotion()) {
        if (variant === 'ghost' || variant === 'outline') {
          playSoftClick()
        } else {
          playClick()
        }
      }
      
      // Announce action to screen readers
      if (loading && loadingText) {
        a11y.announce(loadingText, 'polite')
      }
      
      if (onClick) {
        onClick(event)
      }
    }

    const accessibilityProps = {
      'aria-label': ariaLabel,
      'aria-pressed': ariaPressed,
      'aria-expanded': ariaExpanded,
      'aria-busy': loading,
      'aria-disabled': disabled || loading,
    }

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          loading && "cursor-wait"
        )}
        ref={ref}
        onClick={handleClick}
        disabled={disabled || loading}
        {...accessibilityProps}
        {...props}
      >
        {loading ? (
          <>
            <span className="sr-only">{loadingText || "Loading..."}</span>
            <svg 
              className="animate-spin -ml-1 mr-2 h-4 w-4" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {loadingText || children}
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
