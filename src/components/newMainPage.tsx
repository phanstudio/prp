import React, { useRef, useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Download, ArrowLeft } from "lucide-react";
import type { TextElement, Template } from "./types";
import Canvas, { type CanvasHandle } from "./memegen/canvas";

// Mock Canvas Component (simplified for this demo)
// const MockCanvas: React.FC<{
//   image: HTMLImageElement | null;
//   textElements: TextElement[];
//   selectedElement: string | null;
//   onElementSelect: (id: string | null) => void;
//   onElementMove: (id: string, x: number, y: number) => void;
//   onElementRotate: (id: string, rotation: number) => void;
//   onSave?: () => void;
// }> = ({
//   image,
//   textElements,
//   selectedElement,
//   onElementSelect,
//   onElementMove,
//   onElementRotate,
//   onSave,
// }) => {
//   return (
//     <div className="border-2 border-dashed border-base-300 rounded-lg p-8 text-center bg-base-100">
//       {image ? (
//         <div className="relative inline-block">
//           <img
//             src={image.src}
//             alt="Template"
//             className="max-w-full max-h-96 rounded-lg shadow-sm"
//           />
//           <div className="absolute inset-0 flex items-center justify-center">
//             <div className="bg-black bg-opacity-50 text-white p-2 rounded">
//               Canvas Component ({textElements.length} text elements)
//             </div>
//           </div>
//         </div>
//       ) : (
//         <div className="text-base-content/60">
//           <div className="w-96 h-64 bg-base-200 rounded-lg mx-auto flex items-center justify-center">
//             Canvas Placeholder
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// Meme Generator Component
export const MemeEditor: React.FC<{
  template: Template;
  onBack: () => void;
}> = ({ template, onBack }) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [textElements, setTextElements] = useState<TextElement[]>(
    template.textElements.map((el) => ({
      ...el,
      id: Date.now().toString() + Math.random(),
    }))
  );
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const canvasRef = useRef<CanvasHandle>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setImage(img);
    img.src = template.image;
  }, [template]);

  const addText = () => {
    const newElement: TextElement = {
      id: Date.now().toString(),
      text: "New Text",
      x: 50,
      y: 50 + textElements.length * 40,
      fontSize: 24,
      color: "#ffffff",
      fontFamily: "Arial",
      rotation: 0,
    };

    setTextElements([...textElements, newElement]);
    setSelectedElement(newElement.id);
  };

  const updateSelectedText = (
    field: keyof TextElement,
    value: string | number
  ) => {
    if (!selectedElement) return;

    setTextElements((prev) =>
      prev.map((element) =>
        element.id === selectedElement
          ? { ...element, [field]: value }
          : element
      )
    );
  };

  const moveElement = (id: string, x: number, y: number) => {
    setTextElements((prev) =>
      prev.map((element) =>
        element.id === id ? { ...element, x, y } : element
      )
    );
  };

  const deleteSelectedElement = () => {
    if (!selectedElement) return;
    setTextElements((prev) => prev.filter((el) => el.id !== selectedElement));
    setSelectedElement(null);
  };

  const resetToTemplate = () => {
    setTextElements(
      template.textElements.map((el) => ({
        ...el,
        id: Date.now().toString() + Math.random(),
      }))
    );
    setSelectedElement(null);
  };

  const saveMeme = () => {
    alert("Meme saved! (This would download the image)");
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="btn btn-ghost btn-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Templates
        </button>
        <div>
          <h1 className="text-3xl font-bold">Editing: {template.name}</h1>
          <p className="text-base-content/70">{template.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas Area */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <div className="mb-4 flex justify-start">
                <Canvas
                  image={image}
                  textElements={textElements}
                  selectedElement={selectedElement}
                  onElementSelect={setSelectedElement}
                  onElementMove={moveElement}
                  ref={canvasRef}
                  onElementRotate={(id, rotation) => {
                    // Update the text element's rotation
                    setTextElements((elements) =>
                      elements.map((el) =>
                        el.id === id ? { ...el, rotation } : el
                      )
                    );
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button onClick={addText} className="btn btn-primary w-full">
                  <Plus className="w-4 h-4" />
                  Add Text
                </button>
                <button
                  onClick={resetToTemplate}
                  className="btn btn-neutral w-full"
                >
                  Reset to Template
                </button>
                <button onClick={saveMeme} className="btn btn-success w-full">
                  <Download className="w-4 h-4" />
                  Generate Meme
                </button>
              </div>
            </div>
          </div>

          {/* Text Elements */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h3 className="font-semibold mb-4">Text Elements</h3>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {textElements.map((element, index) => (
                  <div
                    key={element.id}
                    className={`p-3 rounded border ${
                      selectedElement === element.id
                        ? "border-primary bg-primary/10"
                        : "border-base-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">Text {index + 1}</span>
                      <button
                        onClick={() =>
                          setSelectedElement(
                            selectedElement === element.id ? null : element.id
                          )
                        }
                        className="btn btn-xs btn-ghost"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>

                    <textarea
                      placeholder="Enter your meme text..."
                      className="textarea textarea-sm textarea-bordered w-full mb-2 min-h-20"
                      value={element.text}
                      onChange={(e) => {
                        setSelectedElement(element.id);
                        updateSelectedText("text", e.target.value);
                      }}
                      onFocus={() => setSelectedElement(element.id)}
                    />

                    {selectedElement === element.id && (
                      <div className="space-y-2 pt-2 border-t border-base-300">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="label-text text-xs">
                              Font Size
                            </label>
                            <input
                              type="range"
                              min="12"
                              max="72"
                              className="range range-sm"
                              value={element.fontSize}
                              onChange={(e) =>
                                updateSelectedText(
                                  "fontSize",
                                  parseInt(e.target.value)
                                )
                              }
                            />
                            <div className="text-xs text-center">
                              {element.fontSize}px
                            </div>
                          </div>
                          <div>
                            <label className="label-text text-xs">Color</label>
                            <input
                              type="color"
                              className="input input-xs input-bordered w-full h-8"
                              value={element.color}
                              onChange={(e) =>
                                updateSelectedText("color", e.target.value)
                              }
                            />
                          </div>
                        </div>

                        <select
                          className="select select-sm select-bordered w-full"
                          value={element.fontFamily}
                          onChange={(e) =>
                            updateSelectedText("fontFamily", e.target.value)
                          }
                        >
                          <option value="Arial">Arial</option>
                          <option value="Impact">Impact</option>
                          <option value="Times New Roman">
                            Times New Roman
                          </option>
                          <option value="Comic Sans MS">Comic Sans MS</option>
                          <option value="Courier New">Courier New</option>
                        </select>

                        <button
                          onClick={deleteSelectedElement}
                          className="btn btn-xs btn-error w-full"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete Element
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {textElements.length === 0 && (
                <div className="text-center text-base-content/60 py-8">
                  No text elements.
                  <br />
                  Add some text to start creating your meme!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
