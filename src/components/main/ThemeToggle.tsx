// src/components/main/ThemeToggle.tsx
import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = "",
  showLabel = false,
}) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <label
        className="swap swap-rotate btn btn-ghost btn-circle btn-sm btn-press"
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {/* daisyUI theme controller input */}
        <input
          type="checkbox"
          className="theme-controller"
          checked={!isDark}
          onChange={toggleTheme}
          aria-label="Toggle light and dark theme"
        />

        {/* Sun icon (shown when active / light mode) */}
        <Sun className="swap-on w-4 h-4 text-warning transition-transform" />

        {/* Moon icon (shown when inactive / dark mode) */}
        <Moon className="swap-off w-4 h-4 text-primary transition-transform" />
      </label>

      {showLabel && (
        <span
          className="text-xs font-medium cursor-pointer select-none text-base-content/80"
          onClick={toggleTheme}
        >
          {isDark ? "Dark Mode" : "Light Mode"}
        </span>
      )}
    </div>
  );
};

export default ThemeToggle;

