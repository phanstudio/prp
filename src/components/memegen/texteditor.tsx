import React from "react";
import { DefualtTextSettings } from "../types";
import FontSelector from "../main/FontSelector";
import type { TextProperties } from "../../hooks/usecase/use-konva";
import { TextEffectsPanel } from "../TextEffectsPanel";

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
            <label className="label-text text-[11px] font-medium">Font Size</label>
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
          <label className="label-text text-[11px] font-medium block mb-1">Color</label>
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
              <strong>B</strong>
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
              <em>I</em>
            </button>
            <button
              type="button"
              className={`btn btn-xs join-item flex-1 ${
                activeProps.underline ? "btn-primary" : "btn-outline border-base-300"
              }`}
              onClick={() => updateProperty({ underline: !activeProps.underline })}
              title="Underline"
            >
              <u>U</u>
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
              AA
            </button>
          </div>
        </div>

        <div>
          <label className="label-text text-[11px] font-medium mb-1 block">Alignment</label>
          <div className="join w-full">
            {(["left", "center", "right"] as const).map((align) => (
              <button
                key={align}
                type="button"
                className={`btn btn-xs join-item flex-1 capitalize ${
                  activeProps.textAlign === align ? "btn-primary" : "btn-outline border-base-300"
                }`}
                onClick={() => updateProperty({ textAlign: align })}
              >
                {align}
              </button>
            ))}
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