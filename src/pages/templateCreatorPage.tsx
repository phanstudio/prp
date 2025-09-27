import React, { useRef, useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import type { TextElement, Template } from "../components/types";
import TemplateService from "../components/templateService";
import TemplateEditor from "../components/templateEditor";
import Canvas, { type CanvasHandle } from "../components/memegen/canvas";

interface TemplateCreatorProps {
  onBack: () => void;
  templateToEdit?: Template; // Optional: if passed, we're editing
}
// # we need to add delete for this
export const TemplateCreator: React.FC<TemplateCreatorProps> = ({
  onBack,
  templateToEdit,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateTags, setTemplateTags] = useState("");
  const canvasRef = useRef<CanvasHandle>(null);

  // Load existing template if editing
  useEffect(() => {
    if (!templateToEdit) return;

    setTemplateName(templateToEdit.name);
    setTemplateDescription(templateToEdit.description || "");
    setTemplateTags((templateToEdit.tags || []).join(", "));

    setTextElements(
      templateToEdit.textElements.map((el) => ({
        ...el,
        id: Date.now().toString() + Math.random(), // unique id for Canvas
      }))
    );

    const img = new Image();
    img.onload = () => setImage(img);
    img.src = templateToEdit.image;
  }, [templateToEdit]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => setImage(img);
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

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
      prev.map((el) => (el.id === selectedElement ? { ...el, [field]: value } : el))
    );
  };

  const moveElement = (id: string, x: number, y: number) => {
    setTextElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, x, y } : el))
    );
  };

  const deleteSelectedElement = () => {
    if (!selectedElement) return;
    setTextElements((prev) => prev.filter((el) => el.id !== selectedElement));
    setSelectedElement(null);
  };

  const resetToTemplate = () => {
    if (!templateToEdit) return;

    setTextElements(
      templateToEdit.textElements.map((el) => ({
        ...el,
        id: Date.now().toString() + Math.random(),
      }))
    );
    setSelectedElement(null);
  };

  const saveTemplate = () => {
    if (!image || !templateName.trim()) {
      alert("Please provide an image and template name");
      return;
    }

    const templateData = {
      name: templateName.trim(),
      description: templateDescription.trim(),
      image: image.src,
      textElements,
      tags: templateTags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    if (templateToEdit) {
      // Update existing template
      TemplateService.updateTemplate(templateToEdit.id, templateData);
      alert("Template updated successfully!");
    } else {
      // Save new template
      TemplateService.saveTemplate(templateData);
      alert("Template saved successfully!");
      // Reset form
      setImage(null);
      setTextElements([]);
      setTemplateName("");
      setTemplateDescription("");
      setTemplateTags("");
      setSelectedElement(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="btn btn-ghost btn-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Gallery
        </button>
        <h1 className="text-3xl font-bold">
          {templateToEdit ? "Edit Template" : "Create Template"}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas Area */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Design Area</h2>

              {/* Image Upload */}
              <div className="mb-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="file-input file-input-bordered w-full"
                />
              </div>

              {/* Canvas */}
              <div className="mb-4 flex justify-start">
                <Canvas
                  image={image}
                  textElements={textElements}
                  selectedElement={selectedElement}
                  onElementSelect={setSelectedElement}
                  onElementMove={moveElement}
                  ref={canvasRef}
                  onElementRotate={(id, rotation) =>
                    setTextElements((prev) =>
                      prev.map((el) => (el.id === id ? { ...el, rotation } : el))
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <TemplateEditor
          templateName={templateName}
          setTemplateName={setTemplateName}
          templateDescription={templateDescription}
          setTemplateDescription={setTemplateDescription}
          templateTags={templateTags}
          setTemplateTags={setTemplateTags}
          textElements={textElements}
          selectedElement={selectedElement}
          setSelectedElement={setSelectedElement}
          addText={addText}
          updateSelectedText={updateSelectedText}
          deleteSelectedElement={deleteSelectedElement}
          saveTemplate={saveTemplate}
          resetToTemplate={resetToTemplate}
          toEdit={(templateToEdit !== null && templateToEdit !== undefined)}
          image={image}
        />
      </div>
    </div>
  );
};
