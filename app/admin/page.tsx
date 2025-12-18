"use client";

import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";

export default function AdminPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

  /* ---------------- FETCH ADMINS ---------------- */
  const fetchAdmins = async () => {
    setLoading(true);
    const res = await fetch("https://mythra-shop-dev.onrender.com/admin/list", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setAdmins(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  /* ---------------- CREATE / UPDATE ---------------- */
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const url = editId
      ? `https://mythra-shop-dev.onrender.com/admin/update/${editId}`
      : "https://mythra-shop-dev.onrender.com/admin/create";

    const method = editId ? "PUT" : "POST";

    const body: any = { username, email };
    if (!editId) body.password = password;
    if (editId && password) body.password = password;

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    resetForm();
    fetchAdmins();
  };

  /* ---------------- DELETE ---------------- */
  const deleteAdmin = async (id: string) => {
    if (!confirm("Delete this admin?")) return;

    await fetch(`https://mythra-shop-dev.onrender.com/admin/delete/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchAdmins();
  };

  /* ---------------- EDIT ---------------- */
  const editAdmin = (a: any) => {
    setEditId(a._id);
    setUsername(a.username);
    setEmail(a.email);
    setPassword("");
    setShowForm(true);
  };

  const resetForm = () => {
    setEditId(null);
    setUsername("");
    setEmail("");
    setPassword("");
    setShowForm(false);
  };

  return (
    <div className="admin-container">
      <PageHeader
        title="Admin Management"
        subtitle="Manage administrator accounts and privileges"
        icon="shield-fill-check"
      >
        <button className="btn-add-admin" onClick={() => setShowForm(true)}>
          <i className="bi bi-plus-circle"></i>
          <span>Add Admin</span>
        </button>
      </PageHeader>

      {/* ADMIN TABLE */}
      <div className="admin-card">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading admins...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-shield-x"></i>
            <h4>No Administrators</h4>
            <p>Add your first administrator to get started</p>
            <button className="btn-add-admin" onClick={() => setShowForm(true)}>
              <i className="bi bi-plus-circle"></i>
              Add First Admin
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Administrator</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((a, i) => (
                  <tr key={a._id}>
                    <td className="row-number">{i + 1}</td>
                    <td className="admin-name">
                      <div className="avatar">
                        <i className="bi bi-shield-fill-check"></i>
                      </div>
                      <span>{a.username}</span>
                    </td>
                    <td className="email">
                      <i className="bi bi-envelope"></i>
                      {a.email}
                    </td>
                    <td>
                      <span className="role-badge">
                        <i className="bi bi-star-fill"></i>
                        Administrator
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn-edit"
                        onClick={() => editAdmin(a)}
                        title="Edit Admin"
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => deleteAdmin(a._id)}
                        title="Delete Admin"
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
        title={editId ? "Update Administrator" : "Add New Administrator"}
      >
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label className="form-label">
              <i className="bi bi-person"></i>
              Username
            </label>
            <input
              className="form-input"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <i className="bi bi-envelope"></i>
              Email Address
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <i className="bi bi-lock"></i>
              Password {editId && "(Leave blank to keep current)"}
            </label>
            <input
              type="password"
              className="form-input"
              placeholder={editId ? "Enter new password (optional)" : "Enter password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!editId}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              <i className="bi bi-check-circle"></i>
              {editId ? "Update Admin" : "Add Admin"}
            </button>
            <button type="button" className="btn-cancel" onClick={resetForm}>
              <i className="bi bi-x-circle"></i>
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <style jsx>{`
        .admin-container {
          padding: 0.5rem;
          animation: fadeIn 0.5s ease-in-out;
        }

        /* BUTTON */
        .btn-add-admin {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, #f5a623, #ffd700);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(245, 166, 35, 0.4);
        }

        .btn-add-admin:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(245, 166, 35, 0.6);
        }

        /* ADMIN CARD */
        .admin-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
        }

        .admin-table thead {
          background: linear-gradient(135deg, rgba(245, 166, 35, 0.2), rgba(255, 215, 0, 0.2));
        }

        .admin-table th {
          padding: 1.25rem 1rem;
          text-align: left;
          font-weight: 700;
          font-size: 0.85rem;
          color: #a0aec0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .admin-table tbody tr {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
        }

        .admin-table tbody tr:hover {
          background: rgba(245, 166, 35, 0.1);
        }

        .admin-table td {
          padding: 1.25rem 1rem;
          color: white;
        }

        .row-number {
          color: #718096;
          font-weight: 600;
        }

        .admin-name {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          font-weight: 600;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f5a623, #ffd700);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          color: white;
        }

        .email {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #a0aec0;
        }

        .email i {
          color: #f5a623;
        }

        .role-badge {
          padding: 0.5rem 0.875rem;
          background: rgba(245, 166, 35, 0.2);
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #f5a623;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
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

        /* FORM */
        .admin-form {
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

        .form-input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(245, 166, 35, 0.5);
          box-shadow: 0 0 0 3px rgba(245, 166, 35, 0.1);
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
          background: linear-gradient(135deg, #f5a623, #ffd700);
          color: white;
          box-shadow: 0 4px 15px rgba(245, 166, 35, 0.3);
        }

        .btn-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(245, 166, 35, 0.5);
        }

        .btn-cancel {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #a0aec0;
        }

        .btn-cancel:hover {
          background: rgba(245, 87, 108, 0.1);
          border-color: rgba(245, 87, 108, 0.3);
          color: #f5576c;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 768px) {
          .admin-table {
            font-size: 0.85rem;
          }

          .admin-table th,
          .admin-table td {
            padding: 0.875rem 0.5rem;
          }

          .avatar {
            width: 32px;
            height: 32px;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
