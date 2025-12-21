"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [ready, setReady] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

    if (!token) {
      router.push("/login");
      return;
    }

    setUsername(localStorage.getItem("username") || "");
    setRole((localStorage.getItem("role") || "").toLowerCase());
    setReady(true);
  }, [router]);

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  if (!ready) return null;

  const logout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <>
      {/* MOBILE HAMBURGER BUTTON */}
      <button
        className="mobile-toggle"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open Menu"
      >
        <i className="bi bi-list"></i>
      </button>

      {/* OVERLAY for mobile */}
      {isMobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}

      <aside className={`sidebar-modern ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* MOBILE CLOSE BUTTON */}
        <button
          className="mobile-close"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Close Menu"
        >
          <i className="bi bi-x"></i>
        </button>

        {/* USER PROFILE SECTION */}
        <div className="sidebar-profile">
          <div className="profile-avatar">
            <div className="avatar-circle">
              <i className="bi bi-person-fill"></i>
            </div>
            <div className="avatar-glow"></div>
          </div>
          <h6 className="profile-username">{username}</h6>
          <span className="profile-role">{role}</span>
        </div>

        {/* NAVIGATION MENU */}
        <nav className="sidebar-nav">
          <ul className="nav-list">
            <SidebarItem
              href="/dashboard"
              label="Dashboard"
              icon="speedometer2"
              isActive={pathname === "/dashboard"}
            />
            <SidebarItem
              href="/products"
              label="Products"
              icon="box-seam"
              isActive={pathname === "/products"}
            />
            <SidebarItem
              href="/categories"
              label="Categories"
              icon="grid"
              isActive={pathname === "/categories"}
            />
            <SidebarItem
              href="/stock"
              label="Stock"
              icon="archive"
              isActive={pathname === "/stock"}
            />
            <SidebarItem
              href="/purchase"
              label="Purchases"
              icon="cart-plus"
              isActive={pathname === "/purchase"}
            />
            <SidebarItem
              href="/expenses"
              label="Expenses"
              icon="cash-stack"
              isActive={pathname === "/expenses"}
            />
            <SidebarItem
              href="/sales"
              label="Sales"
              icon="receipt"
              isActive={pathname === "/sales"}
            />
            <SidebarItem
              href="/profit"
              label="Profit"
              icon="currency-rupee"
              isActive={pathname === "/profit"}
            />
            <SidebarItem
              href="/reports"
              label="Reports"
              icon="file-earmark-text"
              isActive={pathname === "/reports"}
            />
          </ul>

          {/* ADMIN + SUPER ADMIN SECTION */}
          {(role === "admin" || role === "super_admin") && (
            <>
              <div className="nav-divider">
                <span className="divider-text">Management</span>
              </div>
              <ul className="nav-list">
                <SidebarItem
                  href="/staff"
                  label="Staff"
                  icon="people"
                  highlight
                  isActive={pathname === "/staff"}
                />
                <SidebarItem
                  href="/admin"
                  label="Admin"
                  icon="shield-check"
                  highlight
                  isActive={pathname === "/admin"}
                />
              </ul>
            </>
          )}

          {/* SUPER ADMIN ONLY SECTION */}
          {role === "super_admin" && (
            <>
              <div className="nav-divider">
                <span className="divider-text">Advanced</span>
              </div>
              <ul className="nav-list">
                <SidebarItem
                  href="/analytics"
                  label="Analytics"
                  icon="bar-chart"
                  highlight
                  isActive={pathname === "/analytics"}
                />
                <SidebarItem
                  href="/settings"
                  label="Settings"
                  icon="gear"
                  highlight
                  isActive={pathname === "/settings"}
                />
              </ul>
            </>
          )}
        </nav>

        {/* LOGOUT BUTTON */}
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={logout}>
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        </div>

        <style jsx>{`
          .sidebar-modern {
            width: 260px;
            height: 100vh;
            background: linear-gradient(180deg, #1a1a2e 0%, #0f0f23 100%);
            display: flex;
            color: white;
            flex-direction: column;
            position: sticky;
            top: 0;
            border-right: 1px solid rgba(102, 126, 234, 0.2);
            box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
            overflow-y: auto;
            overflow-x: hidden;
            z-index: 1000;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          /* MOBILE TOGGLE BUTTON */
          .mobile-toggle {
            display: none;
            position: fixed;
            top: 15px;
            left: 15px;
            z-index: 999;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border: none;
            color: white;
            width: 45px;
            height: 45px;
            border-radius: 12px;
            font-size: 1.5rem;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            align-items: center;
            justify-content: center;
          }

          .mobile-close {
            display: none;
            position: absolute;
            top: 15px;
            right: 15px;
            background: transparent;
            border: none;
            color: rgba(255, 255, 255, 0.5);
            font-size: 1.75rem;
            padding: 0.5rem;
            cursor: pointer;
            z-index: 1001;
          }

          .sidebar-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            z-index: 998;
          }

          /* PROFILE SECTION */
          .sidebar-profile {
            padding: 2.5rem 1.5rem 2rem 1.5rem;
            text-align: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            position: relative;
            background: rgba(255, 255, 255, 0.02);
          }

          .profile-avatar {
            position: relative;
            display: inline-block;
            margin-bottom: 1rem;
          }

          .avatar-circle {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea, #764ba2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            color: white;
            position: relative;
            z-index: 2;
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
            animation: float 3s ease-in-out infinite;
          }

          .avatar-circle:hover {
            transform: scale(1.1);
            box-shadow: 0 12px 30px rgba(102, 126, 234, 0.6);
          }

          .avatar-glow {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90px;
            height: 90px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(102, 126, 234, 0.4), transparent);
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }

          .profile-username {
            font-size: 1.1rem;
            font-weight: 700;
            color: white;
            margin: 0 0 0.25rem 0;
            letter-spacing: 0.5px;
          }

          .profile-role {
            font-size: 0.75rem;
            font-weight: 600;
            color: white;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 0.25rem 0.75rem;
            background: rgba(102, 126, 234, 0.2);
            border-radius: 12px;
            display: inline-block;
          }

          /* NAVIGATION */
          .sidebar-nav {
            flex: 1;
            padding: 1.5rem 0;
            overflow-y: auto;
          }

          .nav-list {
            list-style: none;
            padding: 0;
            margin: 0 0.75rem;
          }

          .nav-divider {
            margin: 1.5rem 1.5rem 1rem 1.5rem;
            position: relative;
            text-align: center;
          }

          .divider-text {
            font-size: 0.7rem;
            font-weight: 700;
            color: white;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            background: #1a1a2e;
            padding: 0 1rem;
            position: relative;
            z-index: 1;
          }

          .nav-divider::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), transparent);
          }

          /* FOOTER */
          .sidebar-footer {
            padding: 1.5rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(0, 0, 0, 0.2);
          }

          .btn-logout {
            width: 100%;
            padding: 0.875rem;
            background: linear-gradient(135deg, #fa709a, #fee140);
            border: none;
            border-radius: 12px;
            color: white;
            font-weight: 700;
            font-size: 0.95rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(250, 112, 154, 0.3);
            position: relative;
            overflow: hidden;
          }

          .btn-logout:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(250, 112, 154, 0.5);
          }

          /* RESPONSIVE */
          @media (max-width: 1024px) {
            .mobile-toggle {
              display: flex;
            }

            .sidebar-modern {
              position: fixed;
              left: 0;
              top: 0;
              bottom: 0;
              transform: translateX(-100%);
              transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .sidebar-modern.mobile-open {
              transform: translateX(0);
            }

            .sidebar-overlay {
              display: block;
            }

            .mobile-close {
              display: block;
            }
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </aside>
    </>
  );
}

