"use client";

import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";

/* ---------------- TYPES ---------------- */
type SlowProduct = {
  product_id: string;
  name: string;
  stock_qty: number;
};

type RestockProduct = {
  product_id: string;
  name: string;
  stock_qty: number;
  avg_daily_sales: number;
  days_of_stock_left: number;
  suggestion: string;
};

type DemandProduct = {
  product_id: string;
  name: string;
  avg_daily_sales: number;
  predicted_demand_next_days: number;
  current_stock: number;
};

export default function ReportsPage() {
  const [tab, setTab] = useState<"slow" | "restock" | "predict">("slow");

  const [slow, setSlow] = useState<SlowProduct[]>([]);
  const [restock, setRestock] = useState<RestockProduct[]>([]);
  const [demand, setDemand] = useState<DemandProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token") || ""
      : "";

  /* ---------------- FETCH DATA ---------------- */
  const fetchSlow = async () => {
    const res = await fetch(
      "https://mythra-shop-dev.onrender.com/analytics/slow-moving",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setSlow(await res.json());
  };

  const fetchRestock = async () => {
    const res = await fetch(
      "https://mythra-shop-dev.onrender.com/analytics/restock-suggestions",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setRestock(await res.json());
  };

  const fetchDemand = async () => {
    const res = await fetch(
      "https://mythra-shop-dev.onrender.com/analytics/demand-prediction",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setDemand(await res.json());
  };

  useEffect(() => {
    setLoading(true);

    Promise.all([fetchSlow(), fetchRestock(), fetchDemand()]).then(() =>
      setLoading(false)
    );
  }, []);

  /* ---------------- UI ---------------- */
  return (
    <div className="reports-container">
      <PageHeader
        title="AI Analytics & Reports"
        subtitle="Smart insights for inventory management"
        icon="robot"
      />

      {/* TABS */}
      <div className="tabs-container">
        <button
          className={`tab-button ${tab === "slow" ? "active" : ""}`}
          onClick={() => setTab("slow")}
        >
          <i className="bi bi-graph-down"></i>
          Slow Moving
        </button>

        <button
          className={`tab-button ${tab === "restock" ? "active" : ""}`}
          onClick={() => setTab("restock")}
        >
          <i className="bi bi-bell-fill"></i>
          Restock Alerts
        </button>

        <button
          className={`tab-button ${tab === "predict" ? "active" : ""}`}
          onClick={() => setTab("predict")}
        >
          <i className="bi bi-graph-up-arrow"></i>
          Demand Forecast
        </button>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      )}

      {/* ---------------- SLOW MOVING ---------------- */}
      {!loading && tab === "slow" && (
        <div className="report-card">
          <div className="report-header slow">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <h3>Slow Moving Products</h3>
            <p>Products not sold recently</p>
          </div>
          {slow.length === 0 ? (
            <div className="empty-report">
              <i className="bi bi-check-circle-fill"></i>
              <h4>All Products Moving!</h4>
              <p>No slow-moving products detected</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product Name</th>
                    <th>Stock Quantity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {slow.map((p, idx) => (
                    <tr key={p.product_id}>
                      <td className="row-number">{idx + 1}</td>
                      <td className="product-name">
                        <i className="bi bi-box"></i>
                        {p.name}
                      </td>
                      <td>
                        <span className="qty-badge warning">
                          {p.stock_qty} units
                        </span>
                      </td>
                      <td>
                        <span className="status-badge warning">
                          <i className="bi bi-hourglass-split"></i>
                          Slow Moving
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ---------------- RESTOCK ---------------- */}
      {!loading && tab === "restock" && (
        <div className="report-card">
          <div className="report-header restock">
            <i className="bi bi-bell-fill"></i>
            <h3>Restock Suggestions</h3>
            <p>Products requiring immediate attention</p>
          </div>
          {restock.length === 0 ? (
            <div className="empty-report">
              <i className="bi bi-check-circle-fill"></i>
              <h4>Stock Levels Healthy!</h4>
              <p>No restock needed at this time</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product Name</th>
                    <th>Current Stock</th>
                    <th>Avg Daily Sales</th>
                    <th>Days Left</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {restock.map((r, idx) => (
                    <tr key={r.product_id} className="urgent">
                      <td className="row-number">{idx + 1}</td>
                      <td className="product-name">
                        <i className="bi bi-box"></i>
                        {r.name}
                      </td>
                      <td>
                        <span className="qty-badge danger">
                          {r.stock_qty} units
                        </span>
                      </td>
                      <td>
                        <span className="sales-badge">
                          {r.avg_daily_sales} units/day
                        </span>
                      </td>
                      <td>
                        <span className={`days-badge ${r.days_of_stock_left <= 3 ? 'critical' : 'warning'}`}>
                          {r.days_of_stock_left} days
                        </span>
                      </td>
                      <td>
                        <span className="status-badge danger">
                          <i className="bi bi-cart-plus-fill"></i>
                          RESTOCK NOW
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ---------------- DEMAND PREDICTION ---------------- */}
      {!loading && tab === "predict" && (
        <div className="report-card">
          <div className="report-header predict">
            <i className="bi bi-graph-up-arrow"></i>
            <h3>Demand Prediction</h3>
            <p>Forecast for upcoming sales</p>
          </div>
          {demand.length === 0 ? (
            <div className="empty-report">
              <i className="bi bi-info-circle-fill"></i>
              <h4>No Prediction Data</h4>
              <p>Insufficient sales history for prediction</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product Name</th>
                    <th>Avg Daily Sales</th>
                    <th>Predicted Demand</th>
                    <th>Current Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {demand.map((d, idx) => {
                    const needsRestock = d.current_stock < d.predicted_demand_next_days;
                    return (
                      <tr key={d.product_id}>
                        <td className="row-number">{idx + 1}</td>
                        <td className="product-name">
                          <i className="bi bi-box"></i>
                          {d.name}
                        </td>
                        <td>
                          <span className="sales-badge">
                            {d.avg_daily_sales} units/day
                          </span>
                        </td>
                        <td>
                          <span className="predict-badge">
                            {d.predicted_demand_next_days} units
                          </span>
                        </td>
                        <td>
                          <span className={`qty-badge ${needsRestock ? 'danger' : 'success'}`}>
                            {d.current_stock} units
                          </span>
                        </td>
                        <td>
                          {needsRestock ? (
                            <span className="status-badge warning">
                              <i className="bi bi-exclamation-triangle-fill"></i>
                              Stock Up
                            </span>
                          ) : (
                            <span className="status-badge success">
                              <i className="bi bi-check-circle-fill"></i>
                              Sufficient
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
      )}

      <style jsx>{`
        .reports-container {
          padding: 0.5rem;
          animation: fadeIn 0.5s ease-in-out;
        }

        /* TABS */
        .tabs-container {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .tab-button {
          flex: 1;
          min-width: 200px;
          padding: 1.25rem 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #a0aec0;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .tab-button i {
          font-size: 1.25rem;
        }

        .tab-button:hover {
          background: rgba(255, 255, 255, 0.08);
          color: white;
          transform: translateY(-2px);
        }

        .tab-button.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-color: transparent;
          color: white;
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        /* REPORT CARD */
        .report-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        .report-header {
          padding: 2rem;
          text-align: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
        }

        .report-header i {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .report-header h3 {
          color: white;
          margin: 0 0 0.5rem 0;
          font-size: 1.75rem;
        }

        .report-header p {
          color: #a0aec0;
          margin: 0;
        }

        .report-header.slow {
          background: linear-gradient(135deg, rgba(245, 166, 35, 0.1), rgba(255, 215, 0, 0.05));
        }

        .report-header.slow i {
          color: #f5a623;
        }

        .report-header.restock {
          background: linear-gradient(135deg, rgba(245, 87, 108, 0.1), rgba(250, 112, 154, 0.05));
        }

        .report-header.restock i {
          color: #f5576c;
        }

        .report-header.predict {
          background: linear-gradient(135deg, rgba(17, 153, 142, 0.1), rgba(56, 239, 125, 0.05));
        }

        .report-header.predict i {
          color: #38ef7d;
        }

        /* EMPTY STATE */
        .empty-report {
          padding: 4rem;
          text-align: center;
        }

        .empty-report i {
          font-size: 5rem;
          color: #38ef7d;
          margin-bottom: 1.5rem;
        }

        .empty-report h4 {
          color: white;
          margin-bottom: 0.5rem;
        }

        .empty-report p {
          color: #a0aec0;
        }

        /* TABLE */
        .table-responsive {
          overflow-x: auto;
        }

        .report-table {
          width: 100%;
          border-collapse: collapse;
        }

        .report-table thead {
          background: rgba(0, 0, 0, 0.2);
        }

        .report-table th {
          padding: 1.25rem 1rem;
          text-align: left;
          font-weight: 700;
          font-size: 0.85rem;
          color: #a0aec0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .report-table tbody tr {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
        }

        .report-table tbody tr:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .report-table tbody tr.urgent {
          background: rgba(245, 87, 108, 0.05);
        }

        .report-table td {
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

        .qty-badge,
        .sales-badge,
        .days-badge,
        .predict-badge {
          padding: 0.5rem 0.875rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          display: inline-block;
        }

        .qty-badge.success {
          background: rgba(56, 239, 125, 0.2);
          color: #38ef7d;
        }

        .qty-badge.warning {
          background: rgba(245, 166, 35, 0.2);
          color: #f5a623;
        }

        .qty-badge.danger {
          background: rgba(245, 87, 108, 0.2);
          color: #f5576c;
        }

        .sales-badge {
          background: rgba(102, 126, 234, 0.2);
          color: #667eea;
        }

        .days-badge.warning {
          background: rgba(245, 166, 35, 0.2);
          color: #f5a623;
        }

        .days-badge.critical {
          background: rgba(245, 87, 108, 0.2);
          color: #f5576c;
          animation: pulse 2s ease-in-out infinite;
        }

        .predict-badge {
          background: rgba(56, 239, 125, 0.2);
          color: #38ef7d;
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

        .status-badge.success {
          background: rgba(56, 239, 125, 0.2);
          color: #38ef7d;
        }

        .status-badge.warning {
          background: rgba(245, 166, 35, 0.2);
          color: #f5a623;
        }

        .status-badge.danger {
          background: rgba(245, 87, 108, 0.2);
          color: #f5576c;
        }

        /* LOADING STATE */
        .loading-state {
          padding: 4rem;
          text-align: center;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        @media (max-width: 768px) {
          .tabs-container {
            flex-direction: column;
          }

          .tab-button {
            width: 100%;
          }

          .report-table {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}
