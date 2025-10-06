import React from "react";
import Footer from "../components/main/footer";
import Header from "../components/main/header";
import Banner from "../components/main/banner";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const RegularLayout: React.FC = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <Header
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        username={user?.username}
        onLogout={handleLogout}
      />
      <div className="flex-1 pt-16">
        {/* <Banner
          messages={[
            "Welcome to the site — new features are live!",
            "Maintenance tonight 00:00 - expect brief downtime.",
            "Tip: Press / to focus search.",
            "🎆🎆🍾🥂",
          ]}
          bgClass="bg-primary text-primary-content"
          className="text-sm md:text-base"
        /> */}
        <main className="flex-1 p16">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div>
      <header className="lg:px-20 navbar bg-base-100 shadow-md">
        <div className="navbar-start">
          <Link to="/admin" className="text-xl font-bold">Admin Panel</Link>
        </div>
        <div className="navbar-center">
          <ul className="menu menu-horizontal px-1">
            <li><Link to={"/"}>Gallery</Link></li>
            <li><Link to={"/admin/creator"}>Create Template</Link></li>
          </ul>
        </div>
        <div className="navbar-end">
          <span className="mr-4">Admin: <span className="text-accent">{user?.username}</span></span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};
