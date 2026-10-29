import React, { useRef, useState, useEffect } from "react";
import { ArrowLeft, Settings, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import type { Template } from "../components/types";
import TemplateEditor from "../components/templateEditor";
import TemplateService from "../services/templateService";
import { useToast } from "../services/ToastProvider";
import { useKonva } from "../hooks/usecase/use-konva";
import { useTemplateInfo } from "../hooks/useTemplateInfo";
import { serializeTextElements } from "../utilities/serializeTextElement";
import {
  getPostCreatePreference,
  getPostCreatePreferenceDetails,
  setPostCreatePreference,
  clearPostCreatePreference,
  getKeepImagePreference,
  setKeepImagePreference,
} from "../utilities/postCreateAction";

interface TemplateCreatorProps {
  onBack: () => void;
  templateToEdit?: Template;
}

export const TemplateCreator: React.FC<TemplateCreatorProps> = ({
  onBack,
  templateToEdit,
}) => {
  const {
    StageCanvas,
    setBackgroundImage,
    textElements,
    selectedElement,
    setSelectedElement,
    addTextElement,
    deleteSelectedElement,
    loadTemplate,
    saveFiles,
    textManager,
  } = useKonva();

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
  const uploadedFileRef = useRef<File | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const { addToast, removeToast } = useToast();

  // Post-create modal & settings state
  const [showPostSaveModal, setShowPostSaveModal] = useState(false);
  const [rememberChoice, setRememberChoice] = useState(false);
  const [prefDetails, setPrefDetails] = useState(() => getPostCreatePreferenceDetails());
  const [keepImagePref, setKeepImagePrefState] = useState(() => getKeepImagePreference());

  // Load existing template if editing
  useEffect(() => {
    if (!templateToEdit) return;

    setTemplateName(templateToEdit.name);
    setTemplateDescription(templateToEdit.description || "");
    setTemplateTags((templateToEdit.tags || []).join(", "));

    // Load template text into canvas
    const rawElements = templateToEdit.textElements ?? (templateToEdit as any).text_elements ?? [];
    loadTemplate({ textElements: rawElements });

    // Load background image
    const bgUrl = templateToEdit.imageUrl || (templateToEdit as any).image_url;
    if (bgUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = async () => {
        setImage(img);
        await setBackgroundImage(bgUrl);
      };
      img.src = bgUrl;
    }
  }, [templateToEdit, loadTemplate, setBackgroundImage, setTemplateName, setTemplateDescription, setTemplateTags]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadedFileRef.current = file;
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

  const handleClearFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetToTemplate = () => {
    if (!templateToEdit) return;
    const rawElements = templateToEdit.textElements ?? (templateToEdit as any).text_elements ?? [];
    loadTemplate({ textElements: rawElements });
    setSelectedElement(null);
  };

  // Perform a full reset (or keep background image if user preference is enabled)
  const resetAll = (overrideKeepImage?: boolean) => {
    const keepImage = overrideKeepImage !== undefined ? overrideKeepImage : getKeepImagePreference();

    if (!keepImage) {
      setImage(null);
      uploadedFileRef.current = null;
      setBackgroundImage("");
      handleClearFileInput();
    }

    resetTemplateInfo();
    setSelectedElement(null);
    loadTemplate({ textElements: [] });
  };

  const saveTemplate = async () => {
    if (!image || !templateName.trim()) {
      addToast("Please provide an image and template name", "error", 3000);
      return;
    }
    const initToast = addToast("Initializing Template!", "info", 0);

    // Save files (background and edited thumbnail)
    const { background, edited } = await saveFiles();
    if (!edited) {
      removeToast(initToast, true);
      addToast("Failed to generate edited template canvas", "error", 3000);
      return;
    }

    const currentTextElements = textManager.getAllTextElements();

    const templateData = {
      name: templateName.trim(),
      description: templateDescription.trim(),
      imageUrl: templateToEdit?.imageUrl || (image.src.startsWith("http") ? image.src : ""),
      thumbnailUrl: templateToEdit?.thumbnailUrl || (image.src.startsWith("http") ? image.src : ""),
      textElements: serializeTextElements(currentTextElements),
      tags: templateTags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    let loadingToast = "0";

    try {
      removeToast(initToast, true);
      if (templateToEdit) {
        // Edit mode: only updating text/metadata and new thumbnail. Do not replace base image.
        loadingToast = addToast(
          `Updating Template: ${templateName.trim().substring(0, 15)}...`,
          "loading",
          0
        );

        await TemplateService.updateTemplate(
          templateToEdit.id.toString(),
          templateData,
          edited
        );

        removeToast(loadingToast, true);
        addToast("Template updated successfully!", "success", 3000);

        // In edit mode: do NOT wipe the editor! Keep everything loaded.
        return;
      }

      // Create mode
      loadingToast = addToast(
        `Creating Template: ${templateName.trim().substring(0, 15)}...`,
        "loading",
        0
      );

      const bgFileToUpload = uploadedFileRef.current || background;
      if (!bgFileToUpload) {
        removeToast(loadingToast, true);
        addToast("Background image file is missing", "error", 3000);
        return;
      }

      await TemplateService.saveTemplate(templateData, bgFileToUpload, edited);
      removeToast(loadingToast, true);
      addToast("Template created successfully!", "success", 3000);

      // Check saved user preference for post-creation action
      const savedPref = getPostCreatePreference();
      if (savedPref === "gallery") {
        onBack();
      } else if (savedPref === "continue") {
        resetAll();
        addToast("Canvas ready for next template!", "info", 2500);
      } else {
        setShowPostSaveModal(true);
      }
    } catch (error) {
      removeToast(loadingToast, true);
      addToast("Failed to save template. Please try again.", "error", 3000);
      console.error("Error saving template:", error);
    }
  };

  const handleToggleKeepImage = (keep: boolean) => {
    setKeepImagePreference(keep);
    setKeepImagePrefState(keep);
    addToast(
      keep
        ? "Preference saved: Keep background image when creating another"
        : "Preference saved: Clear everything including image",
      "info",
      2500
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4 flex-col lg:flex-row sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="btn btn-sm btn-ghost gap-1 border border-base-300">
            <ArrowLeft className="w-4 h-4" />
            Back to Gallery
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {templateToEdit ? "Edit Template" : "Create Template"}
          </h1>
        </div>

        {/* Post-creation Preferences Quick Dropdown */}
        <div className="flex items-center gap-2">
          <Link to="/settings" className="btn btn-sm btn-ghost gap-1 border border-base-300">
            <Settings className="w-4 h-4" />
            <span className="text-xs">Settings</span>
          </Link>

          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-sm btn-ghost gap-1 border border-base-300">
              <span className="text-xs">Quick Prefs</span>
            </button>
            <div
              tabIndex={0}
              className="dropdown-content z-30 menu p-4 shadow-2xl bg-base-100 rounded-box w-80 text-xs border border-base-300 mt-1 space-y-3"
            >
              <div>
                <div className="font-bold text-sm mb-1">After Saving Template</div>
                <p className="text-base-content/70 text-[11px] mb-2">
                  {prefDetails
                    ? `Saved: ${
                        prefDetails.action === "gallery" ? "Always go to Gallery" : "Always stay & create another"
                      } (expires in ${prefDetails.daysRemaining} days)`
                    : "Currently: Ask each time via popup"}
                </p>
                {prefDetails ? (
                  <button
                    onClick={() => {
                      clearPostCreatePreference();
                      setPrefDetails(null);
                      addToast("Preference cleared: Will prompt each time", "info", 2500);
                    }}
                    className="btn btn-xs btn-error btn-outline w-full"
                  >
                    Reset to Ask Each Time
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => {
                        setPostCreatePreference("gallery", true);
                        setPrefDetails(getPostCreatePreferenceDetails());
                        addToast("Saved: Always go to Gallery", "success", 2500);
                      }}
                      className="btn btn-xs btn-outline"
                    >
                      Always Gallery
                    </button>
                    <button
                      onClick={() => {
                        setPostCreatePreference("continue", true);
                        setPrefDetails(getPostCreatePreferenceDetails());
                        addToast("Saved: Always stay & continue", "success", 2500);
                      }}
                      className="btn btn-xs btn-outline"
                    >
                      Always Continue
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-base-300">
                <div className="font-bold text-sm mb-1">On Create Another</div>
                <label className="label cursor-pointer justify-start gap-2 p-0 py-1">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-xs checkbox-primary"
                    checked={keepImagePref}
                    onChange={(e) => handleToggleKeepImage(e.target.checked)}
                  />
                  <span className="label-text text-xs">Keep background image on reset</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="card-title text-base sm:text-lg">Canvas Preview</h2>
                {image && (
                  <span className="badge badge-sm badge-success gap-1">
                    <ImageIcon className="w-3 h-3" /> Image Loaded
                  </span>
                )}
              </div>

              {/* Background Image Upload (Hidden in edit mode to preserve base template image) */}
              {!templateToEdit ? (
                <div className="mb-4">
                  <label className="label py-1 text-xs font-semibold">
                    Upload Background Image *
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="file-input file-input-bordered w-full file-input-sm"
                  />
                </div>
              ) : (
                <div className="mb-3 px-3 py-2 bg-base-200/60 rounded text-xs text-base-content/70 flex items-center justify-between">
                  <span>Base template image is preserved. Edits update the meme text layout & thumbnail.</span>
                </div>
              )}

              {/* Konva Stage Canvas / Dropzone */}
              <div className="flex justify-center items-center w-full min-h-[350px] bg-base-200/40 rounded-lg p-2 overflow-hidden border border-base-300">
                {image ? (
                  <StageCanvas className="shadow-lg rounded block" />
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="text-center p-10 text-base-content/60 hover:text-primary hover:bg-base-200/80 rounded-lg cursor-pointer border-2 border-dashed border-base-300 hover:border-primary/50 transition-all w-full max-w-md mx-auto my-6"
                    title="Click to choose an image"
                  >
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-bold text-base-content/80">Click to Select Background Image</p>
                    <p className="text-xs text-base-content/50 mt-1">Supports PNG, JPG, WEBP, GIF</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="lg:col-span-1">
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
            onResetAll={resetAll}
            toEdit={templateToEdit !== null && templateToEdit !== undefined}
            image={image}
          />
        </div>
      </div>

      {/* Post-Save Modal for Create Mode */}
      {showPostSaveModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md border border-base-300 shadow-2xl">
            <h3 className="font-bold text-lg text-success flex items-center gap-2">
              Template Created Successfully!
            </h3>
            <p className="py-3 text-sm text-base-content/80">
              Where would you like to go next?
            </p>

            <div className="form-control mb-4 bg-base-200/50 p-2.5 rounded-lg border border-base-300">
              <label className="label cursor-pointer justify-start gap-2 p-0">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-primary"
                  checked={rememberChoice}
                  onChange={(e) => setRememberChoice(e.target.checked)}
                />
                <span className="label-text text-xs">
                  Remember my choice for 1 week (can be changed anytime in Settings)
                </span>
              </label>
            </div>

            <div className="modal-action flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowPostSaveModal(false)}
                className="btn btn-ghost btn-sm"
              >
                Stay Here
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPostCreatePreference("continue", rememberChoice);
                    if (rememberChoice) setPrefDetails(getPostCreatePreferenceDetails());
                    setShowPostSaveModal(false);
                    resetAll();
                    addToast("Canvas ready for next template!", "info", 2500);
                  }}
                  className="btn btn-outline btn-sm"
                >
                  Create Another
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPostCreatePreference("gallery", rememberChoice);
                    if (rememberChoice) setPrefDetails(getPostCreatePreferenceDetails());
                    setShowPostSaveModal(false);
                    onBack();
                  }}
                  className="btn btn-primary btn-sm"
                >
                  Back to Gallery
                </button>
              </div>
            </div>
          </div>
          <div
            className="modal-backdrop bg-black/50"
            onClick={() => setShowPostSaveModal(false)}
          ></div>
        </div>
      )}
    </div>
  );
};

export default TemplateCreator;