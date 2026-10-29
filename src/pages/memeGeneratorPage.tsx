import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Heart } from "lucide-react";
import { toTitleCase } from "../utilities/utils";
import type { Template } from "../components/types";
import TextPanel from "../components/memegen/textpanel";
import Faq from "../components/main/faq";
import { useKonva } from "../hooks/usecase/use-konva";
import { useTemplateLikes } from "../hooks/useTemplateLikes";

export const MemeGenerator: React.FC<{ template: Template }> = ({ template }) => {
  const navigate = useNavigate();
  const { isLiked, getLikesCount, toggleLike } = useTemplateLikes();

  const {
    StageCanvas,
    setBackgroundImage,
    textElements,
    selectedElement,
    setSelectedElement,
    addTextElement,
    deleteSelectedElement,
    loadTemplate,
    textManager,
    downloadCanvas,
    copyCanvasToClipboard,
  } = useKonva({
    watermarkConfig: {
      text: "postrugphotos.xyz",
      mode: "download-only",
      position: "bottom-left",
    },
  });

  // Initialize the template
  useEffect(() => {
    loadTemplate({ textElements: template.textElements });
    if (template.imageUrl) {
      setBackgroundImage(template.imageUrl);
    }
  }, [template, loadTemplate, setBackgroundImage]);

  const resetToTemplate = () => {
    loadTemplate({ textElements: template.textElements });
    setSelectedElement(null);
  };

  const liked = isLiked(template.id);
  const likes = getLikesCount(template.id);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Navigation & Info Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-base-300 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="btn btn-sm btn-ghost gap-1.5 border border-base-300 btn-press"
          >
            <ArrowLeft className="w-4 h-4 text-base-content/70" />
            Templates
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              {toTitleCase(template.name)}
            </h1>
            {template.description && (
              <p className="text-xs text-base-content/70 mt-0.5 line-clamp-1">
                {template.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Liking mechanic directly in meme editor */}
          <button
            type="button"
            onClick={() => toggleLike(template.id)}
            className={`btn btn-sm btn-ghost gap-1.5 border border-base-300 btn-press ${
              liked ? "text-error border-error/30" : "text-base-content/70"
            }`}
            title={liked ? "Unlike template" : "Like template"}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${
                liked ? "fill-error text-error scale-110 heart-pop" : "text-base-content/60"
              }`}
            />
            <span className="font-mono text-xs">{likes}</span>
          </button>

          {template.tags && template.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {template.tags.map((t) => (
                <span key={t} className="badge badge-sm badge-outline">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Canvas Area */}
        <div className="lg:col-span-2 card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-base-content/80 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                Live Canvas Preview
              </h2>
              <span className="text-[11px] text-base-content/50">
                Click text to drag or resize
              </span>
            </div>

            <div
              className="flex justify-center items-center w-full min-h-[350px] bg-base-200/50 rounded-lg p-2 overflow-hidden border border-base-300"
              id="canvas-wrapper"
            >
              <StageCanvas className="shadow-lg rounded block" />
            </div>
          </div>
        </div>

        {/* Text Captions & Controls Panel */}
        <div className="lg:col-span-1 card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4 sm:p-5">
            <TextPanel
              textElements={textElements}
              selectedElement={selectedElement}
              setSelectedElement={setSelectedElement}
              addText={addTextElement}
              deleteSelectedElement={deleteSelectedElement}
              textManager={textManager}
              onResetTemplate={resetToTemplate}
              onSave={downloadCanvas}
              onCopy={copyCanvasToClipboard}
            />
          </div>
        </div>
      </div>

      <Faq />
    </div>
  );
};
