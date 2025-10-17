import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-gray-700 bg-gray-800 text-white shadow-lg p-4 ${className}`}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardProps) {
  return <div className={`mb-2 ${className}`} {...props} />;
}

export function CardTitle({ className, ...props }: CardProps) {
  return (
    <h2
      className={`text-lg font-semibold text-white tracking-wide ${className}`}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={`mt-2 ${className}`} {...props} />;
}