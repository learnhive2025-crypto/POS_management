"use client";

import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";

type SlowProduct = {
  product_id: string;
  name: string;
  stock_qty: number;
};

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [products, setProducts] = useState<SlowProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token") || ""
      : "";

  /* ---------------- FETCH SLOW MOVING ---------------- */
  const fetchSlowMoving = async () => {
    setLoading(true);
    const res = await fetch(
      `https://mythra-backend.onrender.com/analytics/slow-moving?days=${days}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSlowMoving();
  }, []);

  return (
    <div className="analytics-container">
      <PageHeader
        title="Slow-Moving Analytics"
        subtitle="Identify products with low sales velocity"
        icon="graph-down-arrow"
      />

      {/* FILTER CARD */}
      <div className="filter-card">
        <div className="filter-content">
          <div className="filter-label">
            <i className="bi bi-calendar-range"></i>
            <span>Time Period</span>
          </div>
          <div className="filter-controls">
            <input
              type="number"
              min={1}
              className="days-input"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            />
            <span className="days-label">days</span>
            <button className="btn-check" onClick={fetchSlowMoving}>
              <i className="bi bi-arrow-clockwise"></i>
              Analyze
            </button>
          </div>
        </div>
      </div>

      {/* ANALYTICS CARD */}
      <div className="analytics-card">
        <div className="analytics-header">
          <div className="header-content">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <div>
              <h3>Products not sold in last {days} days</h3>
              <p>Consider promotions or discounting these items</p>
            </div>
          </div>
          {!loading && products.length > 0 && (
            <div className="count-badge">
              {products.length} {products.length === 1 ? 'product' : 'products'}
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Analyzing sales data...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-check-circle-fill"></i>
            <h4>Excellent Performance!</h4>
            <p>No slow-moving products in the last {days} days</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th>Current Stock</th>
                  <th>Status</th>
                  <th>Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, idx) => (
                  <tr key={p.product_id}>
                    <td className="row-number">{idx + 1}</td>
                    <td className="product-name">
                      <i className="bi bi-box"></i>
                      {p.name}
                    </td>
                    <td>
                      <span className="stock-badge">
                        {p.stock_qty} units
                      </span>
                    </td>
                    <td>
                      <span className="status-badge warning">
                        <i className="bi bi-hourglass-split"></i>
                        Slow Moving
                      </span>
                    </td>
                    <td className="recommendation">
                      <i className="bi bi-lightbulb"></i>
                      Consider promotion
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .analytics-container {
          padding: 0.5rem;
          animation: fadeIn 0.5s ease-in-out;
        }

        /* FILTER CARD */
        .filter-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 2rem;
        }

        .filter-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .filter-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: white;
          font-weight: 700;
          font-size: 1.05rem;
        }

        .filter-label i {
          font-size: 1.5rem;
          color: #667eea;
        }

        .filter-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .days-input {
          width: 100px;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          font-weight: 700;
          font-size: 1rem;
          text-align: center;
        }

        .days-label {
          color: #a0aec0;
          font-weight: 600;
        }

        .btn-check {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .btn-check:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
        }

        /* ANALYTICS CARD */
        .analytics-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        .analytics-header {
          padding: 1.75rem;
          background: linear-gradient(135deg, rgba(245, 166, 35, 0.1), rgba(255, 215, 0, 0.05));
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-content i {
          font-size: 2.5rem;
          color: #f5a623;
        }

        .analytics-header h3 {
          color: white;
          margin: 0 0 0.25rem 0;
          font-size: 1.35rem;
        }

        .analytics-header p {
          color: #a0aec0;
          margin: 0;
          font-size: 0.9rem;
        }

        .count-badge {
          padding: 0.75rem 1.25rem;
          background: rgba(245, 166, 35, 0.2);
          border-radius: 12px;
          color: #f5a623;
          font-weight: 700;
          font-size: 0.95rem;
        }

        /* TABLE */
        .table-responsive {
          overflow-x: auto;
        }

        .analytics-table {
          width: 100%;
          border-collapse: collapse;
        }

        .analytics-table thead {
          background: rgba(0, 0, 0, 0.2);
        }

        .analytics-table th {
          padding: 1.25rem 1rem;
          text-align: left;
          font-weight: 700;
          font-size: 0.85rem;
          color: #a0aec0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .analytics-table tbody tr {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
        }

        .analytics-table tbody tr:hover {
          background: rgba(245, 166, 35, 0.05);
        }

        .analytics-table td {
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

        .stock-badge {
          padding: 0.5rem 0.875rem;
          background: rgba(245, 166, 35, 0.2);
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #f5a623;
          display: inline-block;
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

        .status-badge.warning {
          background: rgba(245, 166, 35, 0.2);
          color: #f5a623;
        }

        .recommendation {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #a0aec0;
          font-style: italic;
        }

        .recommendation i {
          color: #ffd700;
        }

        /* LOADING & EMPTY STATES */
        .loading-state,
        .empty-state {
          padding: 4rem;
          text-align: center;
        }

        .empty-state i {
          font-size: 5rem;
          color: #38ef7d;
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
          .filter-content {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-controls {
            justify-content: center;
          }

          .analytics-table {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}
