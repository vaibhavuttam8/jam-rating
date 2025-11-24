import { cn } from "@/lib/utils";
import React, { type InputHTMLAttributes } from "react";

export type IInputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, IInputProps>(
  ({ className = "", type = "text", ...props }: IInputProps, forwardedRef) => {
    return (
      <input
        type={type}
        ref={forwardedRef}
        className={cn(
          "flex w-full border-2 border-border bg-background px-3 py-2 text-base font-sans",
          "placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "shadow-sm hover:shadow transition-all",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

