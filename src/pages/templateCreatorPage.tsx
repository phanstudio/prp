import React, { useRef, useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import type { TextElement, Template } from "../components/types";
import TemplateEditor from "../components/templateEditor";
import Canvas, { type CanvasHandle } from "../components/memegen/canvas";
import TemplateService from "../services/templateService";
import { useToast } from '../services/ToastProvider';

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
  const { addToast, removeToast } = useToast();

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
    img.crossOrigin = "anonymous"; // 👈 Important
    img.src = templateToEdit.imageUrl;
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
      prev.map((el) => (el.id === selectedElement ? { ...el, [field]: value } : el))
    );
  };

  const moveElement = (id: string, x: number, y: number) => {
    setTextElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, x, y } : el))
    );
  };

  const handleClear = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // clears the file input
    }
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

  const saveTemplate = async () => {
    if (!image || !templateName.trim()) {
      alert("Please provide an image and template name");
      return;
    }
    addToast('initallizing Template!', 'info', 3000);

    const canvas = canvasRef.current;
      if (!canvas) return;
      const { background, edited } = await canvas.saveFiles();
      if (!background || !edited) return;

    const templateData = {
      name: templateName.trim(),
      description: templateDescription.trim(),
      imageUrl: image.src,
      thumbnailUrl: image.src,
      textElements,
      tags: templateTags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    let loadingToast = "0"
    if (templateToEdit) {
      loadingToast = addToast(`Updating Template: ${templateName.trim().substring(0, 10)}`, 'loading', 0);
      // Update existing template
      await TemplateService.updateTemplate(templateToEdit.id.toString(), templateData, edited);
    } else {
      loadingToast = addToast(`Creating Template: ${templateName.trim().substring(0, 10)}`, 'loading', 0);
      await TemplateService.saveTemplate(templateData, background, edited);
      // Reset form
      setImage(null);
      setTextElements([]);
      setTemplateName("");
      setTemplateDescription("");
      setTemplateTags("");
      setSelectedElement(null);
      handleClear();
      
    }
    addToast('Template saved successfully!', 'success', 3000);
    removeToast(loadingToast, true);    
  };
  // text-center

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <button onClick={onBack} className="btn btn-ghost btn-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Gallery
        </button>
        <h1 className="text-3xl font-bold flex-1 ">
          {templateToEdit ? "Edit Template" : "Create Template"}
        </h1>
      </div>
      {/* <div className="divider"></div> */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas Area */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Design Area</h2>


              { !templateToEdit && (
                <>
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
                </>
              )}
              

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
