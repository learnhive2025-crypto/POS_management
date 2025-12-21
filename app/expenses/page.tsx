"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Expense {
    _id: string;
    date: string;
    category: string;
    amount: number;
    description: string;
}

export default function ExpensesPage() {
    const router = useRouter();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [editId, setEditId] = useState<string | null>(null);
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

    const fetchJson = async (url: string, options: any = {}) => {
        const token = localStorage.getItem("access_token");
        const headers = {
            Authorization: `Bearer ${token}`,
            ...options.headers,
        };

        const res = await fetch(url, { ...options, headers });

        if (res.status === 401) {
            localStorage.clear();
            router.push("/login");
            throw new Error("Unauthorized");
        }

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.detail || body.message || `API Error: ${res.status}`);
        }

        return res.json();
    };

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const data = await fetchJson("https://mythra-shop-dev.onrender.com/expenses/list");
            setExpenses(data);
            setError(null);
        } catch (err: any) {
            if (err.message !== "Unauthorized") {
                setError("Failed to load expenses. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const resetForm = () => {
        setEditId(null);
        setCategory("");
        setAmount("");
        setDescription("");
        setDate(new Date().toISOString().split("T")[0]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!category || !amount) {
            alert("Please fill in Category and Amount");
            return;
        }

        const payload = {
            category,
            amount: parseFloat(amount),
            description,
            date,
        };

        const url = editId
            ? `https://mythra-shop-dev.onrender.com/expenses/update/${editId}`
            : "https://mythra-shop-dev.onrender.com/expenses/add";

        try {
            await fetchJson(url, {
                method: editId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            resetForm();
            fetchExpenses();
        } catch (err: any) {
            if (err.message !== "Unauthorized") {
                alert(err.message);
            }
        }
    };

    const handleEdit = (exp: Expense) => {
        setEditId(exp._id);
        setCategory(exp.category);
        setAmount(exp.amount.toString());
        setDescription(exp.description);
        setDate(exp.date);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this expense?")) return;

        try {
            await fetchJson(`https://mythra-shop-dev.onrender.com/expenses/delete/${id}`, {
                method: "DELETE",
            });
            fetchExpenses();
        } catch (err: any) {
            if (err.message !== "Unauthorized") {
                alert(err.message);
            }
        }
    };

    if (loading && expenses.length === 0) {
        return (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading expenses...</p>
                <style jsx>{`
          .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; color: #667eea; }
          .spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
            </div>
        );
    }

    return (
        <div className="expenses-container">
            <div className="header-section">
                <h1>Expense Management</h1>
                <p>Track and manage your business expenditures</p>
            </div>

            <div className="content-grid">
                {/* FORM CARD */}
                <div className="card form-card">
                    <h3>{editId ? "Update Expense" : "Add New Expense"}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Date</label>
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Category *</label>
                            <input
                                type="text"
                                placeholder="e.g. Rent, Electricity, Salaries"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Amount (₹) *</label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                placeholder="Additional notes..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-save">
                                {editId ? "Update Expense" : "Save Expense"}
                            </button>
                            {editId && (
                                <button type="button" className="btn-cancel" onClick={resetForm}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* LIST CARD */}
                <div className="card list-card">
                    <div className="list-header">
                        <h3>Recent Expenses</h3>
                        <button className="btn-refresh" onClick={fetchExpenses}>
                            <i className="bi bi-arrow-clockwise"></i>
                        </button>
                    </div>

                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Category</th>
                                    <th>Description</th>
                                    <th>Amount</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="empty-msg">No expenses found</td>
                                    </tr>
                                ) : (
                                    expenses.map((exp) => (
                                        <tr key={exp._id}>
                                            <td>{exp.date}</td>
                                            <td><span className="badge-category">{exp.category}</span></td>
                                            <td className="desc-text">{exp.description || "-"}</td>
                                            <td className="amount-text">₹ {exp.amount.toFixed(2)}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button className="btn-edit" onClick={() => handleEdit(exp)}>
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button className="btn-delete" onClick={() => handleDelete(exp._id)}>
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .expenses-container {
          padding: 1rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .header-section {
          margin-bottom: 2rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          padding: 2rem;
          border-radius: 16px;
          color: white;
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }
        .header-section h1 { margin: 0; font-weight: 800; font-size: 2rem; }
        .header-section p { margin: 0.5rem 0 0 0; opacity: 0.9; }

        .content-grid {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 2rem;
          align-items: start;
        }

        .card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          border: 1px solid #edf2f7;
        }
        .card h3 { margin-top: 0; color: #2d3748; font-weight: 700; border-bottom: 2px solid #f7fafc; padding-bottom: 1rem; margin-bottom: 1.5rem; }

        .form-group { margin-bottom: 1.25rem; }
        .form-group label { display: block; font-size: 0.875rem; font-weight: 600; color: #4a5568; margin-bottom: 0.5rem; }
        .form-group input, .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #2a63adff;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.2s;
        }
        .form-group input:focus, .form-group textarea:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,0.1); }
        .form-group textarea { height: 80px; resize: none; }

        .form-actions { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1.5rem; }
        .btn-save { background: #667eea; color: white; border: none; padding: 0.875rem; border-radius: 8px; font-weight: 700; cursor: pointer; transition: background 0.2s; }
        .btn-save:hover { background: #5a67d8; }
        .btn-cancel { background: #edf2f7; color: #4a5568; border: none; padding: 0.875rem; border-radius: 8px; font-weight: 700; cursor: pointer; }

        .list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .btn-refresh { background: none; border: none; font-size: 1.25rem; color: #667eea; cursor: pointer; padding: 0.5rem; border-radius: 50%; transition: background 0.2s; }
        .btn-refresh:hover { background: #f7fafc; }

        .table-wrapper { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 1rem; background: #f8fafc; color: #718096; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #edf2f7; }
        td { padding: 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.95rem; color: #2d3748; }
        
        .badge-category { background: #ebf4ff; color: #44337a; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; font-weight: 700; }
        .desc-text { color: #718096; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .amount-text { font-weight: 800; color: #2d3748; }
        
        .action-buttons { display: flex; gap: 0.5rem; }
        .btn-edit, .btn-delete { width: 32px; height: 32px; border-radius: 6px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
        .btn-edit { background: #fefcbf; color: #b7791f; }
        .btn-edit:hover { background: #faf089; }
        .btn-delete { background: #fed7d7; color: #c53030; }
        .btn-delete:hover { background: #feb2b2; }

        .empty-msg { text-align: center; color: #a0aec0; padding: 3rem !important; }

        @media (max-width: 1024px) {
          .content-grid { grid-template-columns: 1fr; }
          .header-section { padding: 1.5rem; margin-top: 2rem; }
        }
      `}</style>
        </div>
    );
}
