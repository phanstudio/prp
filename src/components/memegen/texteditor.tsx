import React from "react";
import { DefualtTextSettings } from "../types";
import FontSelector from "../main/FontSelector";
import type { TextProperties } from "../../hooks/usecase/use-konva";
import { TextEffectsPanel } from "../TextEffectsPanel";
import {
  Bold,
  Italic,
  Underline,
  CaseUpper,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ALargeSmall,
  Palette,
} from "lucide-react";

interface TextEditorProps {
  element: TextProperties | null;
  currentTextProps: TextProperties | null;
  updateProperty: (props: Partial<TextProperties>) => void;
  onDelete: () => void;
  textManager: any;
  textValue: string | null;
}

const TextEditor: React.FC<TextEditorProps> = ({
  element,
  updateProperty,
  currentTextProps,
  textValue,
}) => {
  const activeProps = currentTextProps || element;
  if (!activeProps) return null;

  return (
    <div className="space-y-3.5 text-xs">
      {/* Font Size & Text Color */}
      <div className="grid grid-cols-2 gap-3 items-center">
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="label-text text-[11px] font-medium flex items-center gap-1">
              <ALargeSmall className="w-3.5 h-3.5 text-base-content/70" />
              Font Size
            </label>
            <span className="badge badge-xs badge-neutral">
              {activeProps.maxFontSize || DefualtTextSettings.fontSize}px
            </span>
          </div>
          <input
            type="range"
            min="12"
            max="100"
            step="1"
            className="range range-xs range-primary"
            value={activeProps.maxFontSize || DefualtTextSettings.fontSize}
            onChange={(e) => updateProperty({ maxFontSize: parseInt(e.target.value) || 20 })}
          />
        </div>

        <div>
          <label className="label-text text-[11px] font-medium mb-1 flex items-center gap-1">
            <Palette className="w-3.5 h-3.5 text-base-content/70" />
            Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={activeProps.fill || DefualtTextSettings.textColor}
              onChange={(e) => updateProperty({ fill: e.target.value })}
              className="input input-xs input-bordered w-9 h-8 p-1 cursor-pointer"
            />
            <span className="text-xs font-mono uppercase text-base-content/70">
              {activeProps.fill || DefualtTextSettings.textColor}
            </span>
          </div>
        </div>
      </div>

      {/* Font Selector */}
      <FontSelector
        value={activeProps.fontFamily || DefualtTextSettings.fontFamily}
        onChange={(font) => updateProperty({ fontFamily: font })}
      />

      {/* Styles & Alignment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label-text text-[11px] font-medium mb-1 block">Style</label>
          <div className="join w-full">
            <button
              type="button"
              className={`btn btn-xs join-item flex-1 ${
                activeProps.fontWeight === "bold" ? "btn-primary" : "btn-outline border-base-300"
              }`}
              onClick={() =>
                updateProperty({
                  fontWeight: activeProps.fontWeight === "bold" ? "normal" : "bold",
                })
              }
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className={`btn btn-xs join-item flex-1 ${
                activeProps.fontStyle === "italic" ? "btn-primary" : "btn-outline border-base-300"
              }`}
              onClick={() =>
                updateProperty({
                  fontStyle: activeProps.fontStyle === "italic" ? "normal" : "italic",
                })
              }
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className={`btn btn-xs join-item flex-1 ${
                activeProps.underline ? "btn-primary" : "btn-outline border-base-300"
              }`}
              onClick={() => updateProperty({ underline: !activeProps.underline })}
              title="Underline"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className={`btn btn-xs join-item flex-1 ${
                activeProps.allCaps ? "btn-primary" : "btn-outline border-base-300"
              }`}
              onClick={() =>
                updateProperty({
                  allCaps: !activeProps.allCaps,
                  text: textValue ?? activeProps.text,
                })
              }
              title="All Caps"
            >
              <CaseUpper className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div>
          <label className="label-text text-[11px] font-medium mb-1 block">Alignment</label>
          <div className="join w-full">
            <button
              type="button"
              className={`btn btn-xs join-item flex-1 ${
                activeProps.textAlign === "left" ? "btn-primary" : "btn-outline border-base-300"
              }`}
              onClick={() => updateProperty({ textAlign: "left" })}
              title="Align Left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className={`btn btn-xs join-item flex-1 ${
                activeProps.textAlign === "center" ? "btn-primary" : "btn-outline border-base-300"
              }`}
              onClick={() => updateProperty({ textAlign: "center" })}
              title="Align Center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className={`btn btn-xs join-item flex-1 ${
                activeProps.textAlign === "right" ? "btn-primary" : "btn-outline border-base-300"
              }`}
              onClick={() => updateProperty({ textAlign: "right" })}
              title="Align Right"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Effects Panel */}
      {currentTextProps && (
        <TextEffectsPanel
          currentTextProps={currentTextProps}
          updateProperty={updateProperty}
        />
      )}
    </div>
  );
};

export default TextEditor;