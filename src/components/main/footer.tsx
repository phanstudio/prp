import React from "react";
import { Link } from "react-router-dom";

export const Footer: React.FC = () => {
  return (
    <footer className="footer footer-center bg-base-100 text-base-content/70 border-t border-base-200 py-6 px-4">
      <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-7xl mx-auto gap-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-base-content tracking-tight">
          <span className="text-sm">PostRugPhotos</span>
          <span className="text-base-content/40 font-normal">
            • Instant Meme Generator & Template Studio
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-primary transition-colors">
            Templates
          </Link>
          <Link to="/settings" className="hover:text-primary transition-colors">
            Settings
          </Link>
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;