import React from 'react';
import { FolderSearch } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  icon = <FolderSearch className="w-10 h-10 text-[#D1D5DB]" />,
  action 
}) => {
  return (
    <div className="w-full py-16 px-6 flex flex-col items-center justify-center text-center border border-dashed border-[#E5E7EB] rounded-[10px] bg-[#F8F9FA]">
      <div className="bg-white p-4 rounded-full shadow-micro mb-4 border border-[#E5E7EB]">
        {icon}
      </div>
      <h3 className="text-sm font-medium text-[#111827] mb-1">{title}</h3>
      <p className="text-[13px] text-[#6B7280] max-w-sm mx-auto mb-6">
        {description}
      </p>
      {action}
    </div>
  );
};
