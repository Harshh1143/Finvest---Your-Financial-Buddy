import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60 active:scale-[0.98] hover:scale-[1.01] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-sky-500 via-cyan-500 to-violet-500 text-white shadow-[0_20px_45px_rgba(56,189,248,0.28)] hover:shadow-[0_24px_60px_rgba(56,189,248,0.36)]",
        secondary:
          "bg-slate-900/70 text-slate-100 border border-white/10 backdrop-blur-xl hover:bg-slate-800/80",
        ghost:
          "bg-transparent text-slate-300 hover:bg-white/8 hover:text-white",
        outline:
          "border border-white/15 bg-white/5 text-slate-100 hover:bg-white/10",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-5",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
