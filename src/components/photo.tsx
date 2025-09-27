import React, { useRef, useState } from "react";
import type { TextElement } from "./memegen/textelement";
// import Canvas from "./memegen/canvas";
import TextPanel from "./memegen/textpanel";
import Faq from "./memegen/faq";
import FileUpload from "./memegen/fileupload";
import Canvas, { type CanvasHandle } from "./memegen/canvas";

// Main Photo Editor Component
const PhotoEditor: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const canvasRef = useRef<CanvasHandle>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const addText = () => {
    const newElement: TextElement = {
      id: Date.now().toString(),
      text: "",
      x: 50,
      y: 50 + textElements.length * 40,
      fontSize: 24, // change to  a uee state later
      color: "#ffffff", // change to a use state later
      fontFamily: "Arial", // change to a use state later
      rotation:0,
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

  return (
    <div className="p-0 lg:p-4 md:p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Meme Generator</h1>
      <div className="flex card bg-base-200 shadow-sm">
        <div className="card-body join join-vertical lg:join-horizontal">
          {/* Main Editor */}
          <div className="flex-2 join-item items-center ">
            {/* Upload Controls going to remove thi soon in place for selecting the image */}
            <div className="mb-4 flex items-start">
              <FileUpload ref={fileInputRef} onChange={handleImageUpload} />
            </div>
            {/* <div className="divider "></div> */}

            {/* Canvas */}
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
                    setTextElements(elements => 
                      elements.map(el => 
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
            onSave={() => canvasRef.current?.saveImage()} 
          />
        </div>
      </div>
      {/* Variants later */}
      <Faq />
    </div>
  );
};

export default PhotoEditor;
