import React, { useEffect } from "react";
import { toTitleCase } from "../utilities/utils";
import type { Template } from "../components/types";
import TextPanel from "../components/memegen/textpanel";
import Faq from "../components/main/faq";
import { useFabric } from "../hooks/usecase/use-fabric";

export const MemeGenerator: React.FC<{ template: Template }> = ({ template }) => {
  const {
    canvasRef,
    setBackgroundImage,
    textElements,
    selectedElement,
    setSelectedElement,
    addTextElement,
    deleteSelectedElement,
    loadTemplate,
    textManager,
    downloadCanvas
  } = useFabric({
    watermarkConfig: {
      text: "postrugphotos.xyz",
      mode: "download-only", // or "disabled" or "always"
      position: "bottom-left",
      fontSizeRatio: 0.02,
    },
  });

  // Initialize the template
  useEffect(() => {
    // Load text elements
    loadTemplate({ textElements: template.textElements });

    // Load background image
    const img = new Image();
    img.onload = async () => {
      await setBackgroundImage(template.imageUrl);
    };
    img.src = template.imageUrl;
  }, [template]);

  const resetToTemplate = () => {
    loadTemplate({ textElements: template.textElements });
    setSelectedElement(null);
  };

  return (
    <div className="p-0 lg:p-4 md:p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Meme Generator</h1>

      <div className="flex card bg-base-100 shadow-sm">
        <div className="card-body join join-vertical lg:join-horizontal">
          {/* Canvas Area */}
          <div className="flex-2 join-item items-center">
            <div className="w-full gap-4 items-center">
              <h1 className="text-3xl font-bold flex-shrink-0">
                {toTitleCase(template.name)}
              </h1>
              <p className="text-base-content/70 truncate min-w-0 flex-1 md:max-w-[40vw] max-w-[80vw]">
                {template.description}
              </p>
            </div>

            <div className="mb-4 flex justify-start">
              <canvas ref={canvasRef} />
            </div>
          </div>

          <div className="divider lg:divider-horizontal"></div>

          {/* Text Editor */}
          <TextPanel
            textElements={textElements}
            selectedElement={selectedElement}
            setSelectedElement={setSelectedElement}
            addText={addTextElement}
            deleteSelectedElement={deleteSelectedElement}
            textManager={textManager}
            // resetToTemplate={resetToTemplate}
            onResetTemplate={resetToTemplate}
            onSave={downloadCanvas}
            // image={!!image} // boolean check only
          />
        </div>
      </div>

      <Faq />
    </div>
  );
};

export default MemeGenerator;
