import React from "react";
import { Outlet, Link } from "react-router-dom";
import Footer from "../components/main/footer";
import Header from "../components/main/header";

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      {/* Optional sidebar / header for admin */}
      <header className="lg:px-20 navbar bg-base-100 shadow-md">
        <div className="navbar-start">
          <Link to="/admin" className="text-xl font-bold">
            Admin Panel
          </Link>
        </div>
        <div className="navbar-center">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link to={"/"}>Gallery</Link>
          </li>
        </ul>
        </div>
      </header>

      <main className="flex-grow">
        <Outlet /> {/* Nested routes render here */}
      </main>

      <Footer />
    </div>
  );
};

export const RegularLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet /> {/* Nested routes render here */}
      </main>
      <Footer />
    </div>
  );
};
