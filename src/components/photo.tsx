import React, { useRef, useState } from 'react';
import type { TextElement } from './memegen/textelement';
import Canvas from './memegen/canvas';
import TextPanel from './memegen/textpanel';
import Faq from './memegen/faq';
import FileUpload from './memegen/fileupload';

// Main Photo Editor Component
const PhotoEditor: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

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
      text: '',
      x: 50,
      y: 50 + (textElements.length * 40),
      fontSize: 24, // change to  a uee state later
      color: '#ffffff', // change to a use state later 
      fontFamily: 'Arial' // change to a use state later
    };
    
    setTextElements([...textElements, newElement]);
    setSelectedElement(newElement.id);
  };

  const updateSelectedText = (field: keyof TextElement, value: string | number) => {
    if (!selectedElement) return;
    
    setTextElements(prev => 
      prev.map(element => 
        element.id === selectedElement 
          ? { ...element, [field]: value }
          : element
      )
    );
  };

  const moveElement = (id: string, x: number, y: number) => {
    setTextElements(prev => 
      prev.map(element => 
        element.id === id 
          ? { ...element, x, y }
          : element
      )
    );
  };

  const deleteSelectedElement = () => {
    if (!selectedElement) return;
    setTextElements(prev => prev.filter(el => el.id !== selectedElement));
    setSelectedElement(null);
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Simple Photo Editor</h1>
      
      <div className="flex gap-6">
        {/* Main Editor */}
        <div className="flex-1">
          {/* Upload Controls */}
          <div className="mb-4">
            {/* <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="mb-2 file-input file-input-ghost"
            /> */}
            <FileUpload
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
          </div>
          
          {/* Canvas */}
          <Canvas 
            image={image}
            textElements={textElements}
            selectedElement={selectedElement}
            onElementSelect={setSelectedElement}
            onElementMove={moveElement}
            onSave={() => {}}
          />
        </div>
        
        {/* Text Management Panel */}
        <TextPanel 
          textElements={textElements}
          selectedElement={selectedElement}
          onAddText={addText}
          onElementSelect={setSelectedElement}
          onUpdateElement={updateSelectedText}
          onDeleteElement={deleteSelectedElement}
        />
      </div>

      {/* Variants later */}
      
      <Faq />
    </div>
  );
};

export default PhotoEditor;