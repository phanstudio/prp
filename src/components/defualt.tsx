import { useState } from "react";
import { Sparkles, Image as ImageIcon } from "lucide-react";

export default function EffectsPanel() {
  const [effects, setEffects] = useState({
    grayscale: false,
    sepia: false,
    invert: false,
    jpegDegrade: false,
    jpegMinQuality: false,
    posterize: false,
    brightness: 50,
    blur: 0,
    sharpen: 0,
  });

  const handleToggle = (key: string) => {
    setEffects((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleSlider = (key: string, value: number) => {
    setEffects((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
      {/* Color Filters */}
      <div className="card bg-base-200 shadow-md">
        <div className="card-body">
          <h2 className="card-title flex items-center gap-2">
            <ImageIcon className="w-5 h-5" /> Color Filters
          </h2>
          <div className="space-y-3">
            {["grayscale", "sepia", "invert"].map((filter) => (
              <div key={filter} className="flex justify-between items-center">
                <span className="capitalize">{filter}</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={effects[filter as keyof typeof effects] as boolean}
                  onChange={() => handleToggle(filter)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Image Quality */}
      <div className="card bg-base-200 shadow-md">
        <div className="card-body">
          <h2 className="card-title flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> Image Quality
          </h2>
          <div className="space-y-3">
            {["posterize", "jpegDegrade", "jpegMinQuality"].map((filter) => (
              <div key={filter} className="flex justify-between items-center">
                <span className="capitalize">{filter}</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={effects[filter as keyof typeof effects] as boolean}
                  onChange={() => handleToggle(filter)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Adjustments */}
      <div className="card bg-base-200 shadow-md">
        <div className="card-body space-y-5">
          <div>
            <label className="flex justify-between text-sm mb-1">
              <span>Brightness</span>
              <span>{effects.brightness}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={effects.brightness}
              onChange={(e) => handleSlider("brightness", Number(e.target.value))}
              className="range range-primary"
            />
          </div>

          <div>
            <label className="flex justify-between text-sm mb-1">
              <span>Blur</span>
              <span>{effects.blur}</span>
            </label>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={effects.blur}
              onChange={(e) => handleSlider("blur", Number(e.target.value))}
              className="range range-primary"
            />
          </div>

          <div>
            <label className="flex justify-between text-sm mb-1">
              <span>Sharpen</span>
              <span>{effects.sharpen}</span>
            </label>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={effects.sharpen}
              onChange={(e) => handleSlider("sharpen", Number(e.target.value))}
              className="range range-primary"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-center">
        <button className="btn btn-secondary">✨ AI</button>
        <button className="btn btn-primary">🎭 Effects</button>
      </div>
    </div>
  );
}
