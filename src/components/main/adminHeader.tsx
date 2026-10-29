// src/components/main/adminHeader.tsx
import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface NavbarProps {
  username?: string;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ username, onLogout }) => {
  const location = useLocation();
  const isAdminFavorites = location.pathname === "/admin" && location.search.includes("favorites=true");
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
                <NavLink to="/admin" end className={({ isActive }) => (isActive && !isAdminFavorites ? "active font-semibold" : "")}>
                  Admin Collection
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin?favorites=true" className={isAdminFavorites ? "active font-semibold text-error" : ""}>
                  Favorites
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/creator" className={({ isActive }) => (isActive ? "active font-semibold" : "")}>
                  Create Template
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/settings" className={({ isActive }) => (isActive ? "active font-semibold" : "")}>
                  Settings
                </NavLink>
              </li>
              <li>
                <Link to="/" className="text-base-content/70">
                  Exit to Public Site
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

          <Link to="/admin" className="flex items-center gap-2 font-bold text-lg sm:text-xl tracking-tight hover:opacity-90 transition-opacity">
            <span className="text-accent font-extrabold">Studio</span>
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
                  `rounded-lg px-3.5 py-1.5 transition-colors ${isActive && !isAdminFavorites ? "bg-base-200 text-primary font-semibold" : "hover:bg-base-200/60"
                  }`
                }
              >
                Collection
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin?favorites=true"
                className={() =>
                  `rounded-lg px-3.5 py-1.5 transition-colors ${isAdminFavorites ? "bg-error/10 text-error font-semibold" : "hover:bg-base-200/60"
                  }`
                }
              >
                Favorites
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/creator"
                className={({ isActive }) =>
                  `rounded-lg px-3.5 py-1.5 transition-colors ${isActive ? "bg-base-200 text-primary font-semibold" : "hover:bg-base-200/60"
                  }`
                }
              >
                Create Template
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/settings"
                className={({ isActive }) =>
                  `rounded-lg px-3.5 py-1.5 transition-colors ${isActive ? "bg-base-200 text-primary font-semibold" : "hover:bg-base-200/60"
                  }`
                }
              >
                Settings
              </NavLink>
            </li>
            <li>
              <Link to="/" className="rounded-lg px-3.5 py-1.5 text-base-content/70 hover:bg-base-200/40 transition-colors">
                Public Home
              </Link>
            </li>
          </ul>
        </div>

        {/* Right side & Theme Toggle */}
        <div className="navbar-end flex items-center gap-2">
          {/* Theme switcher */}
          <ThemeToggle />

          <div className="hidden lg:flex items-center gap-2">
            <div className="badge badge-accent badge-sm py-2 px-3 font-medium text-accent-content">
              Admin: {username || "Superuser"}
            </div>
            <button
              onClick={onLogout}
              className="btn btn-sm btn-ghost btn-square text-base-content/70 hover:text-error btn-press"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
