"use client";

import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";

type StockItem = {
  product_id: string;
  name: string;
  stock_qty: number;
};

export default function StockPage() {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [lowStocks, setLowStocks] = useState<StockItem[]>([]);
  const [threshold, setThreshold] = useState(10);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token") || ""
      : "";

  /* ---------------- FETCH STOCK SUMMARY ---------------- */
  const fetchStockSummary = async () => {
    setLoading(true);
    const res = await fetch("https://mythra-shop-dev.onrender.com/stock/summary", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setStocks(data);
    setLoading(false);
  };

  /* ---------------- FETCH LOW STOCK ---------------- */
  const fetchLowStock = async () => {
    const res = await fetch(
      `https://mythra-shop-dev.onrender.com/stock/low-stock?threshold=${threshold}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    setLowStocks(data);
  };

  useEffect(() => {
    fetchStockSummary();
    fetchLowStock();
  }, []);

  /* ---------------- FILTER ---------------- */
  const filteredStocks = stocks.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ---------------- STATS ---------------- */
  const totalProducts = stocks.length;
  const totalStock = stocks.reduce((sum, s) => sum + s.stock_qty, 0);
  const lowStockCount = lowStocks.length;

  return (
    <div className="stock-container">
      <PageHeader
        title="Stock Management"
        subtitle="Monitor inventory levels and low stock alerts"
        icon="archive-fill"
      />

      {/* STATISTICS CARDS */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">
            <i className="bi bi-boxes"></i>
          </div>
          <div className="stat-content">
            <h6 className="stat-label">Total Products</h6>
            <h2 className="stat-value">{totalProducts}</h2>
          </div>
        </div>

        <div className="stat-card stock">
          <div className="stat-icon">
            <i className="bi bi-stack"></i>
          </div>
          <div className="stat-content">
            <h6 className="stat-label">Total Stock Units</h6>
            <h2 className="stat-value">{totalStock.toLocaleString()}</h2>
          </div>
        </div>

        <div className="stat-card alert">
          <div className="stat-icon">
            <i className="bi bi-exclamation-triangle-fill"></i>
          </div>
          <div className="stat-content">
            <h6 className="stat-label">Low Stock Items</h6>
            <h2 className="stat-value">{lowStockCount}</h2>
          </div>
        </div>
      </div>

      {/* LOW STOCK ALERT */}
      <div className="alert-card">
        <div className="alert-header">
          <div className="alert-title">
            <i className="bi bi-bell-fill"></i>
            <h3>Low Stock Alert</h3>
          </div>
          <div className="threshold-controls">
            <label>Threshold:</label>
            <input
              type="number"
              className="threshold-input"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              min={1}
            />
            <button className="btn-check" onClick={fetchLowStock}>
              <i className="bi bi-arrow-clockwise"></i>
              Check
            </button>
          </div>
        </div>

        {lowStocks.length === 0 ? (
          <div className="no-alerts">
            <i className="bi bi-check-circle-fill"></i>
            <h4>All Good!</h4>
            <p>No products below threshold level</p>
          </div>
        ) : (
          <div className="alert-items">
            {lowStocks.map((product) => (
              <div key={product.product_id} className="alert-item">
                <div className="alert-item-icon">
                  <i className="bi bi-exclamation-circle-fill"></i>
                </div>
                <div className="alert-item-info">
                  <h5>{product.name}</h5>
                  <span className="stock-level">
                    Only {product.stock_qty} units remaining
                  </span>
                </div>
                <div className="alert-item-badge">{product.stock_qty}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STOCK SUMMARY */}
      <div className="stock-summary-card">
        <div className="summary-header">
          <h3>
            <i className="bi bi-clipboard-data"></i>
            Stock Summary
          </h3>
          <div className="search-box">
            <i className="bi bi-search search-icon"></i>
            <input
              className="search-input"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading stock data...</p>
          </div>
        ) : filteredStocks.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-inbox"></i>
            <h4>No Products Found</h4>
            <p>Try adjusting your search</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th>Stock Quantity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStocks.map((product, index) => {
                  const isLow = product.stock_qty < threshold;
                  const isCritical = product.stock_qty < threshold / 2;

                  return (
                    <tr key={product.product_id} className={isCritical ? 'critical' : isLow ? 'low' : ''}>
                      <td className="row-number">{index + 1}</td>
                      <td className="product-name">
                        <i className="bi bi-box-seam"></i>
                        {product.name}
                      </td>
                      <td className="stock-qty">
                        <span className="qty-value">{product.stock_qty}</span>
                        <span className="qty-label">units</span>
                      </td>
                      <td>
                        {isCritical ? (
                          <span className="status-badge critical">
                            <i className="bi bi-exclamation-octagon-fill"></i>
                            Critical
                          </span>
                        ) : isLow ? (
                          <span className="status-badge low">
                            <i className="bi bi-exclamation-triangle-fill"></i>
                            Low Stock
                          </span>
                        ) : (
                          <span className="status-badge healthy">
                            <i className="bi bi-check-circle-fill"></i>
                            Healthy
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
        .stock-container {
          padding: 0.5rem;
          animation: fadeIn 0.5s ease-in-out;
        }

        /* STATS GRID */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
          gap: 1.5rem;
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

        .stat-card.total::before {
          background: linear-gradient(135deg, #667eea, #764ba2);
        }

        .stat-card.stock::before {
          background: linear-gradient(135deg, #11998e, #38ef7d);
        }

        .stat-card.alert::before {
          background: linear-gradient(135deg, #fa709a, #fee140);
        }

        .stat-card:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
        }

        .stat-icon {
          width: 70px;
          height: 70px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: white;
          flex-shrink: 0;
        }

        .stat-card.total .stat-icon {
          background: linear-gradient(135deg, #667eea, #764ba2);
        }

        .stat-card.stock .stat-icon {
          background: linear-gradient(135deg, #11998e, #38ef7d);
        }

        .stat-card.alert .stat-icon {
          background: linear-gradient(135deg, #fa709a, #fee140);
        }

        .stat-content {
          flex: 1;
        }

        .stat-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #a0aec0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 0.5rem 0;
        }

        .stat-value {
          font-size: 2.25rem;
          font-weight: 800;
          color: white;
          margin: 0;
          line-height: 1;
        }

        /* ALERT CARD */
        .alert-card {
          background: linear-gradient(135deg, rgba(245, 87, 108, 0.1), rgba(250, 112, 154, 0.05));
          backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(245, 87, 108, 0.3);
          margin-bottom: 2rem;
          overflow: hidden;
        }

        .alert-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(245, 87, 108, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .alert-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .alert-title i {
          font-size: 1.5rem;
          color: #f5576c;
          animation: pulse 2s ease-in-out infinite;
        }

        .alert-title h3 {
          color: white;
          margin: 0;
          font-size: 1.5rem;
        }

        .threshold-controls {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .threshold-controls label {
          color: #a0aec0;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .threshold-input {
          width: 80px;
          padding: 0.5rem 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          font-weight: 600;
          text-align: center;
        }

        .btn-check {
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #fa709a, #fee140);
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-check:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(250, 112, 154, 0.4);
        }

        .no-alerts {
          padding: 3rem 2rem;
          text-align: center;
          color: #38ef7d;
        }

        .no-alerts i {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .no-alerts h4 {
          color: white;
          margin-bottom: 0.5rem;
        }

        .no-alerts p {
          color: #a0aec0;
        }

        .alert-items {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .alert-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          border: 1px solid rgba(245, 87, 108, 0.2);
          transition: all 0.3s ease;
        }

        .alert-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(245, 87, 108, 0.4);
          transform: translateX(4px);
        }

        .alert-item-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(245, 87, 108, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f5576c;
          font-size: 1.5rem;
        }

        .alert-item-info {
          flex: 1;
        }

        .alert-item-info h5 {
          color: white;
          margin: 0 0 0.25rem 0;
          font-size: 1.05rem;
        }

        .stock-level {
          color: #f5576c;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .alert-item-badge {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          background: linear-gradient(135deg, #fa709a, #fee140);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 800;
          color: white;
        }

        /* STOCK SUMMARY CARD */
        .stock-summary-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        .summary-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          background: rgba(0, 0, 0, 0.2);
        }

        .summary-header h3 {
          color: white;
          margin: 0;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .summary-header h3 i {
          color: #667eea;
        }

        .search-box {
          position: relative;
          width: 300px;
          max-width: 100%;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #a0aec0;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(102, 126, 234, 0.5);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        /* TABLE */
        .table-responsive {
          overflow-x: auto;
        }

        .stock-table {
          width: 100%;
          border-collapse: collapse;
        }

        .stock-table thead {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
        }

        .stock-table th {
          padding: 1.25rem 1rem;
          text-align: left;
          font-weight: 700;
          font-size: 0.85rem;
          color: #a0aec0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stock-table tbody tr {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
        }

        .stock-table tbody tr:hover {
          background: rgba(102, 126, 234, 0.1);
        }

        .stock-table tbody tr.low {
          background: rgba(245, 87, 108, 0.05);
        }

        .stock-table tbody tr.critical {
          background: rgba(245, 87, 108, 0.1);
        }

        .stock-table td {
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

        .stock-qty {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }

        .qty-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #38ef7d;
        }

        .qty-label {
          font-size: 0.85rem;
          color: #a0aec0;
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

        .status-badge.healthy {
          background: rgba(56, 239, 125, 0.2);
          color: #38ef7d;
        }

        .status-badge.low {
          background: rgba(245, 166, 35, 0.2);
          color: #f5a623;
        }

        .status-badge.critical {
          background: rgba(245, 87, 108, 0.2);
          color: #f5576c;
          animation: pulse 2s ease-in-out infinite;
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

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .summary-header {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            width: 100%;
          }

          .threshold-controls {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}
