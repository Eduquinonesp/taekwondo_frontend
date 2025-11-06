import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`px-4 py-2 rounded-2xl shadow hover:opacity-90 transition ${className}`}
      {...props}
    />
  )
);
Button.displayName = "Button";
export default Button;