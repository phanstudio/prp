import React, { useRef, useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import type { Template } from "../components/types";
import TemplateEditor from "../components/templateEditor";
import TemplateService from "../services/templateService";
import { useToast } from '../services/ToastProvider';
import { useFabric } from "../hooks/usecase/use-fabric";
import { useTemplateInfo } from "../hooks/useTemplateInfo"
import { serializeTextElements } from "../utilities/serializeTextElement";

interface TemplateCreatorProps {
  onBack: () => void;
  templateToEdit?: Template;
}

export const TemplateCreator: React.FC<TemplateCreatorProps> = ({
  onBack,
  templateToEdit,
}) => {
  const {
    canvasRef,
    setBackgroundImage,
    textElements,
    selectedElement,
    setSelectedElement,
    addTextElement,
    deleteSelectedElement,
    loadTemplate,
    saveFiles,
    textManager
  } = useFabric();

  const {
    templateName,
    setTemplateName,
    templateDescription,
    setTemplateDescription,
    templateTags,
    setTemplateTags,
    resetTemplateInfo,
  } = useTemplateInfo();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const { addToast, removeToast } = useToast();

  // Load existing template if editing
  useEffect(() => {
    if (!templateToEdit) return;

    setTemplateName(templateToEdit.name);
    setTemplateDescription(templateToEdit.description || "");
    setTemplateTags((templateToEdit.tags || []).join(", "));

    // Load template into fabric canvas
    loadTemplate({ textElements: templateToEdit.textElements });

    // Load background image
    const img = new Image();
    img.onload = async () => {
      setImage(img);
      await setBackgroundImage(templateToEdit.imageUrl);
    };
    // img.crossOrigin = "anonymous"; // check later
    img.src = templateToEdit.imageUrl;
  }, [templateToEdit]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageUrl = event.target?.result as string;
      await setBackgroundImage(imageUrl);
      
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => setImage(img);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetToTemplate = () => { // might not work with names a desc
    if (!templateToEdit) return;
    // setTemplateName(templateToEdit.name); if i want to reste name desc and tags
    loadTemplate({ textElements: templateToEdit.textElements });
    setSelectedElement(null);
  };

  const saveTemplate = async () => {
    if (!image || !templateName.trim()) {
      addToast("Please provide an image and template name", "error", 3000);
      return;
    }
    const initToast = addToast('Initializing Template!', 'info', 0);

    // Save files (background and edited version)
    const {background, edited} = await saveFiles();
    if (!background || !edited) {
      removeToast(initToast, true);
      addToast("Failed to save template files", "error", 3000);
      return;
    }

    const currentTextElements = textManager.getAllTextElements();

    const templateData = {
      name: templateName.trim(),
      description: templateDescription.trim(),
      imageUrl: image.src,
      thumbnailUrl: image.src,
      textElements: serializeTextElements(currentTextElements),
      tags: templateTags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    let loadingToast = "0";

    // console.log(templateData);
    
    try {
      removeToast(initToast, true);
      if (templateToEdit) {
        loadingToast = addToast(
          `Updating Template: ${templateName.trim().substring(0, 10)}`,
          'loading',
          0
        );
        await TemplateService.updateTemplate(
          templateToEdit.id.toString(),
          templateData,
          edited
        );
      } else {
        loadingToast = addToast(
          `Creating Template: ${templateName.trim().substring(0, 10)}`,
          'loading',
          0
        );
        await TemplateService.saveTemplate(templateData, background, edited);
        
        // Reset form for new template
        setImage(null);
        resetTemplateInfo();
        setSelectedElement(null);
        handleClear();
      }
      
      addToast('Template saved successfully!', 'success', 3000);
      removeToast(loadingToast, true);
    } catch (error) {
      removeToast(loadingToast, true);
      addToast('Failed to save template', 'error', 3000);
      console.error("Error saving template:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4 flex-col lg:flex-row sm:items-center">
        <button onClick={onBack} className="btn btn-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Gallery
        </button>
        <h1 className="text-3xl font-bold flex-1">
          {templateToEdit ? "Edit Template" : "Create Template"}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas Area */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Design Area</h2>

              {!templateToEdit && (
                <div className="mb-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="file-input file-input-bordered w-full"
                  />
                </div>
              )}

              {/* Canvas */}
              {/* <div className="mb-4 flex justify-start">
                <canvas ref={canvasRef} />
              </div> */}
              <div className="mb-4 flex justify-center items-start w-full">
                <canvas ref={canvasRef} className="block" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <TemplateEditor
          templateInfo={{
            templateName,
            setTemplateName,
            templateDescription,
            setTemplateDescription,
            templateTags,
            setTemplateTags,
            resetTemplateInfo,
          }}
          textElements={textElements}
          selectedElement={selectedElement}
          setSelectedElement={setSelectedElement}
          addText={addTextElement}

          textManager={textManager}
          deleteSelectedElement={deleteSelectedElement}
          saveTemplate={saveTemplate}
          resetToTemplate={resetToTemplate}
          toEdit={templateToEdit !== null && templateToEdit !== undefined}
          image={image} // the only use is to check if the kmage exsist change to a boolean
        />
      </div>
    </div>
  );
};

export default TemplateCreator;