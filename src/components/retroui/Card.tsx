import { cn } from "@/lib/utils";
import React, { type HTMLAttributes } from "react";

export interface ICardProps extends HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, ICardProps>(
  ({ className = "", ...props }: ICardProps, forwardedRef) => {
    return (
      <div
        ref={forwardedRef}
        className={cn(
          "bg-card text-card-foreground border-2 border-border shadow-md",
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

export interface ICardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const CardHeader = React.forwardRef<HTMLDivElement, ICardHeaderProps>(
  ({ className = "", ...props }: ICardHeaderProps, forwardedRef) => {
    return (
      <div
        ref={forwardedRef}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
      />
    );
  }
);

CardHeader.displayName = "CardHeader";

export interface ICardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = React.forwardRef<HTMLHeadingElement, ICardTitleProps>(
  ({ className = "", ...props }: ICardTitleProps, forwardedRef) => {
    return (
      <h3
        ref={forwardedRef}
        className={cn("font-head text-2xl font-semibold leading-none tracking-tight", className)}
        {...props}
      />
    );
  }
);

CardTitle.displayName = "CardTitle";

export interface ICardContentProps extends HTMLAttributes<HTMLDivElement> {}

export const CardContent = React.forwardRef<HTMLDivElement, ICardContentProps>(
  ({ className = "", ...props }: ICardContentProps, forwardedRef) => {
    return (
      <div
        ref={forwardedRef}
        className={cn("p-6 pt-0", className)}
        {...props}
      />
    );
  }
);

CardContent.displayName = "CardContent";

