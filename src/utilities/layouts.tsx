import React from "react";
import { Outlet, Link } from "react-router-dom";
import Footer from "../components/main/footer";

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      {/* Optional sidebar / header for admin */}
      <header className="p-4 bg-base-100 shadow-md">
        <Link to="/admin" className="text-xl font-bold">
          Admin Panel
        </Link>
      </header>

      <main className="p-4 flex-grow">
        <Outlet /> {/* Nested routes render here */}
      </main>

      <Footer />
    </div>
  );
};

export const RegularLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <main className="flex-grow">
        <Outlet /> {/* Nested routes render here */}
      </main>
      <Footer />
    </div>
  );
};
