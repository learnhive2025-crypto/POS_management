"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "../components/PageHeader";

type Product = {
    id: string;
    name: string;
    barcode: string;
    stock_qty: number;
};

export default function BarcodeListPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("access_token")
            : null;

    /* ---------------- FETCH PRODUCTS ---------------- */
    const fetchProducts = async () => {
        if (!token) {
            router.push("/login");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("https://mythra-shop-dev.onrender.com/products/barcode-list", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 401) {
                localStorage.removeItem("access_token");
                router.push("/login");
                return;
            }

            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error("Error fetching barcode list:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    /* ---------------- FILTER PRODUCTS ---------------- */
    const filteredProducts = products.filter(
        (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.barcode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    /* ---------------- PRINT BARCODE LIST ---------------- */
    const handlePrint = () => {
        window.print();
    };

    /* ---------------- EXPORT TO CSV ---------------- */
    const handleExport = () => {
        const csvContent = [
            ["Name", "Barcode", "Stock Quantity"],
            ...filteredProducts.map((p) => [p.name, p.barcode, p.stock_qty]),
        ]
            .map((row) => row.join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `barcode-list-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="barcode-container">
            <PageHeader
                title="Barcode List"
                subtitle="View and manage product barcodes and stock quantities"
                icon="upc-scan"
            >
                <div className="header-actions">
                    <button className="btn-export" onClick={handleExport}>
                        <i className="bi bi-download"></i>
                        <span>Export CSV</span>
                    </button>
                    <button className="btn-print" onClick={handlePrint}>
                        <i className="bi bi-printer"></i>
                        <span>Print</span>
                    </button>
                </div>
            </PageHeader>

            {/* SEARCH BAR */}
            <div className="search-section">
                <div className="search-box">
                    <i className="bi bi-search"></i>
                    <input
                        type="text"
                        placeholder="Search by product name or barcode..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    {searchTerm && (
                        <button
                            className="clear-search"
                            onClick={() => setSearchTerm("")}
                        >
                            <i className="bi bi-x-circle-fill"></i>
                        </button>
                    )}
                </div>
                <div className="search-stats">
                    <span className="result-count">
                        {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
                    </span>
                </div>
            </div>

            {/* BARCODE TABLE */}
            <div className="barcode-card">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading barcode list...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="empty-state">
                        <i className="bi bi-upc"></i>
                        <h4>No Products Found</h4>
                        <p>
                            {searchTerm
                                ? "No products match your search criteria"
                                : "No products available in the system"}
                        </p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="barcode-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Product Name</th>
                                    <th>Barcode</th>
                                    <th>Stock Quantity</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product, index) => (
                                    <tr key={product.id}>
                                        <td className="row-number">{index + 1}</td>
                                        <td className="product-name">
                                            <div className="product-icon">
                                                <i className="bi bi-box-seam"></i>
                                            </div>
                                            <span>{product.name}</span>
                                        </td>
                                        <td className="barcode">
                                            <div className="barcode-display">
                                                <i className="bi bi-upc-scan"></i>
                                                <code>{product.barcode}</code>
                                            </div>
                                        </td>
                                        <td className="stock-qty">
                                            <span className="qty-badge">{product.stock_qty}</span>
                                        </td>
                                        <td>
                                            <span
                                                className={`status-badge ${product.stock_qty > 10
                                                    ? "in-stock"
                                                    : product.stock_qty > 0
                                                        ? "low-stock"
                                                        : "out-of-stock"
                                                    }`}
                                            >
                                                {product.stock_qty > 10
                                                    ? "In Stock"
                                                    : product.stock_qty > 0
                                                        ? "Low Stock"
                                                        : "Out of Stock"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style jsx>{`
        .barcode-container {
          padding: 0.5rem;
          animation: fadeIn 0.5s ease-in-out;
        }

        /* HEADER ACTIONS */
        .header-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn-export,
        .btn-print {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-export {
          background: linear-gradient(135deg, #667eea, #764ba2);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-export:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
        }

        .btn-print {
          background: linear-gradient(135deg, #f093fb, #f5576c);
          box-shadow: 0 4px 15px rgba(240, 147, 251, 0.4);
        }

        .btn-print:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(240, 147, 251, 0.6);
        }

        /* SEARCH SECTION */
        .search-section {
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .search-box {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 0 1rem;
          transition: all 0.3s ease;
        }

        .search-box:focus-within {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(102, 126, 234, 0.5);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .search-box i.bi-search {
          color: #a0aec0;
          font-size: 1.25rem;
          margin-right: 0.75rem;
        }

        .search-input {
          flex: 1;
          padding: 1rem 0;
          background: transparent;
          border: none;
          color: white;
          font-size: 1rem;
          outline: none;
        }

        .search-input::placeholder {
          color: #718096;
        }

        .clear-search {
          background: none;
          border: none;
          color: #718096;
          cursor: pointer;
          font-size: 1.25rem;
          padding: 0.25rem;
          transition: all 0.3s ease;
        }

        .clear-search:hover {
          color: #f5576c;
        }

        .search-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .result-count {
          color: #a0aec0;
          font-size: 0.9rem;
          font-weight: 600;
        }

        /* BARCODE CARD */
        .barcode-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .barcode-table {
          width: 100%;
          border-collapse: collapse;
        }

        .barcode-table thead {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
        }

        .barcode-table th {
          padding: 1.25rem 1rem;
          text-align: left;
          font-weight: 700;
          font-size: 0.85rem;
          color: #a0aec0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .barcode-table tbody tr {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
        }

        .barcode-table tbody tr:hover {
          background: rgba(102, 126, 234, 0.1);
        }

        .barcode-table td {
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
          gap: 0.875rem;
          font-weight: 600;
        }

        .product-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          color: white;
        }

        .barcode {
          font-family: 'Courier New', monospace;
        }

        .barcode-display {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.875rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          width: fit-content;
        }

        .barcode-display i {
          color: #667eea;
          font-size: 1.1rem;
        }

        .barcode-display code {
          color: #f5a623;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .stock-qty {
          text-align: center;
        }

        .qty-badge {
          padding: 0.5rem 1rem;
          background: rgba(102, 126, 234, 0.2);
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 700;
          color: #667eea;
          display: inline-block;
          min-width: 60px;
        }

        .status-badge {
          padding: 0.5rem 0.875rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-badge.in-stock {
          background: rgba(56, 239, 125, 0.2);
          color: #38ef7d;
        }

        .status-badge.low-stock {
          background: rgba(245, 166, 35, 0.2);
          color: #f5a623;
        }

        .status-badge.out-of-stock {
          background: rgba(245, 87, 108, 0.2);
          color: #f5576c;
        }

        /* LOADING & EMPTY STATES */
        .loading-state,
        .empty-state {
          padding: 4rem;
          text-align: center;
        }

        .loading-state .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(102, 126, 234, 0.2);
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        .loading-state p {
          color: #a0aec0;
          font-size: 1.1rem;
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
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* PRINT STYLES */
        @media print {
          .header-actions,
          .search-section {
            display: none !important;
          }

          .barcode-card {
            border: 1px solid #ddd;
            box-shadow: none;
          }

          .barcode-table {
            color: black;
          }

          .barcode-table th,
          .barcode-table td {
            color: black;
            border: 1px solid #ddd;
          }
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .header-actions {
            flex-direction: column;
            width: 100%;
          }

          .btn-export,
          .btn-print {
            width: 100%;
            justify-content: center;
          }

          .barcode-table {
            font-size: 0.85rem;
          }

          .barcode-table th,
          .barcode-table td {
            padding: 0.875rem 0.5rem;
          }

          .product-icon {
            width: 32px;
            height: 32px;
            font-size: 1rem;
          }

          .barcode-display {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
        </div>
    );
}
