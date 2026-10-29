import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Trash2,
  CheckCircle2,
  RotateCcw,
  Sliders,
  Palette,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react";
import { useToast } from "../services/ToastProvider";
import { useTheme } from "../contexts/ThemeContext";
import {
  getPostCreatePreferenceDetails,
  setPostCreatePreference,
  clearPostCreatePreference,
  getKeepImagePreference,
  setKeepImagePreference,
  type PostCreateAction,
} from "../utilities/postCreateAction";

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { setTheme, isDark } = useTheme();

  const [prefDetails, setPrefDetails] = useState(() => getPostCreatePreferenceDetails());
  const [keepImage, setKeepImage] = useState(() => getKeepImagePreference());

  const currentAction: PostCreateAction | "ask" = prefDetails?.action ?? "ask";

  const handleActionChange = (action: PostCreateAction | "ask") => {
    if (action === "ask") {
      clearPostCreatePreference();
      setPrefDetails(null);
      addToast("Preference set: Will ask every time", "info", 2500);
    } else {
      setPostCreatePreference(action, true);
      const details = getPostCreatePreferenceDetails();
      setPrefDetails(details);
      addToast(
        `Preference saved: ${
          action === "gallery" ? "Always go to Gallery" : "Always stay & create another"
        } (valid for 7 days)`,
        "success",
        2500
      );
    }
  };

  const handleKeepImageToggle = (checked: boolean) => {
    setKeepImage(checked);
    setKeepImagePreference(checked);
    addToast(
      checked
        ? "Preference saved: Background image will be retained on Create Another"
        : "Preference saved: Entire canvas & image will be cleared on Create Another",
      "info",
      2500
    );
  };

  const handleThemeChange = (newTheme: "darknew" | "light") => {
    setTheme(newTheme);
    addToast(`Theme switched to ${newTheme === "light" ? "Light" : "Dark"} mode`, "success", 2000);
  };

  const handleResetAllPreferences = () => {
    clearPostCreatePreference();
    setKeepImagePreference(false);
    setPrefDetails(null);
    setKeepImage(false);
    setTheme("darknew");
    addToast("All editor and appearance preferences have been reset to defaults", "info", 2500);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-base-300 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-sm btn-ghost gap-1.5 border border-base-300 btn-press"
          >
            <ArrowLeft className="w-4 h-4 text-base-content/70" />
            Back
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <Sliders className="w-6 h-6 text-primary" />
              Editor Preferences & Settings
            </h1>
            <p className="text-xs text-base-content/60 mt-0.5">
              Customize appearance, post-creation workflow, and canvas behaviors
            </p>
          </div>
        </div>

        <button
          onClick={handleResetAllPreferences}
          className="btn btn-xs sm:btn-sm btn-outline btn-error gap-1 btn-press"
          title="Reset all settings to factory default"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Appearance & Theme Section */}
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Appearance & Theme
              </h2>
              <p className="text-xs text-base-content/70 mt-1">
                Select your preferred color theme. Uses official daisyUI semantic color palettes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Dark Mode Option */}
              <label
                className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all btn-press ${
                  isDark
                    ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                    : "border-base-300 hover:border-base-content/30 bg-base-200/40"
                }`}
                onClick={() => handleThemeChange("darknew")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-base-300 flex items-center justify-center text-primary">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Dark Theme (Default)</div>
                    <div className="text-[11px] text-base-content/60">
                      High-contrast deep background with neon teal accents
                    </div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="theme_mode"
                  className="radio radio-primary radio-sm"
                  checked={isDark}
                  onChange={() => handleThemeChange("darknew")}
                />
              </label>

              {/* Light Mode Option */}
              <label
                className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all btn-press ${
                  !isDark
                    ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                    : "border-base-300 hover:border-base-content/30 bg-base-200/40"
                }`}
                onClick={() => handleThemeChange("light")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-base-300 flex items-center justify-center text-warning">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Light Theme</div>
                    <div className="text-[11px] text-base-content/60">
                      Clean crisp paper surface with vibrant teal contrast
                    </div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="theme_mode"
                  className="radio radio-primary radio-sm"
                  checked={!isDark}
                  onChange={() => handleThemeChange("light")}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Post-Creation Workflow Section */}
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Post-Save Workflow Action
                </h2>
                <p className="text-xs text-base-content/70 mt-1">
                  Choose what happens automatically immediately after saving a new template.
                  Saved selections expire after <strong>7 days</strong> (1-week TTL) or can be updated here anytime.
                </p>
              </div>

              {prefDetails && (
                <span className="badge badge-primary badge-outline text-xs gap-1 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {prefDetails.daysRemaining} days left
                </span>
              )}
            </div>

            {/* Radio Selection Options */}
            <div className="space-y-3 pt-2">
              <label
                className={`p-3.5 rounded-lg border cursor-pointer flex items-start gap-3 transition-all ${
                  currentAction === "ask"
                    ? "border-primary bg-primary/5"
                    : "border-base-300 hover:border-base-content/30"
                }`}
                onClick={() => handleActionChange("ask")}
              >
                <input
                  type="radio"
                  name="post_create_action"
                  className="radio radio-primary radio-sm mt-0.5"
                  checked={currentAction === "ask"}
                  onChange={() => handleActionChange("ask")}
                />
                <div className="flex-1">
                  <div className="font-semibold text-sm">Ask Every Time (Default)</div>
                  <div className="text-xs text-base-content/60 mt-0.5">
                    Displays a confirmation popup giving you the choice to either go back to the template gallery or stay & create another template.
                  </div>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-lg border cursor-pointer flex items-start gap-3 transition-all ${
                  currentAction === "gallery"
                    ? "border-primary bg-primary/5"
                    : "border-base-300 hover:border-base-content/30"
                }`}
                onClick={() => handleActionChange("gallery")}
              >
                <input
                  type="radio"
                  name="post_create_action"
                  className="radio radio-primary radio-sm mt-0.5"
                  checked={currentAction === "gallery"}
                  onChange={() => handleActionChange("gallery")}
                />
                <div className="flex-1">
                  <div className="font-semibold text-sm">Always Go to Gallery</div>
                  <div className="text-xs text-base-content/60 mt-0.5">
                    Immediately navigates back to the template collection gallery upon successfully saving.
                  </div>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-lg border cursor-pointer flex items-start gap-3 transition-all ${
                  currentAction === "continue"
                    ? "border-primary bg-primary/5"
                    : "border-base-300 hover:border-base-content/30"
                }`}
                onClick={() => handleActionChange("continue")}
              >
                <input
                  type="radio"
                  name="post_create_action"
                  className="radio radio-primary radio-sm mt-0.5"
                  checked={currentAction === "continue"}
                  onChange={() => handleActionChange("continue")}
                />
                <div className="flex-1">
                  <div className="font-semibold text-sm">Always Stay & Create Another</div>
                  <div className="text-xs text-base-content/60 mt-0.5">
                    Resets the canvas ready for your next template creation so you can rapidly build multiple templates.
                  </div>
                </div>
              </label>
            </div>

            {prefDetails && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleActionChange("ask")}
                  className="btn btn-xs btn-outline btn-error gap-1 btn-press"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear 7-Day Saved Preference
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Canvas & Reset Behavior Section */}
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Palette className="w-5 h-5 text-accent" />
                Canvas Reset Behavior
              </h2>
              <p className="text-xs text-base-content/70 mt-1">
                Configure what is cleared when creating another template or clicking "Reset All".
              </p>
            </div>

            <div className="p-4 bg-base-200/50 rounded-lg border border-base-300 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-sm font-semibold">
                  Keep Background Image on "Create Another"
                </div>
                <div className="text-xs text-base-content/60 max-w-lg">
                  When enabled, resetting or clicking "Create Another" keeps the current background image on the canvas and only clears text boxes and metadata. When disabled, the image is wiped clean as well.
                </div>
              </div>

              <input
                type="checkbox"
                className="toggle toggle-primary toggle-md"
                checked={keepImage}
                onChange={(e) => handleKeepImageToggle(e.target.checked)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
