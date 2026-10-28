import React from "react";
import Footer from "../components/main/footer";
import Header from "../components/main/header";
// import Banner from "../components/main/banner";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/main/adminHeader";

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
        <main className="flex-1 pb-12">
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
    <div className="min-h-screen bg-base-200 flex flex-col">
      <Navbar onLogout={handleLogout} username={user?.username ?? undefined} />
      <main className="flex-1 pb-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
