import * as React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={`w-full px-3 py-2 rounded-xl border outline-none focus:ring ${className}`}
      {...props}
    />
  )
);
Input.displayName = "Input";
export default Input;