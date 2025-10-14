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

function rgbaToHex(rgba: string|undefined) {
  if  (!rgba) return "#000000";
  if (rgba.startsWith("#")) return rgba
  const result = rgba.match(/\d+/g);
  if (!result) return "#000000";
  const [r, g, b] = result.map(Number);
  return (
    "#" +
    [r, g, b]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}


export const TextEffectsPanel: React.FC<TextEffectsPanelProps> = ({
  currentTextProps,
  updateProperty,
}) => {
  return (
    <div>
      <label className="label-text text-xs mb-1 block">Text Effect</label>

      {/* Effect Type Buttons */}
      <div className="flex gap-2 mb-2">
        {(["none", "shadow", "outline"] as TextEffectType[]).map((effect) => (
          <button
            key={effect}
            className={`btn btn-xs ${
              currentTextProps.effectType === effect ? "btn-primary" : "btn-ghost"
            }`}
            onClick={() => updateProperty({ effectType: effect })}
          >
            {effect.charAt(0).toUpperCase() + effect.slice(1)}
          </button>
        ))}
      </div>

      {/* --- SHADOW CONTROLS --- */}
      {currentTextProps.effectType === "shadow" && (
        <div className="space-y-2 p-2 bg-base-200 rounded">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label-text text-xs">Shadow Color</label>
              <input
                type="color"
                className="input input-xs input-bordered w-full h-8"
                value={rgbaToHex(currentTextProps.shadowColor) || DefualtTextSettings.shadowColor}
                onChange={(e) => updateProperty({ shadowColor: e.target.value })}
              />
            </div>
            <div>
              <label className="label-text text-xs">Opacity</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                className="range range-xs"
                value={currentTextProps.shadowOpacity ?? DefualtTextSettings.shadowOpacity}
                onChange={(e) =>
                  updateProperty({ shadowOpacity: parseFloat(e.target.value) })
                }
              />
              <div className="text-xs text-center">
                {((currentTextProps.shadowOpacity ?? DefualtTextSettings.shadowOpacity) * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          <div>
            <label className="label-text text-xs">Blur</label>
            <input
              type="range"
              min="0"
              max="30"
              className="range range-xs"
              value={currentTextProps.shadowBlur ?? DefualtTextSettings.shadowBlur}
              onChange={(e) => updateProperty({ shadowBlur: parseInt(e.target.value) })}
            />
            <div className="text-xs text-center">
              {currentTextProps.shadowBlur}px
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label-text text-xs">Offset X</label>
              <input
                type="range"
                min="-20"
                max="20"
                className="range range-xs"
                value={currentTextProps.shadowOffsetX ?? DefualtTextSettings.shadowOffsetX}
                onChange={(e) =>
                  updateProperty({ shadowOffsetX: parseInt(e.target.value) })
                }
              />
              <div className="text-xs text-center">
                {currentTextProps.shadowOffsetX}px
              </div>
            </div>
            <div>
              <label className="label-text text-xs">Offset Y</label>
              <input
                type="range"
                min="-20"
                max="20"
                className="range range-xs"
                value={currentTextProps.shadowOffsetY ?? DefualtTextSettings.shadowOffsetY}
                onChange={(e) =>
                  updateProperty({ shadowOffsetY: parseInt(e.target.value) })
                }
              />
              <div className="text-xs text-center">
                {currentTextProps.shadowOffsetY}px
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- OUTLINE CONTROLS --- */}
      {currentTextProps.effectType === "outline" && (
        <div className="space-y-2 p-2 bg-base-200 rounded">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label-text text-xs">Outline Color</label>
              <input
                type="color"
                className="input input-xs input-bordered w-full h-8"
                value={currentTextProps.strokeColor || DefualtTextSettings.outlineStrokeColor}
                onChange={(e) => updateProperty({ strokeColor: e.target.value })}
              />
            </div>
            <div>
              <label className="label-text text-xs">Width</label>
              <input
                type="range"
                min="1"
                max="20"
                className="range range-xs"
                value={currentTextProps.strokeWidth ?? DefualtTextSettings.outlineStrokeWidth}
                onChange={(e) =>
                  updateProperty({ strokeWidth: parseInt(e.target.value) })
                }
              />
              <div className="text-xs text-center">
                {currentTextProps.strokeWidth}px
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
