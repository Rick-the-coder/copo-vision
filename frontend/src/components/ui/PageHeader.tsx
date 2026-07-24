import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, breadcrumbs, actions }) => {
  return (
    <div className="mb-8 space-y-3">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex text-[13px] text-[#6B7280] font-medium tracking-tight">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {crumb.href ? (
                <a href={crumb.href} className="hover:text-[#111827] transition-colors">{crumb.label}</a>
              ) : (
                <span className="text-[#111827]">{crumb.label}</span>
              )}
              {idx < breadcrumbs.length - 1 && <span className="mx-2 text-[#D1D5DB]">/</span>}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#111827] tracking-tight">{title}</h1>
          {description && <p className="text-[14px] text-[#6B7280] mt-1">{description}</p>}
        </div>
        
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
