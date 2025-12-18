"use client";

import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stockQty, setStockQty] = useState("");

  // 🔍 FILTER STATES
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

  const role =
    typeof window !== "undefined"
      ? (localStorage.getItem("role") || "").toLowerCase()
      : "";

  /* ---------------- FETCH PRODUCTS ---------------- */
  const fetchProducts = async () => {
    setLoading(true);
    const res = await fetch("https://mythra-shop-dev.onrender.com/products/list", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  };

  /* ---------------- FETCH CATEGORIES ---------------- */
  const fetchCategories = async () => {
    const res = await fetch("https://mythra-shop-dev.onrender.com/categories/list", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  /* ---------------- FILTER LOGIC ---------------- */
  const filteredProducts = products.filter((p) => {
    const matchName = p.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchCategory = categoryFilter
      ? p.category === categoryFilter
      : true;

    return matchName && matchCategory;
  });

  /* ---------------- ADD / UPDATE ---------------- */
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const url = editId
      ? `https://mythra-shop-dev.onrender.com/products/update/${editId}`
      : "https://mythra-shop-dev.onrender.com/products/add";

    const method = editId ? "PUT" : "POST";

    const body: any = {
      name,
      category_id: categoryId,
      purchase_price: Number(purchasePrice),
      selling_price: Number(sellingPrice),
      stock_qty: Number(stockQty),
    };

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    resetForm();
    fetchProducts();
  };

  /* ---------------- DELETE ---------------- */
  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;

    await fetch(`https://mythra-shop-dev.onrender.com/products/delete/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchProducts();
  };

  /* ---------------- EDIT ---------------- */
  const editProduct = (p: any) => {
    setEditId(p.id);
    setName(p.name);
    setCategoryId(
      categories.find((c) => c.name === p.category)?.id || ""
    );
    setPurchasePrice(p.purchase_price);
    setSellingPrice(p.selling_price);
    setStockQty(p.stock_qty);
    setShowForm(true);
  };

  const resetForm = () => {
    setEditId(null);
    setName("");
    setCategoryId("");
    setPurchasePrice("");
    setSellingPrice("");
    setStockQty("");
    setShowForm(false);
  };

  return (
    <div className="products-container">
      <PageHeader
        title="Product Management"
        subtitle="Manage your inventory and product catalog"
        icon="box-seam"
      >
        <div className="header-actions">
          <button className="btn-export-excel" onClick={() => window.open("https://mythra-shop-dev.onrender.com/download-products", "_blank")}>
            <i className="bi bi-file-earmark-excel-fill"></i>
            <span>Export Excel</span>
          </button>
          <button className="btn-add-product" onClick={() => setShowForm(true)}>
            <i className="bi bi-plus-circle"></i>
            <span>Add Product</span>
          </button>
        </div>
      </PageHeader>

      {/* FILTER BAR */}
      <div className="filter-card">
        <div className="filter-grid">
          <div className="search-box">
            <i className="bi bi-search search-icon"></i>
            <input
              className="search-input"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="select-box">
            <i className="bi bi-funnel select-icon"></i>
            <select
              className="select-input"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn-clear"
            onClick={() => {
              setSearch("");
              setCategoryFilter("");
            }}
          >
            <i className="bi bi-x-circle"></i>
            Clear Filters
          </button>
        </div>
      </div>

      {/* PRODUCTS GRID/TABLE */}
      <div className="products-card">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-inbox"></i>
            <h4>No Products Found</h4>
            <p>Try adjusting your filters or add a new product</p>
            <button className="btn-add-product" onClick={() => setShowForm(true)}>
              <i className="bi bi-plus-circle"></i>
              Add First Product
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="products-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Purchase Price</th>
                  <th>Selling Price</th>
                  <th>Stock</th>
                  <th>Profit Margin</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p, i) => {
                  const profitMargin = ((p.selling_price - p.purchase_price) / p.purchase_price * 100).toFixed(1);
                  const isLowStock = p.stock_qty < 10;

                  return (
                    <tr key={p.id}>
                      <td className="row-number">{i + 1}</td>
                      <td className="product-name">
                        <i className="bi bi-box product-icon"></i>
                        {p.name}
                      </td>
                      <td>
                        <span className="category-badge">{p.category}</span>
                      </td>
                      <td className="price">₹{p.purchase_price}</td>
                      <td className="price">₹{p.selling_price}</td>
                      <td>
                        <span className={`stock-badge ${isLowStock ? 'low' : ''}`}>
                          {p.stock_qty} units
                        </span>
                      </td>
                      <td className="profit-margin">
                        <span className="profit-value">+{profitMargin}%</span>
                      </td>
                      <td className="actions">
                        {(role === "admin" || role === "super_admin") && (
                          <>
                            <button
                              className="btn-edit"
                              onClick={() => editProduct(p)}
                              title="Edit Product"
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => deleteProduct(p.id)}
                              title="Delete Product"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredProducts.length > 0 && (
          <div className="table-footer">
            <span className="result-count">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* MODAL FORM */}
      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editId ? "Update Product" : "Add New Product"}
      >
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label className="form-label">
              <i className="bi bi-tag"></i>
              Product Name
            </label>
            <input
              className="form-input"
              placeholder="Enter product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <i className="bi bi-grid"></i>
              Category
            </label>
            <select
              className="form-input"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <i className="bi bi-currency-rupee"></i>
                Purchase Price
              </label>
              <input
                type="number"
                className="form-input"
                placeholder="0.00"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <i className="bi bi-currency-rupee"></i>
                Selling Price
              </label>
              <input
                type="number"
                className="form-input"
                placeholder="0.00"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <i className="bi bi-boxes"></i>
              Stock Quantity
            </label>
            <input
              type="number"
              className="form-input"
              placeholder="0"
              value={stockQty}
              onChange={(e) => setStockQty(e.target.value)}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              <i className="bi bi-check-circle"></i>
              {editId ? "Update Product" : "Add Product"}
            </button>
            <button type="button" className="btn-cancel" onClick={resetForm}>
              <i className="bi bi-x-circle"></i>
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <style jsx>{`
        .products-container {
          padding: 0.5rem;
          animation: fadeIn 0.5s ease-in-out;
        }

        /* HEADER ACTIONS */
        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-add-product,
        .btn-export-excel {
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

        .btn-add-product {
          background: linear-gradient(135deg, #667eea, #764ba2);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-add-product:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
        }

        .btn-export-excel {
          background: linear-gradient(135deg, #28a745, #20c997);
          box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
        }

        .btn-export-excel:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(40, 167, 69, 0.6);
        }

        .btn-add-product i,
        .btn-export-excel i {
          font-size: 1.25rem;
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

        .filter-grid {
          display: grid;
          grid-template-columns: 2fr 1.5fr auto;
          gap: 1rem;
        }

        .search-box,
        .select-box {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon,
        .select-icon {
          position: absolute;
          left: 1rem;
          color: #a0aec0;
          font-size: 1.1rem;
          pointer-events: none;
          z-index: 1;
        }

        .search-input,
        .select-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .search-input::placeholder {
          color: #718096;
        }

        .search-input:focus,
        .select-input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(102, 126, 234, 0.5);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .select-input option {
          background: #1a1a2e;
          color: white;
        }

        .btn-clear {
          padding: 0.875rem 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #a0aec0;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          white-space: nowrap;
        }

        .btn-clear:hover {
          background: rgba(255, 87, 108, 0.1);
          border-color: rgba(255, 87, 108, 0.3);
          color: #f5576c;
        }

        /* PRODUCTS CARD */
        .products-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .products-table {
          width: 100%;
          border-collapse: collapse;
        }

        .products-table thead {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
        }

        .products-table th {
          padding: 1.25rem 1rem;
          text-align: left;
          font-weight: 700;
          font-size: 0.85rem;
          color: #a0aec0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .products-table tbody tr {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
        }

        .products-table tbody tr:hover {
          background: rgba(102, 126, 234, 0.1);
          transform: scale(1.01);
        }

        .products-table td {
          padding: 1.25rem 1rem;
          color: white;
          font-size: 0.95rem;
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

        .product-icon {
          font-size: 1.25rem;
          color: #667eea;
        }

        .category-badge {
          padding: 0.375rem 0.875rem;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #a0aec0;
          display: inline-block;
        }

        .price {
          font-weight: 700;
          color: #38ef7d;
        }

        .stock-badge {
          padding: 0.375rem 0.875rem;
          background: rgba(56, 239, 125, 0.2);
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #38ef7d;
          display: inline-block;
        }

        .stock-badge.low {
          background: rgba(245, 87, 108, 0.2);
          color: #f5576c;
        }

        .profit-margin {
          font-weight: 700;
        }

        .profit-value {
          color: #38ef7d;
        }

        .actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-edit,
        .btn-delete {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .btn-edit {
          background: rgba(240, 147, 251, 0.2);
          color: #f093fb;
        }

        .btn-edit:hover {
          background: rgba(240, 147, 251, 0.3);
          transform: scale(1.1);
        }

        .btn-delete {
          background: rgba(245, 87, 108, 0.2);
          color: #f5576c;
        }

        .btn-delete:hover {
          background: rgba(245, 87, 108, 0.3);
          transform: scale(1.1);
        }

        .table-footer {
          padding: 1.25rem 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.2);
        }

        .result-count {
          color: #a0aec0;
          font-size: 0.9rem;
        }

        /* LOADING STATE */
        .loading-state {
          padding: 4rem;
          text-align: center;
        }

        .loading-state p {
          color: #a0aec0;
          margin-top: 1rem;
          font-size: 1.1rem;
        }

        /* EMPTY STATE */
        .empty-state {
          padding: 4rem 2rem;
          text-align: center;
          color: #718096;
        }

        .empty-state i {
          font-size: 5rem;
          margin-bottom: 1.5rem;
          opacity: 0.5;
        }

        .empty-state h4 {
          color: white;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          margin-bottom: 2rem;
        }

        /* FORM STYLES */
        .product-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          color: #a0aec0;
          font-weight: 600;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .form-input {
          padding: 0.875rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .form-input::placeholder {
          color: #718096;
        }

        .form-input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(102, 126, 234, 0.5);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-input option {
          background: #1a1a2e;
          color: white;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .btn-submit,
        .btn-cancel {
          flex: 1;
          padding: 1rem;
          border-radius: 12px;
          border: none;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-submit {
          background: linear-gradient(135deg, #11998e, #38ef7d);
          color: white;
          box-shadow: 0 4px 15px rgba(56, 239, 125, 0.3);
        }

        .btn-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(56, 239, 125, 0.5);
        }

        .btn-cancel {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #a0aec0;
        }

        .btn-cancel:hover {
          background: rgba(255, 87, 108, 0.1);
          border-color: rgba(255, 87, 108, 0.3);
          color: #f5576c;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @media (max-width: 1200px) {
          .filter-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .products-table {
            font-size: 0.85rem;
          }

          .products-table th,
          .products-table td {
            padding: 0.875rem 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
