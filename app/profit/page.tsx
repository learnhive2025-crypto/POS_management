"use client";

import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";

type ProductProfit = {
  product_name: string;
  sold_qty: number;
  profit: number;
};

export default function ProfitPage() {
  const [profits, setProfits] = useState<ProductProfit[]>([]);
  const [totalProfit, setTotalProfit] = useState(0);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token") || ""
      : "";

  /* ---------------- FETCH PROFIT ---------------- */
  const fetchProfit = async () => {
    setLoading(true);
    const res = await fetch("https://mythra-backend.onrender.com/profit/product-wise", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setProfits(data.product_wise_profit);
    setTotalProfit(data.total_profit);
    setLoading(false);
  };

  useEffect(() => {
    fetchProfit();
  }, []);

  /* ---------------- CALCULATIONS ---------------- */
  const totalSoldQty = profits.reduce((sum, p) => sum + p.sold_qty, 0);
  const profitableProducts = profits.filter(p => p.profit > 0).length;
  const avgProfitPerProduct = profits.length > 0
    ? (totalProfit / profits.length).toFixed(2)
    : 0;

  return (
    <div className="profit-container">
      <PageHeader
        title="Profit Analysis"
        subtitle="Track product-wise profitability and overall revenue"
        icon="currency-rupee"
      />

      {/* STATISTICS CARDS */}
      <div className="stats-grid">
        <div className="stat-card total-profit">
          <div className="stat-icon">
            <i className="bi bi-cash-stack"></i>
          </div>
          <div className="stat-content">
            <h6 className="stat-label">Total Profit</h6>
            <h2 className="stat-value">₹{totalProfit.toLocaleString()}</h2>
          </div>
          <div className="stat-badge">
            <i className="bi bi-graph-up-arrow"></i>
          </div>
        </div>

        <div className="stat-card products-sold">
          <div className="stat-icon">
            <i className="bi bi-box-seam-fill"></i>
          </div>
          <div className="stat-content">
            <h6 className="stat-label">Units Sold</h6>
            <h2 className="stat-value">{totalSoldQty}</h2>
          </div>
        </div>

        <div className="stat-card profitable">
          <div className="stat-icon">
            <i className="bi bi-trophy-fill"></i>
          </div>
          <div className="stat-content">
            <h6 className="stat-label">Profitable Products</h6>
            <h2 className="stat-value">{profitableProducts}</h2>
          </div>
        </div>

        <div className="stat-card avg-profit">
          <div className="stat-icon">
            <i className="bi bi-bar-chart-fill"></i>
          </div>
          <div className="stat-content">
            <h6 className="stat-label">Avg Profit/Product</h6>
            <h2 className="stat-value">₹{avgProfitPerProduct}</h2>
          </div>
        </div>
      </div>

      {/* PRODUCT-WISE PROFIT TABLE */}
      <div className="profit-card">
        <div className="profit-header">
          <h3>
            <i className="bi bi-graph-up"></i>
            Product-wise Profit Breakdown
          </h3>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading profit data...</p>
          </div>
        ) : profits.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-inbox"></i>
            <h4>No Profit Data</h4>
            <p>No sales have been recorded yet</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="profit-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th>Quantity Sold</th>
                  <th>Profit</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {profits
                  .sort((a, b) => b.profit - a.profit)
                  .map((product, index) => {
                    const isProfit = product.profit > 0;
                    const isLoss = product.profit < 0;
                    const profitPercent = profits.length > 0
                      ? ((product.profit / totalProfit) * 100).toFixed(1)
                      : 0;

                    return (
                      <tr key={index} className={isLoss ? 'loss-row' : ''}>
                        <td className="row-number">{index + 1}</td>
                        <td className="product-name">
                          <i className="bi bi-box"></i>
                          {product.product_name}
                        </td>
                        <td className="qty-sold">
                          <span className="qty-badge">
                            {product.sold_qty} units
                          </span>
                        </td>
                        <td className={`profit-value ${isProfit ? 'positive' : isLoss ? 'negative' : 'neutral'}`}>
                          <span className="amount">
                            {isProfit && '+'}{isLoss && '-'}₹{Math.abs(product.profit).toLocaleString()}
                          </span>
                          {isProfit && totalProfit > 0 && (
                            <span className="percentage">({profitPercent}%)</span>
                          )}
                        </td>
                        <td>
                          {isProfit ? (
                            <span className="status-badge profit">
                              <i className="bi bi-arrow-up-circle-fill"></i>
                              Profit
                            </span>
                          ) : isLoss ? (
                            <span className="status-badge loss">
                              <i className="bi bi-arrow-down-circle-fill"></i>
                              Loss
                            </span>
                          ) : (
                            <span className="status-badge neutral">
                              <i className="bi bi-dash-circle-fill"></i>
                              Break Even
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .profit-container {
          padding: 0.5rem;
          animation: fadeIn 0.5s ease-in-out;
        }

        /* STATS GRID */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 1.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          gap: 1.25rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .stat-card.total-profit::before {
          background: linear-gradient(135deg, #11998e, #38ef7d);
        }

        .stat-card.products-sold::before {
          background: linear-gradient(135deg, #667eea, #764ba2);
        }

        .stat-card.profitable::before {
          background: linear-gradient(135deg, #f5a623, #ffd700);
        }

        .stat-card.avg-profit::before {
          background: linear-gradient(135deg, #4facfe, #00f2fe);
        }

        .stat-card:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          color: white;
          flex-shrink: 0;
        }

        .stat-card.total-profit .stat-icon {
          background: linear-gradient(135deg, #11998e, #38ef7d);
        }

        .stat-card.products-sold .stat-icon {
          background: linear-gradient(135deg, #667eea, #764ba2);
        }

        .stat-card.profitable .stat-icon {
          background: linear-gradient(135deg, #f5a623, #ffd700);
        }

        .stat-card.avg-profit .stat-icon {
          background: linear-gradient(135deg, #4facfe, #00f2fe);
        }

        .stat-content {
          flex: 1;
        }

        .stat-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #a0aec0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 0.5rem 0;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 800;
          color: white;
          margin: 0;
          line-height: 1;
        }

        .stat-badge {
          font-size: 2rem;
          color: rgba(255, 255, 255, 0.2);
        }

        /* PROFIT CARD */
        .profit-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        .profit-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.2);
        }

        .profit-header h3 {
          color: white;
          margin: 0;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .profit-header h3 i {
          color: #38ef7d;
        }

        /* TABLE */
        .table-responsive {
          overflow-x: auto;
        }

        .profit-table {
          width: 100%;
          border-collapse: collapse;
        }

        .profit-table thead {
          background: linear-gradient(135deg, rgba(17, 153, 142, 0.2), rgba(56, 239, 125, 0.2));
        }

        .profit-table th {
          padding: 1.25rem 1rem;
          text-align: left;
          font-weight: 700;
          font-size: 0.85rem;
          color: #a0aec0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .profit-table tbody tr {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
        }

        .profit-table tbody tr:hover {
          background: rgba(56, 239, 125, 0.05);
        }

        .profit-table tbody tr.loss-row {
          background: rgba(245, 87, 108, 0.05);
        }

        .profit-table tbody tr.loss-row:hover {
          background: rgba(245, 87, 108, 0.1);
        }

        .profit-table td {
          padding: 1.25rem 1rem;
          color: white;
        }

        .row-number {
          color: #718096;
          font-weight: 600;
        }

        .product-name {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 600;
        }

        .product-name i {
          color: #667eea;
          font-size: 1.25rem;
        }

        .qty-sold {
          
        }

        .qty-badge {
          padding: 0.5rem 0.875rem;
          background: rgba(102, 126, 234, 0.2);
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #667eea;
          display: inline-block;
        }

        .profit-value {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .profit-value .amount {
          font-size: 1.1rem;
          font-weight: 800;
        }

        .profit-value.positive .amount {
          color: #38ef7d;
        }

        .profit-value.negative .amount {
          color: #f5576c;
        }

        .profit-value.neutral .amount {
          color: #a0aec0;
        }

        .profit-value .percentage {
          font-size: 0.75rem;
          color: #a0aec0;
          font-weight: 600;
        }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-badge.profit {
          background: rgba(56, 239, 125, 0.2);
          color: #38ef7d;
        }

        .status-badge.loss {
          background: rgba(245, 87, 108, 0.2);
          color: #f5576c;
        }

        .status-badge.neutral {
          background: rgba(160, 174, 192, 0.2);
          color: #a0aec0;
        }

        /* LOADING & EMPTY STATES */
        .loading-state,
        .empty-state {
          padding: 4rem;
          text-align: center;
        }

        .empty-state i {
          font-size: 5rem;
          color: #718096;
          opacity: 0.5;
          margin-bottom: 1.5rem;
        }

        .empty-state h4 {
          color: white;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: #a0aec0;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .profit-table {
            font-size: 0.85rem;
          }

          .profit-table th,
          .profit-table td {
            padding: 0.875rem 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
