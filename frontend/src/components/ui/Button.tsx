import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  className = '', 
  disabled,
  ...props 
}) => {
  
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-md";
  
  const variants = {
    primary: "bg-[#2563EB] text-white hover:bg-[#1D4ED8] focus:ring-[#2563EB] shadow-micro",
    secondary: "bg-white text-[#111827] border border-[#E5E7EB] hover:bg-[#F9FAFB] focus:ring-gray-200 shadow-micro",
    outline: "border border-[#E5E7EB] bg-transparent text-[#111827] hover:bg-[#F9FAFB] focus:ring-gray-200",
    ghost: "bg-transparent text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] focus:ring-gray-200",
    danger: "bg-white text-[#EF4444] border border-[#E5E7EB] hover:bg-red-50 hover:border-red-200 focus:ring-red-500 shadow-micro"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
