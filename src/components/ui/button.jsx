import React from "react";

const Button = React.forwardRef(
  ({ className = "", variant = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors " +
      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-700",
      outline: "border border-gray-300 bg-white hover:bg-gray-100",
      ghost: "hover:bg-gray-100",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} px-4 py-2 ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
