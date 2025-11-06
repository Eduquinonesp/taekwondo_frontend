import * as React from "react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", children, ...props }, ref) => (
    <select
      ref={ref}
      className={`w-full px-3 py-2 rounded-xl border outline-none focus:ring ${className}`}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";
export default Select;