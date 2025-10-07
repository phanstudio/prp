import React, { useRef, useState, useEffect } from "react";
import type { TextElement, Template } from "../components/types";
import TextPanel from "../components/memegen/textpanel";
import Faq from "../components/memegen/faq";
import Canvas, { type CanvasHandle } from "../components/memegen/canvas";
import { toTitleCase } from "../utilities/utils";

export const MemeGenerator: React.FC<{ template: Template}> = ({ template }) => {
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
    img.crossOrigin = "anonymous"; // 👈 Important
    img.src = template.imageUrl;
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
      outlineColor: "#000000",
      outlineSize: 1,
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

  return (
    <div className="p-0 lg:p-4 md:p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Meme Generator</h1>
      <div className="flex card bg-base-100 shadow-sm">
        <div className="card-body join join-vertical lg:join-horizontal">
          {/* Main Editor */}
          <div className="flex-2 join-item items-center ">
            <div className="w-full gap-4 items-center">
              <h1 className="text-3xl font-bold flex-shrink-0">
                {toTitleCase(template.name)}
              </h1>
              <p className="text-base-content/70 truncate min-w-0 flex-1 md:max-w-[40vw] max-w-[80vw]">
                {template.description}
              </p>
            </div>
            {/* change to center later */}
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

          <div className="divider lg:divider-horizontal"></div>

          {/* Text Management Panel */}
          <TextPanel
            textElements={textElements}
            selectedElement={selectedElement}
            onAddText={addText}
            onElementSelect={setSelectedElement}
            onUpdateElement={updateSelectedText}
            onDeleteElement={deleteSelectedElement}
            classname="join-item rounded-sm flex-1"
            // "w-80 p-4 max-w-150"
            onResetTemplate={resetToTemplate}
            onSave={() => {
              canvasRef.current?.saveImage();
              setSelectedElement(null);
            }}
          />
        </div>
      </div>
      {/* Variants later */}
      <Faq />
    </div>
  );
};