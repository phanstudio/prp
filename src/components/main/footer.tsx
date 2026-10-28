import React from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="footer footer-center bg-base-100 text-base-content/70 border-t border-base-200 py-6 px-4">
      <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-7xl mx-auto gap-3 text-xs">
        <div className="flex items-center gap-2 font-semibold text-base-content">
          <div className="w-5 h-5 rounded bg-primary text-primary-content flex items-center justify-center">
            <Sparkles className="w-3 h-3" />
          </div>
          <span>PostRugPhotos</span>
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