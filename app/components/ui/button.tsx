// Button component for VerifiedNyumba
"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/app/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#1B4D3E] text-white border-2 border-[#1B4D3E] hover:bg-[#2D6A4F] hover:border-[#2D6A4F] shadow-sm focus-visible:ring-[#1B4D3E]",
        accent:
          "bg-[#1B4D3E] text-white border-2 border-[#1B4D3E] hover:bg-[#2D6A4F] hover:border-[#2D6A4F] shadow-sm focus-visible:ring-[#1B4D3E]",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 shadow-sm focus-visible:ring-red-500",
        outline:
          "border-2 border-[#1B4D3E] bg-transparent text-[#1B4D3E] hover:bg-[#1B4D3E] hover:text-white",
        outlineLight:
          "border-2 border-white bg-transparent text-white hover:bg-white/10",
        
        // New interactive variants for "Why Choose Us" section
        swapFilled: 
          "bg-[#1B4D3E] text-white border-2 border-[#1B4D3E] hover:bg-transparent hover:text-[#1B4D3E]",
        swapOutline:
          "bg-transparent text-[#1B4D3E] border-2 border-[#1B4D3E] hover:bg-[#1B4D3E] hover:text-white",

        secondary:
          "bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-400",
        ghost: "text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-400",
        link: "text-[#1B4D3E] underline-offset-4 hover:underline focus-visible:ring-[#1B4D3E]",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };


