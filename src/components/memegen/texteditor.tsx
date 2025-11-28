import React from "react";
import { DefualtTextSettings } from "../types";
import FontSelector from "../main/FontSelector";
import type { TextProperties, TextManager } from "../../hooks/usecase/text-manager";
import { TextEffectsPanel } from "../TextEffectsPanel";
import { Trash2Icon, Copy } from "lucide-react";

// Text Editor Component
interface TextEditorProps {
  element: TextProperties | null;
  currentTextProps: TextProperties | null
  updateProperty: (props: Partial<TextProperties>) => void;
  onDelete: () => void;
  textManager: TextManager|null;
  textValue: string|null
}

const TextEditor: React.FC<TextEditorProps> = (
  { element, updateProperty, onDelete, currentTextProps, textManager, textValue }) => {
  // if (!element || !currentTextProps) {
  //   return (
  //     <div className="text-gray-500 text-sm text-center py-4">
  //       Select a text element to edit it
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-3 p-2">
      <div>
        <label className="label-text text-xs">Color:</label>
        <input
          type="color"
          value={currentTextProps?.fill || element?.fill || DefualtTextSettings.textColor}
          onChange={(e) => updateProperty({fill: e.target.value})}
          className="input input-xs input-bordered w-full h-8"
        />
      </div>
      
      <div>
        <label className="label-text text-xs">Max Font Size: {currentTextProps?.maxFontSize||element?.maxFontSize||DefualtTextSettings.fontSize}px</label>
        <input
          type="range" min="12" max="100" className="range range-sm"
          value={currentTextProps?.maxFontSize|| element?.maxFontSize || DefualtTextSettings.fontSize}
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
              (currentTextProps?.fontWeight||element?.fontWeight) === "bold"
                ? "btn-primary"
                : "btn-ghost"
            }`}
            onClick={() =>
              updateProperty({
                fontWeight:
                currentTextProps?.fontWeight === "bold"
                    ? "normal"
                    : "bold",
              })
            }
          >
            <b>B</b>
          </button>

          <button
            className={`btn btn-xs ${
              (currentTextProps?.fontStyle || element?.fontStyle) === "italic"
                ? "btn-primary"
                : "btn-ghost"
            }`}
            onClick={() =>
              updateProperty({
                fontStyle:
                currentTextProps?.fontStyle === "italic"
                    ? "normal"
                    : "italic",
              })
            }
          >
            <i>I</i>
          </button>

          <button
            className={`btn btn-xs ${
              (currentTextProps?.underline||element?.underline)
                ? "btn-primary"
                : "btn-ghost"
            }`}
            onClick={() =>
              updateProperty({
                underline: !currentTextProps?.underline,
              })
            }
          >
            <u>U</u>
          </button>

          <button
            className={`btn btn-xs ${
              (currentTextProps?.allCaps ?? (element?.text == element?.text?.toUpperCase())
            ) ? "btn-primary" : "btn-ghost"}`}
            onClick={() =>
              updateProperty({ allCaps: !currentTextProps?.allCaps, text: textValue??element?.text })
            }
          >
            Aa
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
                (currentTextProps?.textAlign || element?.textAlign) === align
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

      { currentTextProps &&
          <TextEffectsPanel
          currentTextProps={currentTextProps}
          updateProperty={updateProperty}
        />
      }
      
      <FontSelector
        value={currentTextProps?.fontFamily|| element?.fontFamily || DefualtTextSettings.fontFamily}
        onChange={(font) => updateProperty({ fontFamily: font })}
      />
      
      <div className="join w-full">
        <button
          onClick={textManager?.duplicateSelectedText}
          className="btn btn-info text-sm join-item"
        >
          <Copy size={16}/>
        </button>

        <button
          onClick={onDelete}
          className="btn btn-error text-sm join-item"
        >
          <Trash2Icon size={16}/>
        </button>
      </div>
    </div>
  );
};

export default TextEditor