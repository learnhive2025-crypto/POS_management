import React, { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    icon?: string;
    children?: ReactNode;
}

export default function PageHeader({
    title,
    subtitle,
    icon,
    children,
}: PageHeaderProps) {
    return (
        <div className="page-header">
            <div className="header-content">
                <div className="header-text">
                    {icon && (
                        <div className="header-icon">
                            <i className={`bi bi-${icon}`}></i>
                        </div>
                    )}
                    <div>
                        <h1 className="header-title">{title}</h1>
                        {subtitle && <p className="header-subtitle">{subtitle}</p>}
                    </div>
                </div>
                {children && <div className="header-actions">{children}</div>}
            </div>

            <style jsx>{`
        .page-header {
          margin-bottom: 2rem;
          animation: slideUp 0.5s ease-out;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-text {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          color: white;
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
          animation: float 3s ease-in-out infinite;
        }

        .header-title {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          line-height: 1.2;
        }

        .header-subtitle {
          color: #1a457eff;
          font-size: 0.95rem;
          margin: 0.25rem 0 0 0;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @media (max-width: 768px) {
          .header-title {
            font-size: 1.5rem;
          }

          .header-icon {
            width: 48px;
            height: 48px;
            font-size: 1.5rem;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
        </div>
    );
}
