"use client";

import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("profile");
    const [loading, setLoading] = useState(false);

    // Profile State
    const [profile, setProfile] = useState({
        username: "",
        role: "",
        email: ""
    });

    // Password State
    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: ""
    });

    // AI Stats State
    const [aiStats, setAiStats] = useState<any>(null);
    const [suggestions, setSuggestions] = useState<any[]>([]);

    // App Settings
    const [settings, setSettings] = useState({
        compactMode: false,
        animations: true,
        notifications: true
    });

    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

    useEffect(() => {
        if (!token) {
            router.push("/login");
            return;
        }

        // Load basic profile from local storage
        setProfile({
            username: localStorage.getItem("username") || "",
            role: localStorage.getItem("role") || "",
            email: "user@example.com" // Placeholder until we fetch real email
        });

        // Load settings from local storage
        const storedSettings = localStorage.getItem("app_settings");
        if (storedSettings) {
            setSettings(JSON.parse(storedSettings));
        }

        fetchAiStats();
        fetchSuggestions();
    }, [token, router]);

    const fetchAiStats = async () => {
        try {
            const res = await fetch("https://mythra-shop-dev.onrender.com/ai-suggestions/stats", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAiStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch AI stats", error);
        }
    };

    const fetchSuggestions = async () => {
        try {
            const res = await fetch("https://mythra-shop-dev.onrender.com/ai-suggestions/today", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSuggestions(data.suggestions || []);
            }
        } catch (error) {
            console.error("Failed to fetch suggestions", error);
        }
    };

    const generateAiInsights = async () => {
        setLoading(true);
        try {
            const res = await fetch("https://mythra-shop-dev.onrender.com/ai-suggestions/generate", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json()
            alert(data.message || "Insights generated!");
            fetchAiStats();
            fetchSuggestions();
        } catch (error) {
            alert("Failed to generate insights");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            alert("New passwords do not match");
            return;
        }
        // Logic to call API would go here
        alert("Password update feature coming soon (API pending)");
        setPasswords({ current: "", new: "", confirm: "" });
    };

    const toggleSetting = (key: keyof typeof settings) => {
        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings);
        localStorage.setItem("app_settings", JSON.stringify(newSettings));

        // Apply effects immediately where possible
        if (key === 'compactMode') {
            document.body.classList.toggle('compact-mode', newSettings.compactMode);
        }
    };

    const logout = () => {
        localStorage.clear();
        router.push("/login");
    };

    return (
        <div className="settings-container">
            <PageHeader
                title="Settings"
                subtitle="Manage your profile, preferences, and system configurations"
                icon="gear-fill"
            />

            <div className="settings-layout">
                {/* SIDEBAR TABS */}
                <div className="settings-sidebar">
                    <button
                        className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <i className="bi bi-person-circle"></i>
                        Profile & Security
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
                        onClick={() => setActiveTab('appearance')}
                    >
                        <i className="bi bi-palette"></i>
                        Appearance
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
                        onClick={() => setActiveTab('ai')}
                    >
                        <i className="bi bi-robot"></i>
                        AI Configuration
                    </button>
                    <div className="divider"></div>
                    <button className="tab-btn danger" onClick={logout}>
                        <i className="bi bi-box-arrow-right"></i>
                        Logout
                    </button>
                </div>

                {/* CONTENT AREA */}
                <div className="settings-content">

                    {/* PROFILE & SECURITY TAB */}
                    {activeTab === 'profile' && (
                        <div className="tab-content fade-in">
                            <div className="section-card">
                                <h3>Profile Information</h3>
                                <div className="profile-header">
                                    <div className="profile-avatar">
                                        <i className="bi bi-person-fill"></i>
                                    </div>
                                    <div className="profile-info">
                                        <h4>{profile.username}</h4>
                                        <span className="role-badge">{profile.role}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="section-card">
                                <h3>Change Password</h3>
                                <form onSubmit={handlePasswordChange} className="password-form">
                                    <div className="form-group">
                                        <label>Current Password</label>
                                        <input
                                            type="password"
                                            value={passwords.current}
                                            onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>New Password</label>
                                        <input
                                            type="password"
                                            value={passwords.new}
                                            onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Confirm Password</label>
                                        <input
                                            type="password"
                                            value={passwords.confirm}
                                            onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn-primary">Update Password</button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* APPEARANCE TAB */}
                    {activeTab === 'appearance' && (
                        <div className="tab-content fade-in">
                            <div className="section-card">
                                <h3>Interface Preferences</h3>

                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>Compact Mode</h4>
                                        <p>Reduce whitespace in tables and lists for higher information density.</p>
                                    </div>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.compactMode}
                                            onChange={() => toggleSetting('compactMode')}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>

                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>UI Animations</h4>
                                        <p>Enable smooth transitions and effects across the application.</p>
                                    </div>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.animations}
                                            onChange={() => toggleSetting('animations')}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>

                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>Notifications</h4>
                                        <p>Show toast notifications for success/error messages.</p>
                                    </div>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.notifications}
                                            onChange={() => toggleSetting('notifications')}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AI CONFIGURATION TAB */}
                    {activeTab === 'ai' && (
                        <div className="tab-content fade-in">
                            <div className="section-card">
                                <div className="card-header-actions">
                                    <h3>AI Business Insights</h3>
                                    <button
                                        className="btn-accent"
                                        onClick={generateAiInsights}
                                        disabled={loading}
                                    >
                                        {loading ? <span className="spinner-small"></span> : <i className="bi bi-stars"></i>}
                                        Generate New Insights
                                    </button>
                                </div>
                                <p className="description-text">
                                    Manually trigger the AI engine to analyze your latest sales, stock, and expense data to generate actionable business suggestions.
                                </p>

                                {aiStats && (
                                    <div className="ai-stats-grid">
                                        <div className="stat-box">
                                            <span className="stat-label">Total Suggestions</span>
                                            <span className="stat-value">{aiStats.total || 0}</span>
                                        </div>
                                        <div className="stat-box">
                                            <span className="stat-label">New</span>
                                            <span className="stat-value text-primary">{aiStats.by_status?.new || 0}</span>
                                        </div>
                                        <div className="stat-box">
                                            <span className="stat-label">Implemented</span>
                                            <span className="stat-value text-success">{aiStats.by_status?.implemented || 0}</span>
                                        </div>
                                        <div className="stat-box">
                                            <span className="stat-label">Critical Priority</span>
                                            <span className="stat-value text-danger">{aiStats.by_priority?.critical || 0}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* SUGGESTIONS LIST */}
                            <div className="section-card">
                                <h3>Recent Explanations & Suggestions</h3>
                                {/* Assuming 'suggestions' is passed from parent or fetched here. For this implementation I will fetch them. */}
                                {suggestions.length === 0 ? (
                                    <div className="empty-suggestions">
                                        <i className="bi bi-lightbulb-off"></i>
                                        <p>No suggestions generated for today. Click "Generate New Insights" to start.</p>
                                    </div>
                                ) : (
                                    <div className="suggestions-list">
                                        {suggestions.map((s: any) => (
                                            <div key={s._id} className={`suggestion-card priority-${s.priority.toLowerCase()}`}>
                                                <div className="suggestion-header">
                                                    <span className={`badge badge-${s.priority.toLowerCase()}`}>{s.priority}</span>
                                                    <h4>{s.title}</h4>
                                                    <span className="suggestion-date">
                                                        {new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="suggestion-desc">{s.description}</p>
                                                {s.data_insights && Object.keys(s.data_insights).length > 0 && (
                                                    <div className="data-insights">
                                                        <strong>Data Insight:</strong>
                                                        <ul>
                                                            {Object.entries(s.data_insights).map(([key, val]: any) => (
                                                                <li key={key}>
                                                                    <strong>{key.replace(/_/g, ' ')}:</strong>{' '}
                                                                    {typeof val === 'object' && val !== null
                                                                        ? (val.name ? `${val.name} (Qty: ${val.qty})` : JSON.stringify(val))
                                                                        : val}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            <style jsx>{`
        .settings-container {
          padding: 0.5rem;
          color: white;
        }

        .settings-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 2rem;
          margin-top: 1rem;
        }

        /* SIDEBAR */
        .settings-sidebar {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          height: fit-content;
        }

        .tab-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: transparent;
          border: none;
          color: #a0aec0;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          border-radius: 12px;
          transition: all 0.3s ease;
          margin-bottom: 0.5rem;
        }

        .tab-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .tab-btn.active {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.1);
          border: 1px solid rgba(102, 126, 234, 0.2);
        }

        .tab-btn i {
          font-size: 1.2rem;
        }

        .tab-btn.danger {
          color: #f5576c;
        }
        .tab-btn.danger:hover {
          background: rgba(245, 87, 108, 0.1);
        }

        .divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 1rem 0;
        }

        /* CONTENT */
        .section-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 2rem;
        }

        .section-card h3 {
          margin-top: 0;
          margin-bottom: 1.5rem;
          font-size: 1.25rem;
          font-weight: 700;
        }

        /* PROFILE */
        .profile-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .profile-avatar {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .profile-info h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
        }

        .role-badge {
          background: rgba(102, 126, 234, 0.2);
          color: #667eea;
          padding: 0.25rem 0.75rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        /* ACTIONS */
        .btn-primary, .btn-accent {
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            border: none;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
            color: white;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea, #764ba2);
        }
        
        .btn-accent {
            background: linear-gradient(135deg, #FF6B6B, #FF8E53);
            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
        }

        .btn-primary:hover, .btn-accent:hover {
            transform: translateY(-2px);
            filter: brightness(1.1);
        }

        /* FORMS */
        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            color: #a0aec0;
            font-size: 0.9rem;
        }

        .form-group input {
            width: 100%;
            padding: 0.875rem;
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: white;
            transition: all 0.3s;
        }

        .form-group input:focus {
            outline: none;
            border-color: #667eea;
            background: rgba(0, 0, 0, 0.3);
        }

        /* SWITCH TOGGLE */
        .setting-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .setting-item:last-child {
            border-bottom: none;
        }

        .setting-info h4 {
            margin: 0 0 0.25rem 0;
            font-size: 1rem;
        }
        .setting-info p {
            margin: 0;
            color: #a0aec0;
            font-size: 0.85rem;
        }

        .switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 26px;
        }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: rgba(255, 255, 255, 0.1);
            transition: .4s;
        }
        .slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
        }
        input:checked + .slider {
            background-color: #667eea;
        }
        input:checked + .slider:before {
            transform: translateX(24px);
        }
        .slider.round { border-radius: 34px; }
        .slider.round:before { border-radius: 50%; }

        /* AI STATS */
        .card-header-actions {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
        }
        .description-text {
            color: #a0aec0;
            margin-bottom: 2rem;
            line-height: 1.6;
        }
        
        .ai-stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
        }

        .stat-box {
            background: rgba(0, 0, 0, 0.2);
            padding: 1.5rem;
            border-radius: 12px;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.05);
        }

        .stat-label {
            display: block;
            font-size: 0.85rem;
            color: #a0aec0;
            margin-bottom: 0.5rem;
        }
        .stat-value {
            font-size: 1.75rem;
            font-weight: 700;
        }

        .text-primary { color: #667eea; }
        .text-success { color: #38ef7d; }
        .text-danger { color: #f5576c; }

        .spinner-small {
            width: 16px;
            height: 16px;
            border: 2px solid white;
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            display: inline-block;
        }
        
        .fade-in {
            animation: fadeIn 0.4s ease-out;
        }
        
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 768px) {
            .settings-layout {
                grid-template-columns: 1fr;
            }
            .settings-sidebar {
                display: flex;
                overflow-x: auto;
                padding: 0.5rem;
            }
            .tab-btn {
                white-space: nowrap;
                width: auto;
                padding: 0.75rem 1rem;
            }
        }

        /* SUGGESTIONS LIST */
        .suggestions-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .suggestion-card {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 12px;
            padding: 1.25rem;
            border-left: 4px solid transparent;
            transition: transform 0.2s;
        }
        .suggestion-card:hover {
            transform: translateX(4px);
            background: rgba(0, 0, 0, 0.3);
        }

        .priority-critical { border-left-color: #f5576c; }
        .priority-high { border-left-color: #f5a623; }
        .priority-medium { border-left-color: #0364e2; }
        .priority-low { border-left-color: #38ef7d; }

        .suggestion-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 0.75rem;
        }
        .suggestion-header h4 {
            margin: 0;
            font-size: 1.1rem;
            font-weight: 600;
            color: white;
            flex: 1;
        }
        .suggestion-date {
            font-size: 0.75rem;
            color: #a0aec0;
        }

        .badge {
            font-size: 0.7rem;
            padding: 0.25rem 0.6rem;
            border-radius: 6px;
            text-transform: uppercase;
            font-weight: 700;
        }
        .badge-critical { background: rgba(245, 87, 108, 0.2); color: #f5576c; }
        .badge-high { background: rgba(245, 166, 35, 0.2); color: #f5a623; }
        .badge-medium { background: rgba(3, 100, 226, 0.2); color: #4facfe; }
        .badge-low { background: rgba(56, 239, 125, 0.2); color: #38ef7d; }

        .suggestion-desc {
            color: #d1d5db;
            margin-bottom: 0.75rem;
            line-height: 1.5;
            font-size: 0.95rem;
        }

        .data-insights {
            background: rgba(255, 255, 255, 0.03);
            padding: 0.75rem;
            border-radius: 8px;
            font-size: 0.85rem;
            color: #a0aec0;
        }
        .data-insights strong { display: block; margin-bottom: 0.25rem; color: #a0aec0; }
        .data-insights ul { margin: 0; padding-left: 1.25rem; }

        .empty-suggestions {
            text-align: center;
            padding: 3rem;
            color: #a0aec0;
        }
        .empty-suggestions i { font-size: 2.5rem; display: block; margin-bottom: 1rem; opacity: 0.5; }
      `}</style>
        </div>
    );
}
