import React from "react";
import { DefualtTextSettings } from "../types";
import FontSelector from "../main/FontSelector";
import type { TextProperties } from "../../hooks/usecase/text-manager";
import { TextEffectsPanel } from "../TextEffectsPanel";

// Text Editor Component
interface TextEditorProps {
  element: TextProperties | null;
  currentTextProps: TextProperties | null
  updateProperty: (props: Partial<TextProperties>) => void;
  onDelete: () => void;
}

const TextEditor: React.FC<TextEditorProps> = (
  { element, updateProperty, onDelete, currentTextProps }) => {
  if (!element || !currentTextProps) {
    return (
      <div className="text-gray-500 text-sm text-center py-4">
        Select a text element to edit it
      </div>
    );
  }

  return (
    <div className="space-y-3 p-2">
      <div>
        <label className="label-text text-xs">Color:</label>
        <input
          type="color"
          value={currentTextProps.fill || DefualtTextSettings.textColor}
          onChange={(e) => updateProperty({fill: e.target.value})}
          className="input input-xs input-bordered w-full h-8"
        />
      </div>
      
      <div>
        <label className="label-text text-xs">Max Font Size: {currentTextProps.maxFontSize}px</label>
        <input
          type="range" min="12" max="100" className="range range-sm"
          value={currentTextProps.maxFontSize || DefualtTextSettings.fontSize}
          onChange={(e) =>
            updateProperty({ maxFontSize: parseInt(e.target.value) })
          }
        />
      </div>

      {/* Font Styles */}
      <div>
        <label className="label-text text-xs mb-1 block">Text Style</label>
        <div className="flex gap-2">
          <button
            className={`btn btn-xs ${
              currentTextProps.fontWeight === "bold"
                ? "btn-primary"
                : "btn-ghost"
            }`}
            onClick={() =>
              updateProperty({
                fontWeight:
                  currentTextProps.fontWeight === "bold"
                    ? "normal"
                    : "bold",
              })
            }
          >
            <b>B</b>
          </button>

          <button
            className={`btn btn-xs ${
              currentTextProps.fontStyle === "italic"
                ? "btn-primary"
                : "btn-ghost"
            }`}
            onClick={() =>
              updateProperty({
                fontStyle:
                  currentTextProps.fontStyle === "italic"
                    ? "normal"
                    : "italic",
              })
            }
          >
            <i>I</i>
          </button>

          <button
            className={`btn btn-xs ${
              currentTextProps.underline
                ? "btn-primary"
                : "btn-ghost"
            }`}
            onClick={() =>
              updateProperty({
                underline: !currentTextProps.underline,
              })
            }
          >
            <u>U</u>
          </button>
        </div>
      </div>

      {/* Text Alignment */}
      <div>
        <label className="label-text text-xs mb-1 block">Alignment</label>
        <div className="flex gap-2">
          {(["left", "center", "right"] as const).map((align) => (
            <button
              key={align}
              className={`btn btn-xs ${
                currentTextProps.textAlign === align
                  ? "btn-primary"
                  : "btn-ghost"
              }`}
              onClick={() => updateProperty({ textAlign: align })}
            >
              {align[0].toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Text Effects */}
      <TextEffectsPanel
        currentTextProps={currentTextProps}
        updateProperty={updateProperty}
      />
      
      <FontSelector
        value={currentTextProps.fontFamily || DefualtTextSettings.fontFamily}
        onChange={(font) => updateProperty({ fontFamily: font })}
      />
      
      <button
        onClick={onDelete}
        className="btn w-full btn-error text-sm"
      >
        Delete This Text
      </button>
    </div>
  );
};

export default TextEditor