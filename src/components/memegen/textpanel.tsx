import TextElementList from "./textelementlist";
import React, { useEffect, useState } from "react";
import type { TextProperties } from "../../hooks/usecase/use-konva";
import { Plus, Download, Copy, RotateCcw, Check } from "lucide-react";
import { useToast } from "../../services/ToastProvider";

interface TextPanelProps {
  textManager: any;
  textElements: any[];
  selectedElement: string | null;
  setSelectedElement: (id: string | null) => void;
  addText: () => void;
  deleteSelectedElement: () => void;
  onSave: () => Promise<void> | void;
  onCopy?: () => Promise<boolean>;
  onResetTemplate: () => void;
  className?: string;
}

const TextPanel: React.FC<TextPanelProps> = ({
  textManager,
  textElements,
  selectedElement,
  setSelectedElement,
  addText,
  deleteSelectedElement,
  onSave,
  onCopy,
  onResetTemplate,
  className = "",
}) => {
  const [currentTextProps, setCurrentTextProps] = useState<TextProperties | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { addToast } = useToast();

  // Sync current text properties when selection changes
  useEffect(() => {
    if (selectedElement) {
      const props = textManager.getSelectedTextProperties();
      setCurrentTextProps(props);
    } else {
      setCurrentTextProps(null);
    }
  }, [selectedElement, textManager]);

  // Update selected text through TextManager
  const updateProperty = (updates: Partial<TextProperties>) => {
    if (!currentTextProps) return;
    const newProps = { ...currentTextProps, ...updates };
    setCurrentTextProps(newProps);
    textManager.updateSelectedText(updates);
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await onSave();
      addToast("Meme downloaded successfully!", "success", 2500);
    } catch {
      addToast("Failed to generate meme. Please try again.", "error", 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!onCopy) return;
    const success = await onCopy();
    if (success) {
      setIsCopied(true);
      addToast("Meme copied to clipboard!", "success", 2500);
      setTimeout(() => setIsCopied(false), 2000);
    } else {
      addToast("Clipboard copy not supported by your browser. Use Download instead.", "info", 3000);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-base-200">
        <div>
          <h2 className="text-base font-bold">Meme Captions</h2>
          <p className="text-xs text-base-content/60">
            {textElements.length} {textElements.length === 1 ? "caption" : "captions"}
          </p>
        </div>
        <button
          type="button"
          onClick={addText}
          className="btn btn-primary btn-sm gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add Text Box
        </button>
      </div>

      {/* List of text elements */}
      <TextElementList
        textElements={textElements}
        selectedElement={selectedElement}
        setSelectedElement={setSelectedElement}
        updateProperty={updateProperty}
        deleteSelectedElement={deleteSelectedElement}
        currentTextProps={currentTextProps}
        textManager={textManager}
      />

      {/* Action Buttons */}
      <div className="pt-2 border-t border-base-200 space-y-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isGenerating}
          className="btn btn-success w-full text-white gap-2 shadow-sm hover:shadow"
        >
          {isGenerating ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Generating High-Res Meme...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download Meme
            </>
          )}
        </button>

        <div className="grid grid-cols-2 gap-2">
          {onCopy && (
            <button
              type="button"
              onClick={handleCopy}
              className="btn btn-outline btn-sm gap-1.5"
              title="Copy meme image to clipboard for instant pasting"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              {isCopied ? "Copied!" : "Copy Image"}
            </button>
          )}

          <button
            type="button"
            onClick={onResetTemplate}
            className="btn btn-ghost btn-sm border border-base-300 gap-1.5"
            title="Reset captions to template default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Captions
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextPanel;
