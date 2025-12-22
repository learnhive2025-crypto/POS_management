"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";

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

    // Filter State
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

    // Unique Categories for Filter
    const uniqueCategories = Array.from(new Set(expenses.map(e => e.category)));

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
        setShowForm(false);
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
            alert(err.message);
        }
    };

    const handleEdit = (exp: Expense) => {
        setEditId(exp._id);
        setCategory(exp.category);
        setAmount(exp.amount.toString());
        setDescription(exp.description);
        setDate(exp.date);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this expense?")) return;

        try {
            await fetchJson(`https://mythra-shop-dev.onrender.com/expenses/delete/${id}`, {
                method: "DELETE",
            });
            fetchExpenses();
        } catch (err: any) {
            alert(err.message);
        }
    };

    // Filter Logic
    const filteredExpenses = expenses.filter(exp => {
        const matchesSearch =
            exp.category.toLowerCase().includes(search.toLowerCase()) ||
            exp.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter ? exp.category === categoryFilter : true;
        return matchesSearch && matchesCategory;
    });

    if (loading && expenses.length === 0) {
        return (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading expenses...</p>
                <style jsx>{`
                    .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; color: #a0aec0; }
                    .spinner { width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.1); border-top: 4px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem; }
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    return (
        <div className="expenses-container">
            <PageHeader
                title="Expense Management"
                subtitle="Track and manage your business expenditures"
                icon="wallet2"
            >
                <div className="header-actions">
                    <button className="btn-add-expense" onClick={() => setShowForm(true)}>
                        <i className="bi bi-plus-circle"></i>
                        <span>Add Expense</span>
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
                            placeholder="Search expenses..."
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
                            {uniqueCategories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
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
                        Clear
                    </button>
                </div>
            </div>

            {/* EXPENSES TABLE */}
            <div className="expenses-card">
                {filteredExpenses.length === 0 ? (
                    <div className="empty-state">
                        <i className="bi bi-inbox"></i>
                        <h4>No Expenses Found</h4>
                        <p>Try adjusting your filters or add a new expense</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="expenses-table">
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
                                {filteredExpenses.map((exp) => (
                                    <tr key={exp._id}>
                                        <td>{exp.date}</td>
                                        <td><span className="badge-category">{exp.category}</span></td>
                                        <td className="desc-cell">{exp.description || "-"}</td>
                                        <td className="amount-cell">₹{exp.amount.toFixed(2)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-edit" onClick={() => handleEdit(exp)}>
                                                    <i className="bi bi-pencil-square"></i>
                                                </button>
                                                <button className="btn-delete" onClick={() => handleDelete(exp._id)}>
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
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
                title={editId ? "Update Expense" : "Add New Expense"}
            >
                <form onSubmit={handleSubmit} className="expense-form">
                    <div className="form-group">
                        <label className="form-label">
                            <i className="bi bi-calendar"></i>
                            Date
                        </label>
                        <input
                            type="date"
                            className="form-input"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">
                            <i className="bi bi-tag"></i>
                            Category *
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Rent, Electricity"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">
                            <i className="bi bi-currency-rupee"></i>
                            Amount (₹) *
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            className="form-input"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">
                            <i className="bi bi-card-text"></i>
                            Description
                        </label>
                        <textarea
                            className="form-input"
                            rows={3}
                            placeholder="Additional notes..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-submit">
                            <i className="bi bi-check-circle"></i>
                            {editId ? "Update Expense" : "Save Expense"}
                        </button>
                        <button type="button" className="btn-cancel" onClick={resetForm}>
                            <i className="bi bi-x-circle"></i>
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            <style jsx>{`
                .expenses-container {
                    padding: 0.5rem;
                    animation: fadeIn 0.5s ease-in-out;
                }

                .header-actions {
                    display: flex;
                    gap: 1rem;
                }

                .btn-add-expense {
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
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                    transition: all 0.3s ease;
                }

                .btn-add-expense:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
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

                .search-box, .select-box {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .search-input, .select-input {
                    width: 100%;
                    padding: 0.875rem 1rem 0.875rem 3rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    color: white;
                    font-size: 0.95rem;
                    transition: all 0.3s ease;
                }

                .search-icon, .select-icon {
                    position: absolute;
                    left: 1rem;
                    color: #a0aec0;
                    pointer-events: none;
                }

                .search-input:focus, .select-input:focus {
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
                }

                .btn-clear:hover {
                    background: rgba(255, 87, 108, 0.1);
                    color: #f5576c;
                    border-color: rgba(255, 87, 108, 0.3);
                }

                /* EXPENSES TABLE */
                .expenses-card {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                }

                .table-responsive { overflow-x: auto; }
                .expenses-table { width: 100%; border-collapse: collapse; }

                .expenses-table thead {
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
                }

                .expenses-table th {
                    padding: 1.25rem 1rem;
                    text-align: left;
                    font-weight: 700;
                    font-size: 0.85rem;
                    color: #a0aec0;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .expenses-table tbody tr {
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    transition: all 0.3s ease;
                }

                .expenses-table tbody tr:hover {
                    background: rgba(102, 126, 234, 0.1);
                }

                .expenses-table td {
                    padding: 1.25rem 1rem;
                    color: white;
                    font-size: 0.95rem;
                }

                .badge-category {
                    padding: 0.375rem 0.875rem;
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #a0aec0;
                    display: inline-block;
                }

                .amount-cell { font-weight: 700; color: #f5576c; }
                .desc-cell { color: #a0aec0; max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

                .action-buttons { display: flex; gap: 0.5rem; }

                .btn-edit, .btn-delete {
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

                .btn-edit { background: rgba(240, 147, 251, 0.2); color: #f093fb; }
                .btn-edit:hover { background: rgba(240, 147, 251, 0.3); transform: scale(1.1); }

                .btn-delete { background: rgba(245, 87, 108, 0.2); color: #f5576c; }
                .btn-delete:hover { background: rgba(245, 87, 108, 0.3); transform: scale(1.1); }

                .empty-state { text-align: center; padding: 4rem; color: #718096; }
                .empty-state i { font-size: 4rem; margin-bottom: 1rem; opacity: 0.5; }
                .empty-state h4 { color: white; margin-bottom: 0.5rem; }

                /* FORM STYLES */
                .expense-form { display: flex; flex-direction: column; gap: 1.5rem; }
                .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .form-label { color: #a0aec0; font-weight: 600; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem; }
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
                    border-color: rgba(102, 126, 234, 0.5); 
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); 
                }
                .form-actions { display: flex; gap: 1rem; margin-top: 1rem; }
                .btn-submit, .btn-cancel { flex: 1; padding: 1rem; border-radius: 12px; border: none; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
                .btn-submit { background: linear-gradient(135deg, #11998e, #38ef7d); color: white; }
                .btn-cancel { background: rgba(255, 255, 255, 0.1); color: white; }
                .btn-cancel:hover { background: rgba(255, 255, 255, 0.15); }

                @media (max-width: 768px) {
                    .filter-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
}
