"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import PageHeader from "../components/PageHeader";

/* ---------------- TYPES ---------------- */
type SaleItem = {
  barcode: string;
  qty: number;
  price: number;
  name: string;
};

/* ---------------- BEEP ---------------- */
const beep = () => {
  const audio = new Audio("/beep.mp3");
  audio.play();
};

export default function SalesPage() {
  const [billNo, setBillNo] = useState(`BILL-${Date.now()}`);
  const [barcode, setBarcode] = useState("");
  const [items, setItems] = useState<SaleItem[]>([]);
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [total, setTotal] = useState(0);
  const [showScanner, setShowScanner] = useState(false);
  const [flash, setFlash] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token") || ""
      : "";

  /* ---------------- FLASH ---------------- */
  const flashSuccess = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
  };

  /* ---------------- FETCH PRODUCT ---------------- */
  const fetchProduct = async (code: string) => {
    const res = await fetch(
      `https://mythra-shop-dev.onrender.com/products/by-barcode/${code}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      alert("Product not found");
      return;
    }

    const product = await res.json();

    setItems((prev) => {
      const exists = prev.find((i) => i.barcode === code);
      if (exists) {
        return prev.map((i) =>
          i.barcode === code ? { ...i, qty: i.qty + 1 } : i
        );
      }

      return [
        ...prev,
        {
          barcode: code,
          qty: 1,
          price: product.selling_price,
          name: product.name,
        },
      ];
    });
  };

  /* ---------------- ADD BARCODE ---------------- */
  const addBarcode = async () => {
    if (!barcode) return;
    await fetchProduct(barcode);
    setBarcode("");
  };

  /* ---------------- QTY ---------------- */
  const updateQty = (index: number, qty: number) => {
    const copy = [...items];
    copy[index].qty = qty;
    setItems(copy);
  };

  const removeItem = (index: number) => {
    const copy = [...items];
    copy.splice(index, 1);
    setItems(copy);
  };

  /* ---------------- TOTAL ---------------- */
  useEffect(() => {
    setTotal(items.reduce((sum, i) => sum + i.qty * i.price, 0));
  }, [items]);

  /* ---------------- COMPLETE SALE ---------------- */
  const completeSale = async () => {
    if (items.length === 0) {
      alert("No items added");
      return;
    }

    await fetch("https://mythra-shop-dev.onrender.com/sales/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        bill_no: billNo,
        payment_mode: paymentMode,
        items: items.map((i) => ({
          barcode: i.barcode,
          qty: i.qty,
        })),
      }),
    });

    printInvoice();
    alert("Sale completed successfully!");

    setItems([]);
    setBillNo(`BILL-${Date.now()}`);
  };

  /* ---------------- THERMAL PRINT ---------------- */
  const printInvoice = () => {
    const win = window.open("", "", "width=300,height=600");
    if (!win) return;

    win.document.write(`
    <html>
    <head>
      <style>
        body {
          font-family: monospace;
          font-size: 12px;
          width: 280px;
        }
        h3, p {
          text-align: center;
          margin: 4px 0;
        }
        .line {
          border-top: 1px dashed #000;
          margin: 5px 0;
        }
        .right {
          text-align: right;
        }
      </style>
    </head>
    <body>
      <h3>MY POS SHOP</h3>
      <p>Bill: ${billNo}</p>
      <p>${new Date().toLocaleString()}</p>

      <div class="line"></div>

      ${items
        .map(
          (i) => `
        <p>${i.name}</p>
        <p>${i.qty} x ₹${i.price} = ₹${i.qty * i.price}</p>
        `
        )
        .join("")}

      <div class="line"></div>

      <p class="right"><b>Total: ₹${total}</b></p>
      <p class="right">Payment: ${paymentMode}</p>

      <div class="line"></div>
      <p>Thank You! Visit Again 🙏</p>
    </body>
    </html>
    `);

    win.print();
  };

  /* ---------------- CAMERA SCANNER ---------------- */
  useEffect(() => {
    if (!showScanner || !videoRef.current) return;

    const reader = new BrowserMultiFormatReader();

    reader
      .decodeOnceFromVideoDevice(undefined, videoRef.current)
      .then((result) => {
        beep();
        flashSuccess();
        fetchProduct(result.getText());
        setShowScanner(false);
      })
      .catch((err) => {
        console.error("Scan error:", err);
        setShowScanner(false);
      });
  }, [showScanner]);

  return (
    <div className="sales-container">
      {/* GREEN FLASH */}
      {flash && <div className="flash-overlay" />}

      <PageHeader
        title="Sales / Billing"
        subtitle={`Bill: ${billNo}`}
        icon="receipt-cutoff"
      />

      {/* INPUT BAR */}
      <div className="input-card">
        <div className="input-grid">
          <div className="barcode-input-group">
            <i className="bi bi-upc-scan input-icon"></i>
            <input
              className="barcode-input"
              placeholder="Scan or enter barcode..."
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addBarcode()}
              autoFocus
            />
          </div>

          <button className="btn-add" onClick={addBarcode}>
            <i className="bi bi-plus-circle"></i>
            Add
          </button>

          <button className="btn-scan" onClick={() => setShowScanner(true)}>
            <i className="bi bi-camera-fill"></i>
            Scan
          </button>

          <div className="payment-select-group">
            <i className="bi bi-wallet2 input-icon"></i>
            <select
              className="payment-select"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
            >
              <option value="CASH">💵 Cash</option>
              <option value="UPI">📱 UPI</option>
              <option value="CARD">💳 Card</option>
            </select>
          </div>
        </div>
      </div>

      {/* CAMERA MODAL */}
      {showScanner && (
        <div className="scanner-modal">
          <div className="scanner-content">
            <video ref={videoRef} className="scanner-video" />
            <button
              className="scanner-close"
              onClick={() => setShowScanner(false)}
            >
              <i className="bi bi-x-lg"></i>
              Close Scanner
            </button>
          </div>
        </div>
      )}

      {/* ITEMS CART */}
      <div className="cart-card">
        {items.length === 0 ? (
          <div className="empty-cart">
            <i className="bi bi-cart-x"></i>
            <h4>Your cart is empty</h4>
            <p>Scan products to add them to the cart</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item, idx) => (
                <div key={idx} className="cart-item">
                  <div className="item-info">
                    <div className="item-header">
                      <h5 className="item-name">{item.name}</h5>
                      <button
                        className="btn-remove"
                        onClick={() => removeItem(idx)}
                        title="Remove item"
                      >
                        <i className="bi bi-x-circle-fill"></i>
                      </button>
                    </div>
                    <div className="item-details">
                      <span className="item-barcode">
                        <i className="bi bi-upc"></i>
                        {item.barcode}
                      </span>
                      <span className="item-price">₹{item.price}</span>
                    </div>
                  </div>
                  <div className="item-controls">
                    <button
                      className="qty-btn"
                      onClick={() => updateQty(idx, Math.max(1, item.qty - 1))}
                    >
                      <i className="bi bi-dash"></i>
                    </button>
                    <input
                      type="number"
                      className="qty-input"
                      value={item.qty}
                      onChange={(e) =>
                        updateQty(idx, Math.max(1, Number(e.target.value)))
                      }
                      min={1}
                    />
                    <button
                      className="qty-btn"
                      onClick={() => updateQty(idx, item.qty + 1)}
                    >
                      <i className="bi bi-plus"></i>
                    </button>
                  </div>
                  <div className="item-total">₹{item.qty * item.price}</div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="total-section">
                <span className="total-label">Total Amount:</span>
                <span className="total-value">₹{total.toLocaleString()}</span>
              </div>
              <button className="btn-complete" onClick={completeSale}>
                <i className="bi bi-check-circle-fill"></i>
                Complete Sale
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .sales-container {
          padding: 0.5rem;
          animation: fadeIn 0.5s ease-in-out;
        }

        .flash-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(56, 239, 125, 0.3);
          z-index: 9999;
          pointer-events: none;
          animation: flash 0.3s ease-out;
        }

        @keyframes flash {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }

        /* INPUT CARD */
        .input-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 2rem;
        }

        .input-grid {
          display: grid;
          grid-template-columns: 2fr auto auto 1.5fr;
          gap: 1rem;
        }

        .barcode-input-group,
        .payment-select-group {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          color: #a0aec0;
          font-size: 1.25rem;
          pointer-events: none;
          z-index: 1;
        }

        .barcode-input,
        .payment-select {
          width: 100%;
          padding: 1rem 1rem 1rem 3.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .barcode-input:focus,
        .payment-select:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(102, 126, 234, 0.5);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .payment-select option {
          background: #1a1a2e;
        }

        .btn-add,
        .btn-scan {
          padding: 1rem 1.5rem;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          white-space: nowrap;
        }

        .btn-add {
          background: linear-gradient(135deg, #11998e, #38ef7d);
          color: white;
          box-shadow: 0 4px 15px rgba(56, 239, 125, 0.3);
        }

        .btn-add:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(56, 239, 125, 0.5);
        }

        .btn-scan {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .btn-scan:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
        }

        /* SCANNER MODAL */
        .scanner-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
          animation: fadeIn 0.3s ease-out;
        }

        .scanner-content {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .scanner-video {
          width: 400px;
          height: 300px;
          border-radius: 12px;
          background: black;
        }

        .scanner-close {
          width: 100%;
          margin-top: 1rem;
          padding: 0.875rem;
          background: linear-gradient(135deg, #fa709a, #fee140);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .scanner-close:hover {
          transform: translateY(-2px);
        }

        /* CART CARD */
        .cart-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
          min-height: 400px;
        }

        .empty-cart {
          padding: 6rem 2rem;
          text-align: center;
          color: #718096;
        }

        .empty-cart i {
          font-size: 6rem;
          margin-bottom: 1.5rem;
          opacity: 0.4;
        }

        .empty-cart h4 {
          color: white;
          margin-bottom: 0.5rem;
          font-size: 1.5rem;
        }

        .empty-cart p {
          font-size: 1.05rem;
        }

        /* CART ITEMS */
        .cart-items {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 500px;
          overflow-y: auto;
        }

        .cart-item {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .cart-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(102, 126, 234, 0.3);
        }

        .item-info {
          flex: 1;
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 0.5rem;
        }

        .item-name {
          color: white;
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0;
        }

        .btn-remove {
          background: none;
          border: none;
          color: #f5576c;
          font-size: 1.25rem;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
        }

        .btn-remove:hover {
          transform: scale(1.2);
        }

        .item-details {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .item-barcode {
          color: #a0aec0;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .item-price {
          color: #38ef7d;
          font-weight: 700;
          font-size: 1rem;
        }

        .item-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .qty-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(102, 126, 234, 0.2);
          border: 1px solid rgba(102, 126, 234, 0.3);
          color: #667eea;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1.1rem;
        }

        .qty-btn:hover {
          background: rgba(102, 126, 234, 0.3);
          transform: scale(1.1);
        }

        .qty-input {
          width: 60px;
          padding: 0.5rem;
          text-align: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          font-weight: 700;
          font-size: 1rem;
        }

        .item-total {
          font-size: 1.25rem;
          font-weight: 800;
          color: #38ef7d;
          min-width: 100px;
          text-align: right;
        }

        /* CART FOOTER */
        .cart-footer {
          padding: 2rem 1.5rem;
          background: rgba(0, 0, 0, 0.2);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .total-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding: 1.5rem;
          background: rgba(56, 239, 125, 0.1);
          border-radius: 12px;
          border: 1px solid rgba(56, 239, 125, 0.2);
        }

        .total-label {
          font-size: 1.25rem;
          font-weight: 600;
          color: white;
        }

        .total-value {
          font-size: 2rem;
          font-weight: 800;
          color: #38ef7d;
        }

        .btn-complete {
          width: 100%;
          padding: 1.25rem;
          background: linear-gradient(135deg, #11998e, #38ef7d);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 1.1rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(56, 239, 125, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .btn-complete:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(56, 239, 125, 0.6);
        }

        .btn-complete i {
          font-size: 1.5rem;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 1200px) {
          .input-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .cart-item {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .item-total {
            text-align: left;
          }

          .scanner-video {
            width: 300px;
            height: 225px;
          }
        }
      `}</style>
    </div>
  );
}
