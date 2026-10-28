import React from "react";
import { Link, NavLink } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";

interface HeaderProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  username?: string;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isAuthenticated,
  isAdmin,
  username,
  onLogout,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-base-100/85 backdrop-blur-md border-b border-base-200/80 shadow-xs">
      <nav className="navbar max-w-7xl mx-auto px-4 sm:px-6">
        <div className="navbar-start gap-2">
          {/* Mobile dropdown */}
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-square lg:hidden">
              <Menu className="w-5 h-5" />
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-56 p-2 shadow-xl border border-base-200"
            >
              <li>
                <NavLink to="/" end className={({ isActive }) => (isActive ? "active font-semibold" : "")}>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/settings" className={({ isActive }) => (isActive ? "active font-semibold" : "")}>
                  Settings
                </NavLink>
              </li>
              {isAdmin && (
                <li>
                  <NavLink to="/admin" className={({ isActive }) => (isActive ? "active font-semibold text-accent" : "text-accent")}>
                    Admin Studio
                  </NavLink>
                </li>
              )}
              <div className="divider my-1"></div>
              {isAuthenticated ? (
                <li>
                  <button onClick={onLogout} className="text-error gap-2">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </li>
              ) : (
                <div className="flex flex-col gap-1.5 p-1">
                  <Link to="/login" className="btn btn-sm btn-outline w-full">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-sm btn-primary w-full">
                    Register
                  </Link>
                </div>
              )}
            </ul>
          </div>

          <Link to="/" className="flex items-center gap-2 font-bold text-lg sm:text-xl tracking-tight hover:opacity-90 transition-opacity">
            <span>PostRugPhotos</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-1 text-sm font-medium">
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `rounded-lg px-3.5 py-1.5 transition-colors ${
                    isActive ? "bg-base-200 text-primary font-semibold" : "hover:bg-base-200/60"
                  }`
                }
              >
                Templates
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `rounded-lg px-3.5 py-1.5 transition-colors ${
                    isActive ? "bg-base-200 text-primary font-semibold" : "hover:bg-base-200/60"
                  }`
                }
              >
                Settings
              </NavLink>
            </li>
            {isAdmin && (
              <li>
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `rounded-lg px-3.5 py-1.5 transition-colors text-accent ${
                      isActive ? "bg-accent/10 font-bold" : "hover:bg-accent/10"
                    }`
                  }
                >
                  Admin Studio
                </NavLink>
              </li>
            )}
          </ul>
        </div>

        {/* Right side authentication */}
        <div className="navbar-end hidden lg:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="badge badge-neutral badge-sm py-2 px-3">
                {username || "User"}
              </div>
              <button
                onClick={onLogout}
                className="btn btn-sm btn-ghost btn-square text-base-content/70 hover:text-error"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn btn-sm btn-ghost">
                Login
              </Link>
              <Link to="/register" className="btn btn-sm btn-primary shadow-xs">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
