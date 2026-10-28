import React from "react";
import { DefualtTextSettings, type TextEffectType } from "./types";

interface TextEffectsPanelProps {
  currentTextProps: {
    effectType?: TextEffectType;
    shadowColor?: string;
    shadowOpacity?: number;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    strokeColor?: string;
    strokeWidth?: number;
  };
  updateProperty: (props: Partial<TextEffectsPanelProps["currentTextProps"]>) => void;
}

export const TextEffectsPanel: React.FC<TextEffectsPanelProps> = ({
  currentTextProps,
  updateProperty,
}) => {
  const currentEffect = currentTextProps.effectType ?? "outline";

  const handleSelectEffect = (effect: TextEffectType) => {
    if (effect === "none") {
      updateProperty({
        effectType: "none",
        strokeWidth: 0,
        shadowBlur: 0,
        shadowOpacity: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
      });
    } else if (effect === "outline") {
      updateProperty({
        effectType: "outline",
        strokeColor: currentTextProps.strokeColor || DefualtTextSettings.outlineStrokeColor,
        strokeWidth: currentTextProps.strokeWidth ?? DefualtTextSettings.outlineStrokeWidth,
        shadowBlur: 0,
        shadowOpacity: 0,
      });
    } else if (effect === "newShadow" || effect === "shadow") {
      updateProperty({
        effectType: "newShadow",
        strokeColor: currentTextProps.strokeColor || DefualtTextSettings.outlineStrokeColor,
        strokeWidth: currentTextProps.strokeWidth ?? DefualtTextSettings.shadowStrokeWidth,
        shadowColor: currentTextProps.shadowColor || DefualtTextSettings.shadowColor,
        shadowBlur: currentTextProps.shadowBlur ?? DefualtTextSettings.shadowBlur,
        shadowOffsetX: currentTextProps.shadowOffsetX ?? DefualtTextSettings.shadowOffsetX,
        shadowOffsetY: currentTextProps.shadowOffsetY ?? DefualtTextSettings.shadowOffsetY,
        shadowOpacity: currentTextProps.shadowOpacity ?? DefualtTextSettings.shadowOpacity,
      });
    }
  };

  const shadowOpacityPercent = Math.round(
    (currentTextProps.shadowOpacity ?? DefualtTextSettings.shadowOpacity) * 100
  );

  return (
    <div className="space-y-3">
      {/* Effect Selector Header */}
      <div>
        <label className="label-text text-xs font-semibold mb-1 block">Text Effect</label>
        <div className="join w-full grid grid-cols-3">
          <button
            type="button"
            className={`btn btn-xs join-item ${
              currentEffect === "none" ? "btn-primary" : "btn-outline border-base-300"
            }`}
            onClick={() => handleSelectEffect("none")}
          >
            None
          </button>
          <button
            type="button"
            className={`btn btn-xs join-item ${
              currentEffect === "outline" ? "btn-primary" : "btn-outline border-base-300"
            }`}
            onClick={() => handleSelectEffect("outline")}
          >
            Outline
          </button>
          <button
            type="button"
            className={`btn btn-xs join-item ${
              currentEffect === "newShadow" || currentEffect === "shadow"
                ? "btn-primary"
                : "btn-outline border-base-300"
            }`}
            onClick={() => handleSelectEffect("newShadow")}
          >
            Shadow + Stroke
          </button>
        </div>
      </div>

      {/* --- OUTLINE ONLY CONTROLS --- */}
      {currentEffect === "outline" && (
        <div className="p-3 bg-base-200/70 border border-base-300 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="label-text text-[11px] font-medium block mb-1">
                Outline Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="input input-xs input-bordered w-10 h-8 p-1 cursor-pointer"
                  value={currentTextProps.strokeColor || DefualtTextSettings.outlineStrokeColor}
                  onChange={(e) => updateProperty({ strokeColor: e.target.value })}
                />
                <span className="text-xs font-mono text-base-content/70 uppercase">
                  {currentTextProps.strokeColor || DefualtTextSettings.outlineStrokeColor}
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="label-text text-[11px] font-medium">Outline Width</label>
                <span className="badge badge-xs badge-neutral">
                  {currentTextProps.strokeWidth ?? DefualtTextSettings.outlineStrokeWidth}px
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                className="range range-xs range-primary"
                value={currentTextProps.strokeWidth ?? DefualtTextSettings.outlineStrokeWidth}
                onChange={(e) => updateProperty({ strokeWidth: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>
      )}

      {/* --- SHADOW + STROKE CONTROLS --- */}
      {(currentEffect === "newShadow" || currentEffect === "shadow") && (
        <div className="p-3 bg-base-200/70 border border-base-300 rounded-lg space-y-3">
          {/* Shadow Color & Opacity */}
          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="label-text text-[11px] font-medium block mb-1">
                Shadow Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="input input-xs input-bordered w-10 h-8 p-1 cursor-pointer"
                  value={currentTextProps.shadowColor || DefualtTextSettings.shadowColor}
                  onChange={(e) => updateProperty({ shadowColor: e.target.value })}
                />
                <span className="text-xs font-mono text-base-content/70 uppercase">
                  {currentTextProps.shadowColor || DefualtTextSettings.shadowColor}
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="label-text text-[11px] font-medium">Opacity</label>
                <span className="badge badge-xs badge-neutral">{shadowOpacityPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                className="range range-xs range-primary"
                value={currentTextProps.shadowOpacity ?? DefualtTextSettings.shadowOpacity}
                onChange={(e) =>
                  updateProperty({ shadowOpacity: parseFloat(e.target.value) })
                }
              />
            </div>
          </div>

          {/* Shadow Blur */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="label-text text-[11px] font-medium">Blur</label>
              <span className="badge badge-xs badge-neutral">
                {currentTextProps.shadowBlur ?? DefualtTextSettings.shadowBlur}px
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              className="range range-xs range-primary"
              value={currentTextProps.shadowBlur ?? DefualtTextSettings.shadowBlur}
              onChange={(e) =>
                updateProperty({ shadowBlur: parseInt(e.target.value) || 0 })
              }
            />
          </div>

          {/* Distance / Offset Controls */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="label-text text-[11px] font-medium">Offset X</label>
                <span className="badge badge-xs badge-neutral">
                  {currentTextProps.shadowOffsetX ?? DefualtTextSettings.shadowOffsetX}px
                </span>
              </div>
              <input
                type="range"
                min="-25"
                max="25"
                step="1"
                className="range range-xs"
                value={currentTextProps.shadowOffsetX ?? DefualtTextSettings.shadowOffsetX}
                onChange={(e) =>
                  updateProperty({ shadowOffsetX: parseInt(e.target.value) || 0 })
                }
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="label-text text-[11px] font-medium">Offset Y</label>
                <span className="badge badge-xs badge-neutral">
                  {currentTextProps.shadowOffsetY ?? DefualtTextSettings.shadowOffsetY}px
                </span>
              </div>
              <input
                type="range"
                min="-25"
                max="25"
                step="1"
                className="range range-xs"
                value={currentTextProps.shadowOffsetY ?? DefualtTextSettings.shadowOffsetY}
                onChange={(e) =>
                  updateProperty({ shadowOffsetY: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          {/* Outline / Stroke border inside shadow mode */}
          <div className="pt-2 border-t border-base-300 grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="label-text text-[11px] font-medium block mb-1">
                Stroke Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="input input-xs input-bordered w-10 h-8 p-1 cursor-pointer"
                  value={currentTextProps.strokeColor || DefualtTextSettings.outlineStrokeColor}
                  onChange={(e) => updateProperty({ strokeColor: e.target.value })}
                />
                <span className="text-xs font-mono text-base-content/70 uppercase">
                  {currentTextProps.strokeColor || DefualtTextSettings.outlineStrokeColor}
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="label-text text-[11px] font-medium">Stroke Width</label>
                <span className="badge badge-xs badge-neutral">
                  {currentTextProps.strokeWidth ?? DefualtTextSettings.shadowStrokeWidth}px
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                className="range range-xs"
                value={currentTextProps.strokeWidth ?? DefualtTextSettings.shadowStrokeWidth}
                onChange={(e) =>
                  updateProperty({ strokeWidth: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
