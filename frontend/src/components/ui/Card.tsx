import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', noPadding = false, ...props }) => {
  return (
    <div 
      className={`bg-white rounded-[10px] border border-[#E5E7EB] shadow-micro overflow-hidden ${className}`} 
      {...props}
    >
      {noPadding ? children : <div className="p-6">{children}</div>}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-white ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = '', ...props }) => {
  return (
    <h3 className={`text-base font-medium text-[#111827] ${className}`} {...props}>
      {children}
    </h3>
  );
};
