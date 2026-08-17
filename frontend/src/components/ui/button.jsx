import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cobalt/70 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-midnight disabled:pointer-events-none disabled:opacity-60 active:scale-[0.98] cursor-pointer",
    {
        variants: {
            variant: {
                default: "bg-brand-cobalt text-brand-cream hover:bg-brand-cobalt-light hover:shadow-[0_4px_20px_rgba(43,92,184,0.25)] border border-brand-cobalt-light/10",
                secondary: "bg-brand-midnight-card text-brand-cream border border-brand-cream/10 hover:bg-brand-midnight-card-hover",
                ghost: "bg-transparent text-brand-silver hover:bg-brand-cream/5 hover:text-brand-cream",
                outline: "border border-brand-cream/10 bg-brand-cream/5 text-brand-cream hover:bg-brand-cream/10",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 px-3 text-xs",
                lg: "h-11 px-6 text-base",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

const Button = React.memo(React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (<Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}/>);
}));
Button.displayName = "Button";

export { Button, buttonVariants };
