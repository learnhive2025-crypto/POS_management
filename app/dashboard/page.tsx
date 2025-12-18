"use client";

import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";

type Summary = {
  admins: number;
  staff: number;
  categories: number;
  products: number;
  purchase_qty: number;
  total_sales: number;
  total_revenue: number;
};

type SalesAnalysis = {
  daily_sales: number;
  weekly_sales: number;
  monthly_sales: number;
};

type TopProduct = {
  product_id: string;
  name: string;
  sold_qty: number;
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [analysis, setAnalysis] = useState<SalesAnalysis | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token") || ""
      : "";

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch("https://mythra-shop-dev.onrender.com/dashboard/summary", { headers }).then(res => res.json()),
      fetch("https://mythra-shop-dev.onrender.com/dashboard/sales-analysis", { headers }).then(res => res.json()),
      fetch("https://mythra-shop-dev.onrender.com/dashboard/top-products", { headers }).then(res => res.json()),
    ]).then(([summaryData, analysisData, topData]) => {
      setSummary(summaryData);
      setAnalysis(analysisData);
      setTopProducts(topData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
        <style jsx>{`
          .dashboard-container {
            min-height: 80vh;
            background-color: #f8f9fa;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .loading-state {
            text-align: center;
          }
          .loading-state p {
            color: #0364e2ff;
            margin-top: 1rem;
            font-size: 1.1rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-container" >
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening with your business today."
        icon="speedometer2"
      />

      {/* SUMMARY STATISTICS */}
      <div className="stats-grid" style={{ color: "black" }}>
        <StatCard
          title="Total Admins"
          value={summary?.admins || 0}
          icon="shield-check"
          gradient="primary"
        />
        <StatCard
          title="Staff Members"
          value={summary?.staff || 0}
          icon="people-fill"
          gradient="info"
        />
        <StatCard
          title="Categories"
          value={summary?.categories || 0}
          icon="grid-fill"
          gradient="warning"
        />
        <StatCard
          title="Products"
          value={summary?.products || 0}
          icon="box-seam-fill"
          gradient="success"
        />
      </div>

      {/* INVENTORY & SALES */}
      <div className="stats-grid-2">
        <StatCard
          title="Purchase Quantity"
          value={summary?.purchase_qty || 0}
          icon="cart-plus-fill"
          gradient="info"
        />
        <StatCard
          title="Total Sales"
          value={summary?.total_sales || 0}
          icon="receipt"
          gradient="success"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${summary?.total_revenue || 0}`}
          icon="currency-rupee"
          gradient="warning"
        />
      </div>

      {/* SALES ANALYSIS */}
      <div className="section-header">
        <h3 className="section-title">
          <i className="bi bi-graph-up-arrow"></i>
          Sales Analysis
        </h3>
      </div>

      <div className="sales-grid">
        <div className="sales-card daily">
          <div className="sales-card-header">
            <div className="sales-icon">
              <i className="bi bi-calendar-day"></i>
            </div>
            <span className="sales-label">Today</span>
          </div>
          <h2 className="sales-value text-success">₹{analysis?.daily_sales || 0}</h2>
          <div className="sales-bar">
            <div className="sales-progress daily-bar"></div>
          </div>
        </div>

        <div className="sales-card weekly">
          <div className="sales-card-header">
            <div className="sales-icon">
              <i className="bi bi-calendar-week"></i>
            </div>
            <span className="sales-label">This Week</span>
          </div>
          <h2 className="sales-value text-warning">₹{analysis?.weekly_sales || 0}</h2>
          <div className="sales-bar">
            <div className="sales-progress weekly-bar"></div>
          </div>
        </div>

        <div className="sales-card monthly">
          <div className="sales-card-header">
            <div className="sales-icon">
              <i className="bi bi-calendar-month"></i>
            </div>
            <span className="sales-label">This Month</span>
          </div>
          <h2 className="sales-value text-danger">₹{analysis?.monthly_sales || 0}</h2>
          <div className="sales-bar">
            <div className="sales-progress monthly-bar"></div>
          </div>
        </div>
      </div>

      {/* TOP SELLING PRODUCTS */}
      <div className="section-header">
        <h3 className="section-title">
          <i className="bi bi-fire"></i>
          Top Selling Products
        </h3>
      </div>

      <div className="products-card">
        {topProducts.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-inbox"></i>
            <p>No sales data available yet</p>
          </div>
        ) : (
          <div className="products-list">
            {topProducts.map((product, index) => (
              <div key={product.product_id} className="product-item">
                <div className="product-rank">#{index + 1}</div>
                <div className="product-info">
                  <h5 className="product-name">{product.name}</h5>
                  <span className="product-sales">{product.sold_qty} units sold</span>
                </div>
                <div className="product-badge">
                  <i className="bi bi-trophy-fill"></i>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .dashboard-container {
          padding: 0.5rem;
          animation: fadeIn 0.5s ease-in-out;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stats-grid-2 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .section-header {
          margin: 2rem 0 1.5rem 0;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .section-title i {
          font-size: 1.75rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: red;
        }

        /* SALES ANALYSIS CARDS */
        .sales-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .sales-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .sales-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          opacity: 0.8;
        }

        .sales-card.daily::before {
          background: linear-gradient(135deg, #4facfe, #00f2fe);
        }

        .sales-card.weekly::before {
          background: linear-gradient(135deg, #f093fb, #f5576c);
        }

        .sales-card.monthly::before {
          background: linear-gradient(135deg, #11998e, #38ef7d);
        }

        .sales-card:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
        }

        .sales-card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .sales-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
          transition: all 0.3s ease;
        }

        .daily .sales-icon {
          background: linear-gradient(135deg, #4facfe, #00f2fe);
        }

        .weekly .sales-icon {
          background: linear-gradient(135deg, #f093fb, #f5576c);
        }

        .monthly .sales-icon {
          background: linear-gradient(135deg, #11998e, #38ef7d);
        }

        .sales-card:hover .sales-icon {
          transform: rotate(10deg) scale(1.1);
        }

        .sales-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #a0aec0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .sales-value {
          font-size: 2.25rem;
          font-weight: 800;
          color: white;
          margin: 0 0 1rem 0;
        }

        .sales-bar {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          overflow: hidden;
        }

        .sales-progress {
          height: 100%;
          border-radius: 10px;
          animation: progressGrow 1s ease-out;
        }

        .daily-bar {
          width: 60%;
          background: linear-gradient(90deg, #4facfe, #00f2fe);
        }

        .weekly-bar {
          width: 80%;
          background: linear-gradient(90deg, #f093fb, #f5576c);
        }

        .monthly-bar {
          width: 95%;
          background: linear-gradient(90deg, #11998e, #38ef7d);
        }

        /* TOP PRODUCTS */
        .products-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 2rem;
        }

        .products-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .product-item {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
        }

        .product-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(221, 223, 235, 0.3);
          transform: translateX(8px);
        }

        .product-rank {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.1rem;
          color: white;
          flex-shrink: 0;
        }

        .product-info {
          flex: 1;
        }

        .product-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: white;
          margin: 0 0 0.25rem 0;
        }

        .product-sales {
          font-size: 0.85rem;
          color: #a0aec0;
        }

        .product-badge {
          font-size: 1.5rem;
          color: #ffd700;
          animation: float 2s ease-in-out infinite;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #718096;
        }

        .empty-state i {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-state p {
          font-size: 1.1rem;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes progressGrow {
          from {
            width: 0;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @media (max-width: 768px) {
          .stats-grid,
          .stats-grid-2,
          .sales-grid {
            grid-template-columns: 1fr;
          }

          .sales-value {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </div>
  );
}
