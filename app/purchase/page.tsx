"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";

type Product = {
  id: string;
  name: string;
  purchase_price?: number;
};

type Item = {
  product_id: string;
  qty: number;
  price: number;
};

export default function PurchasePage() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [invoiceNo, setInvoiceNo] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [items, setItems] = useState<Item[]>([
    { product_id: "", qty: 1, price: 0 },
  ]);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : "";

  /* ---------------- FETCH DATA ---------------- */
  const handleUnauthorized = () => {
    localStorage.clear();
    router.push("/login");
  };

  const fetchJson = async (url: string, options: RequestInit = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      handleUnauthorized();
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || `Failed to fetch from ${url}`);
    }

    return res.json();
  };

  const fetchPurchases = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJson("https://mythra-shop-dev.onrender.com/purchases/list");
      setPurchases(data);
    } catch (err: any) {
      if (err.message !== "Unauthorized") {
        console.error("Fetch purchases error:", err);
        setError("Failed to load purchases.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await fetchJson("https://mythra-shop-dev.onrender.com/products/list");
      setProducts(data);
    } catch (err: any) {
      if (err.message !== "Unauthorized") {
        console.error("Fetch products error:", err);
      }
    }
  };

  useEffect(() => {
    fetchPurchases();
    fetchProducts();
  }, []);

  /* ---------------- TOTAL ---------------- */
  const totalAmount = items.reduce((sum, i) => sum + i.qty * i.price, 0);

  /* ---------------- ITEM HANDLERS ---------------- */
  const addItem = () => {
    setItems([...items, { product_id: "", qty: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    const copy = [...items];
    copy.splice(index, 1);
    setItems(copy);
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    const copy = [...items];
    copy[index].product_id = productId;
    copy[index].price = product?.purchase_price || 0;
    setItems(copy);
  };

  const updateItem = (index: number, key: "qty" | "price", value: number) => {
    const copy = [...items];
    copy[index][key] = value;
    setItems(copy);
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    for (const item of items) {
      if (!item.product_id) {
        alert("Please select product for all items");
        return;
      }
      if (item.qty <= 0 || item.price <= 0) {
        alert("Qty and price must be greater than 0");
        return;
      }
    }

    const url = editId
      ? `https://mythra-shop-dev.onrender.com/purchases/update/${editId}`
      : "https://mythra-shop-dev.onrender.com/purchases/add";

    try {
      await fetchJson(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_no: invoiceNo,
          supplier_name: supplierName,
          items,
        }),
      });

      resetForm();
      fetchPurchases();
    } catch (err: any) {
      if (err.message !== "Unauthorized") {
        alert(err.message);
      }
    }
  };

  /* ---------------- DELETE ---------------- */
  const deletePurchase = async (id: string) => {
    if (!confirm("Delete this purchase?")) return;

    try {
      await fetchJson(`https://mythra-shop-dev.onrender.com/purchases/delete/${id}`, {
        method: "DELETE",
      });
      fetchPurchases();
    } catch (err: any) {
      if (err.message !== "Unauthorized") {
        alert(err.message);
      }
    }
  };

  /* ---------------- EDIT ---------------- */
  const editPurchase = async (id: string) => {
    try {
      const data = await fetchJson(`https://mythra-shop-dev.onrender.com/purchases/${id}`);
      setEditId(id);
      setInvoiceNo(data.invoice_no);
      setSupplierName(data.supplier_name);
      setItems(data.items);
      setShowForm(true);
    } catch (err: any) {
      if (err.message !== "Unauthorized") {
        alert("Failed to load purchase details.");
      }
    }
  };

  const resetForm = () => {
    setEditId(null);
    setInvoiceNo("");
    setSupplierName("");
    setItems([{ product_id: "", qty: 1, price: 0 }]);
    setShowForm(false);
  };

  return (
    <div className="purchase-container">
      <PageHeader
        title="Purchase Management"
        subtitle="Track inventory purchases and suppliers"
        icon="cart-plus-fill"
      >
        <button className="btn-add-purchase" onClick={() => setShowForm(true)}>
          <i className="bi bi-plus-circle"></i>
          <span>Add Purchase</span>
        </button>
      </PageHeader>

      {/* PURCHASES TABLE */}
      <div className="purchases-card">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading purchases...</p>
          </div>
        ) : purchases.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-cart-x"></i>
            <h4>No Purchases Found</h4>
            <p>Start tracking your inventory purchases</p>
            <button className="btn-add-purchase" onClick={() => setShowForm(true)}>
              <i className="bi bi-plus-circle"></i>
              Add First Purchase
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="purchases-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Invoice No.</th>
                  <th>Supplier</th>
                  <th>Total Amount</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p, i) => (
                  <tr key={p._id}>
                    <td className="row-number">{i + 1}</td>
                    <td className="invoice-no">
                      <i className="bi bi-receipt"></i>
                      {p.invoice_no}
                    </td>
                    <td>
                      <span className="supplier-name">{p.supplier_name}</span>
                    </td>
                    <td className="amount">₹{p.total_amount.toLocaleString()}</td>
                    <td className="date">
                      {new Date(p.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="actions">
                      <button
                        className="btn-edit"
                        onClick={() => editPurchase(p._id)}
                        title="Edit Purchase"
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => deletePurchase(p._id)}
                        title="Delete Purchase"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL FORM */}
      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editId ? "Update Purchase" : "Add New Purchase"}
      >
        <form onSubmit={handleSubmit} className="purchase-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <i className="bi bi-receipt-cutoff"></i>
                Invoice Number
              </label>
              <input
                className="form-input"
                placeholder="INV-001"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <i className="bi bi-building"></i>
                Supplier Name
              </label>
              <input
                className="form-input"
                placeholder="Supplier name"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* ITEMS TABLE */}
          <div className="items-section">
            <div className="items-header">
              <h4>Purchase Items</h4>
              <button
                type="button"
                className="btn-add-item"
                onClick={addItem}
              >
                <i className="bi bi-plus-circle"></i>
                Add Item
              </button>
            </div>

            <div className="items-table-wrapper">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td>
                        <select
                          className="item-select"
                          value={item.product_id}
                          onChange={(e) => handleProductSelect(i, e.target.value)}
                          required
                        >
                          <option value="">Select product</option>
                          {products.map((p) => {
                            const disabled = items.some(
                              (it, idx) => it.product_id === p.id && idx !== i
                            );
                            return (
                              <option
                                key={p.id}
                                value={p.id}
                                disabled={disabled}
                              >
                                {p.name}
                                {disabled ? " (Added)" : ""}
                              </option>
                            );
                          })}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          min={1}
                          className="item-input"
                          value={item.qty}
                          onChange={(e) => updateItem(i, "qty", Number(e.target.value))}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={1}
                          className="item-input"
                          value={item.price}
                          onChange={(e) => updateItem(i, "price", Number(e.target.value))}
                        />
                      </td>
                      <td className="item-total">₹{item.qty * item.price}</td>
                      <td>
                        {items.length > 1 && (
                          <button
                            type="button"
                            className="btn-remove-item"
                            onClick={() => removeItem(i)}
                          >
                            <i className="bi bi-x-circle"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="total-section">
              <span>Total Amount:</span>
              <strong>₹{totalAmount.toLocaleString()}</strong>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              <i className="bi bi-check-circle"></i>
              {editId ? "Update Purchase" : "Save Purchase"}
            </button>
            <button type="button" className="btn-cancel" onClick={resetForm}>
              <i className="bi bi-x-circle"></i>
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <style jsx>{`
        .purchase-container {
          padding: 0.5rem;
          animation: fadeIn 0.5s ease-in-out;
        }

        /* HEADER BUTTON */
        .btn-add-purchase {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, #4facfe, #00f2fe);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);
        }

        .btn-add-purchase:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(79, 172, 254, 0.6);
        }

        /* PURCHASES CARD */
        .purchases-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .purchases-table {
          width: 100%;
          border-collapse: collapse;
        }

        .purchases-table thead {
          background: linear-gradient(135deg, rgba(79, 172, 254, 0.2), rgba(0, 242, 254, 0.2));
        }

        .purchases-table th {
          padding: 1.25rem 1rem;
          text-align: left;
          font-weight: 700;
          font-size: 0.85rem;
          color: #a0aec0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .purchases-table tbody tr {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
        }

        .purchases-table tbody tr:hover {
          background: rgba(79, 172, 254, 0.1);
          transform: scale(1.01);
        }

        .purchases-table td {
          padding: 1.25rem 1rem;
          color: white;
          font-size: 0.95rem;
        }

        .row-number {
          color: #718096;
          font-weight: 600;
        }

        .invoice-no {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
        }

        .invoice-no i {
          color: #4facfe;
        }

        .supplier-name {
          padding: 0.375rem 0.875rem;
          background: linear-gradient(135deg, rgba(79, 172, 254, 0.2), rgba(0, 242, 254, 0.2));
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          display: inline-block;
        }

        .amount {
          font-weight: 700;
          color: #38ef7d;
          font-size: 1rem;
        }

        .date {
          color: #a0aec0;
          font-size: 0.9rem;
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
          margin-bottom: 2rem;
        }

        /* FORM STYLES */
        .purchase-form {
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

        .form-input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(79, 172, 254, 0.5);
          box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
        }

        /* ITEMS SECTION */
        .items-section {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .items-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .items-header h4 {
          color: white;
          margin: 0;
        }

        .btn-add-item {
          padding: 0.5rem 1rem;
          background: rgba(79, 172, 254, 0.2);
          border: 1px solid rgba(79, 172, 254, 0.3);
          border-radius: 8px;
          color: #4facfe;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-add-item:hover {
          background: rgba(79, 172, 254, 0.3);
        }

        .items-table-wrapper {
          overflow-x: auto;
          margin-bottom: 1rem;
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
        }

        .items-table th {
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          font-size: 0.85rem;
          color: #a0aec0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .items-table td {
          padding: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .item-select,
        .item-input {
          width: 100%;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          font-size: 0.9rem;
        }

        .item-select option,
        .item-input option {
          background: #1a1a2e;
        }

        .item-total {
          font-weight: 700;
          color: #38ef7d;
        }

        .btn-remove-item {
          background: rgba(245, 87, 108, 0.2);
          border: none;
          color: #f5576c;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-remove-item:hover {
          background: rgba(245, 87, 108, 0.3);
          transform: scale(1.1);
        }

        .total-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(56, 239, 125, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(56, 239, 125, 0.2);
          font-size: 1.1rem;
          color: white;
        }

        .total-section strong {
          font-size: 1.5rem;
          color: #38ef7d;
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

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .purchases-table {
            font-size: 0.85rem;
          }

          .purchases-table th,
          .purchases-table td {
            padding: 0.875rem 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
