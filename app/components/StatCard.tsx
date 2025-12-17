import React, { ReactNode } from "react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: string;
    gradient?: "primary" | "success" | "warning" | "danger" | "info";
    trend?: {
        value: string;
        isPositive: boolean;
    };
}

export default function StatCard({
    title,
    value,
    icon,
    gradient = "primary",
    trend,
}: StatCardProps) {
    const gradients = {
        primary: "linear-gradient(135deg, #667eea, #764ba2)",
        success: "linear-gradient(135deg, #11998e, #38ef7d)",
        warning: "linear-gradient(135deg, #f093fb, #f5576c)",
        danger: "linear-gradient(135deg, #fa709a, #fee140)",
        info: "linear-gradient(135deg, #4facfe, #00f2fe)",
    };

    return (
        <div className="stat-card">
            <div className="stat-card-content">
                <div className="stat-header">
                    <h6 className="stat-title">{title}</h6>
                    {trend && (
                        <div className={`stat-trend ${trend.isPositive ? "positive" : "negative"}`}>
                            <i className={`bi bi-arrow-${trend.isPositive ? "up" : "down"}`}></i>
                            <span>{trend.value}</span>
                        </div>
                    )}
                </div>
                <div className="stat-body">
                    <h2 className="stat-value">{value}</h2>
                    <div
                        className="stat-icon"
                        style={{ background: gradients[gradient] }}
                    >
                        <i className={`bi bi-${icon}`}></i>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .stat-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          height: 100%;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: ${gradients[gradient]};
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .stat-card:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
        }

        .stat-card:hover::before {
          opacity: 1;
        }

        .stat-card-content {
          position: relative;
          z-index: 1;
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .stat-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: #a0aec0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0;
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.5rem;
          border-radius: 8px;
        }

        .stat-trend.positive {
          color: #38ef7d;
          background: rgba(56, 239, 125, 0.1);
        }

        .stat-trend.negative {
          color: #f5576c;
          background: rgba(245, 87, 108, 0.1);
        }

        .stat-body {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: white;
          margin: 0;
          line-height: 1;
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          color: white;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
        }

        .stat-card:hover .stat-icon {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
        }

        @media (max-width: 768px) {
          .stat-value {
            font-size: 1.5rem;
          }

          .stat-icon {
            width: 50px;
            height: 50px;
            font-size: 1.5rem;
          }
        }
      `}</style>
        </div>
    );
}
