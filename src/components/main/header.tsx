import { Link } from "react-router-dom";

interface HeaderProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  username?: string;
  onLogout: () => void;
}
// make responsive
const Header: React.FC<HeaderProps> = ({ isAuthenticated, isAdmin, username, onLogout }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      <nav className="navbar bg-base-200 shadow-sm lg:px-20">
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16"/>
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
            >
              <li><Link to={"/"}>Home</Link></li>
              <li><Link to={"#"}>About</Link></li>
              {isAdmin &&(
                <li><Link to={"/admin"}>Admin</Link></li>
              )}
            </ul>
          </div>
          <Link to={"/"} className="btn btn-ghost text-xl">PostRugPhotos</Link>
        </div>

        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li><Link to={"/"}>Home</Link></li>
            <li><Link to={"#"}>About</Link></li>
            {isAdmin &&(
                <li><Link to={"/admin"} className="text-accent">Admin</Link></li>
              )}
          </ul>
        </div>

        <div className="navbar-end">
          {isAuthenticated ? (
            <>
              <span className="mr-2">Welcome, {username}</span>
              <button className="btn" onClick={onLogout}>Logout</button>
            </>
          ) : (
            <Link to={"/login"} className="btn">Login</Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