/* 🔹 Sidebar Menu Item Component */
function SidebarItem({
  href,
  label,
  icon,
  highlight = false,
  isActive = false,
}: {
  href: string;
  label: string;
  icon: string;
  highlight?: boolean;
  isActive?: boolean;
}) {
  return (
    <li className="nav-item">
      <Link href={href} className={`nav-link ${isActive ? 'active' : ''} ${highlight ? 'highlight' : ''}`}>
        <i className={`bi bi-${icon} nav-icon`}></i>
        <span className="nav-label">{label}</span>
        {isActive && <div className="active-indicator"></div>}
      </Link>

      <style jsx>{`
        .nav-item {
          margin-bottom: 0.5rem;
          position: relative;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          padding: 0.875rem 1rem;
          border-radius: 12px;
          color: white;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          background: transparent;
        }

        .nav-link:hover {
          background: rgba(102, 126, 234, 0.1);
          color: white;
          transform: translateX(4px);
        }

        .nav-link.active {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .nav-link.highlight {
          color: #f5a623;
        }

        .nav-link.highlight:hover {
          color: #ffd700;
          background: rgba(245, 166, 35, 0.1);
        }

        .nav-icon {
          font-size: 1.25rem;
          transition: all 0.3s ease;
          min-width: 24px;
        }

        .nav-label {
          flex: 1;
          white-space: nowrap;
        }

        .active-indicator {
          position: absolute;
          right: 0.5rem;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          box-shadow: 0 0 10px rgba(102, 126, 234, 0.8);
        }
      `}</style>
    </li>
  );
}
