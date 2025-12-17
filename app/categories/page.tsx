"use client";

import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

  const role =
    typeof window !== "undefined"
      ? (localStorage.getItem("role") || "").toLowerCase()
      : "";

  /* ---------------- FETCH CATEGORIES ---------------- */
  const fetchCategories = async () => {
    setLoading(true);
    const res = await fetch("https://mythra-backend.onrender.com/categories/list", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ---------------- FILTER ---------------- */
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ---------------- ADD / UPDATE ---------------- */
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const url = editId
      ? `https://mythra-backend.onrender.com/categories/update/${editId}`
      : "https://mythra-backend.onrender.com/categories/add";

    const method = editId ? "PUT" : "POST";
    const body: any = editId ? { name, is_active: true } : { name };

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    resetForm();
    fetchCategories();
  };

  /* ---------------- DELETE ---------------- */
  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;

    await fetch(`https://mythra-backend.onrender.com/categories/delete/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchCategories();
  };

  /* ---------------- EDIT ---------------- */
  const editCategory = (c: any) => {
    setEditId(c.id);
    setName(c.name);
    setShowForm(true);
  };

  const resetForm = () => {
    setEditId(null);
    setName("");
    setShowForm(false);
  };

  return (
    <div className="categories-container">
      <PageHeader
        title="Category Management"
        subtitle="Organize products into categories"
        icon="grid-fill"
      >
        <button className="btn-add-category" onClick={() => setShowForm(true)}>
          <i className="bi bi-plus-circle"></i>
          <span>Add Category</span>
        </button>
      </PageHeader>

      {/* SEARCH BAR */}
      <div className="search-card">
        <div className="search-box">
          <i className="bi bi-search search-icon"></i>
          <input
            className="search-input"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* CATEGORIES GRID */}
      <div className="categories-grid">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-folder-x"></i>
            <h4>No Categories Found</h4>
            <p>Create your first category to organize products</p>
            <button className="btn-add-category" onClick={() => setShowForm(true)}>
              <i className="bi bi-plus-circle"></i>
              Add Category
            </button>
          </div>
        ) : (
          <div className="grid-container">
            {filteredCategories.map((category, index) => (
              <div key={category.id} className="category-card">
                <div className="card-icon">
                  <i className="bi bi-grid-3x3-gap-fill"></i>
                </div>
                <h3 className="card-title">{category.name}</h3>
                <div className="card-number">#{index + 1}</div>
                {(role === "admin" || role === "super_admin") && (
                  <div className="card-actions">
                    <button
                      className="btn-edit"
                      onClick={() => editCategory(category)}
                      title="Edit Category"
                    >
                      <i className="bi bi-pencil-fill"></i>
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => deleteCategory(category.id)}
                      title="Delete Category"
                    >
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL FORM */}
      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editId ? "Update Category" : "Add New Category"}
      >
        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-group">
            <label className="form-label">
              <i className="bi bi-tag-fill"></i>
              Category Name
            </label>
            <input
              className="form-input"
              placeholder="Enter category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              <i className="bi bi-check-circle"></i>
              {editId ? "Update Category" : "Add Category"}
            </button>
            <button type="button" className="btn-cancel" onClick={resetForm}>
              <i className="bi bi-x-circle"></i>
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <style jsx>{`
        .categories-container {
          padding: 0.5rem;
          animation: fadeIn 0.5s ease-in-out;
        }

        /* HEADER BUTTON */
        .btn-add-category {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-add-category:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
        }

        .btn-add-category i {
          font-size: 1.25rem;
        }

        /* SEARCH CARD */
        .search-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 2rem;
        }

        .search-box {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          color: #a0aec0;
          font-size: 1.1rem;
          pointer-events: none;
        }

        .search-input {
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

        .search-input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(102, 126, 234, 0.5);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        /* GRID CONTAINER */
        .categories-grid {
          min-height: 400px;
        }

        .grid-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
          animation: slideUp 0.5s ease-out;
        }

        /* CATEGORY CARD */
        .category-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 2rem;
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .category-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .category-card:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(102, 126, 234, 0.3);
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
        }

        .category-card:hover::before {
          transform: scaleX(1);
        }

        .card-icon {
          width: 70px;
          height: 70px;
          border-radius: 16px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: white;
          margin-bottom: 1.5rem;
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
          transition: all 0.3s ease;
        }

        .category-card:hover .card-icon {
          transform: scale(1.1) rotate(-5deg);
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          margin: 0 0 2rem 0;
          word-break: break-word;
        }

        .card-number {
          position: absolute;
          top: 1rem;
          right: 1rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: #718096;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.375rem 0.75rem;
          border-radius: 8px;
        }

        .card-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .btn-edit,
        .btn-delete {
          flex: 1;
          padding: 0.75rem;
          border-radius: 10px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
          font-weight: 600;
        }

        .btn-edit {
          background: rgba(240, 147, 251, 0.2);
          color: #f093fb;
          border: 1px solid rgba(240, 147, 251, 0.3);
        }

        .btn-edit:hover {
          background: rgba(240, 147, 251, 0.3);
          transform: translateY(-2px);
        }

        .btn-delete {
          background: rgba(245, 87, 108, 0.2);
          color: #f5576c;
          border: 1px solid rgba(245, 87, 108, 0.3);
        }

        .btn-delete:hover {
          background: rgba(245, 87, 108, 0.3);
          transform: translateY(-2px);
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
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          border: 1px dashed rgba(255, 255, 255, 0.1);
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
        .category-form {
          display: flex;
          flex-direction: column;
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

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .grid-container {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1rem;
          }

          .category-card {
            padding: 1.5rem;
          }

          .card-icon {
            width: 60px;
            height: 60px;
            font-size: 1.75rem;
          }

          .card-title {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
}
