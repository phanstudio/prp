// src/components/main/adminHeader.tsx
import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Home, ShieldCheck, Plus, Settings, LogOut, Menu } from "lucide-react";

interface NavbarProps {
  username?: string;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ username, onLogout }) => {
  return (
    <header className="sticky top-0 z-40 bg-base-100/85 backdrop-blur-md border-b border-base-200/80 shadow-xs">
      <nav className="navbar max-w-7xl mx-auto px-4 sm:px-6">
        {/* Left side / Brand */}
        <div className="navbar-start gap-2">
          {/* Mobile dropdown */}
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-square lg:hidden">
              <Menu className="w-5 h-5" />
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-50 p-2 shadow-xl bg-base-100 rounded-box w-56 border border-base-200"
            >
              <li>
                <NavLink to="/admin" end className={({ isActive }) => (isActive ? "active font-semibold" : "")}>
                  <ShieldCheck className="w-4 h-4" /> Admin Collection
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/creator" className={({ isActive }) => (isActive ? "active font-semibold" : "")}>
                  <Plus className="w-4 h-4" /> Create Template
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/settings" className={({ isActive }) => (isActive ? "active font-semibold" : "")}>
                  <Settings className="w-4 h-4" /> Settings
                </NavLink>
              </li>
              <li>
                <Link to="/" className="text-base-content/70">
                  <Home className="w-4 h-4" /> Exit to Public Site
                </Link>
              </li>
              <div className="divider my-1"></div>
              <li>
                <button onClick={onLogout} className="text-error gap-2">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </li>
            </ul>
          </div>

          <Link to="/admin" className="flex items-center gap-2 font-bold text-lg sm:text-xl tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-accent text-accent-content flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span>Admin Studio</span>
          </Link>
        </div>

        {/* Center menu */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-1 text-sm font-medium">
            <li>
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 transition-colors ${
                    isActive ? "bg-base-200 text-primary font-semibold" : "hover:bg-base-200/60"
                  }`
                }
              >
                <ShieldCheck className="w-4 h-4" />
                Collection
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/creator"
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 transition-colors ${
                    isActive ? "bg-base-200 text-primary font-semibold" : "hover:bg-base-200/60"
                  }`
                }
              >
                <Plus className="w-4 h-4" />
                Create Template
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/settings"
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 transition-colors ${
                    isActive ? "bg-base-200 text-primary font-semibold" : "hover:bg-base-200/60"
                  }`
                }
              >
                <Settings className="w-4 h-4" />
                Settings
              </NavLink>
            </li>
            <li>
              <Link to="/" className="rounded-lg px-3 py-1.5 text-base-content/60 hover:bg-base-200/40">
                <Home className="w-4 h-4" />
                Public Home
              </Link>
            </li>
          </ul>
        </div>

        {/* Right side */}
        <div className="navbar-end hidden lg:flex items-center gap-3">
          <div className="badge badge-accent badge-sm py-2 px-3 font-medium">
            Admin: {username || "Superuser"}
          </div>
          <button
            onClick={onLogout}
            className="btn btn-sm btn-ghost btn-square text-base-content/70 hover:text-error"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
