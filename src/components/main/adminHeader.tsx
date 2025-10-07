// src/components/Navbar.tsx
import { Link } from "react-router-dom";

interface NavbarProps {
  username?: string;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ username, onLogout }) => {
  return (
    <header className="lg:px-20 navbar bg-base-100 shadow-md">
      {/* Left side */}
      <div className="navbar-start">
        {/* Logo / title */}
        <Link to="/admin" className="text-lg font-bold ml-4">
          Admin Panel
        </Link>
      </div>

      {/* Center (desktop menu) */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
					<li><Link className="text-accent" to="/">Home</Link></li>
					<li><Link to="/admin">Admin Collection</Link></li>
          <li><Link to="/admin/creator">Create Template</Link></li>
        </ul>
      </div>

			{/* Right side */}
      <div className="navbar-end">
				{/* Mobile dropdown */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            {/* Hamburger icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li><Link to="/">Home</Link></li>
						<li><Link to="/admin">Admin Collection</Link></li>
            <li><Link to="/admin/creator">Create Template</Link></li>
						<li><button onClick={onLogout} className="btn btn-sm btn-outline">
              Logout
            </button></li>
          </ul>
        </div>
				<div className="space-x-2 hidden lg:flex">
					<span className="flex items-center gap-1">
						Admin(<span className="text-accent">{username}</span>)
					</span>
					<button onClick={onLogout} className="btn btn-sm btn-outline">
						Logout
					</button>
      </div>
			</div>
    </header>
  );
};

export default Navbar;
