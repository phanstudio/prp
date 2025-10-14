import { useRef, useEffect, useState } from "react";
import { Canvas, Textbox, FabricImage } from "fabric";
import { createTextManager } from "../../hooks/usecase/text-manager";
import { CanvasFileGenerator, type CanvasFileOptions } from "./modules/canvas-file-generator"
import { WatermarkManager, type WatermarkConfig } from "./modules/use-watermark"
import { enableTextboxHoverOutline } from "./modules/textbox-hover-outline"
import { makeTextboxResizable } from "./modules/fixed-size-textbox"
import { deserializeTextElement } from "../../utilities/deserializeTextElements";

const CANVAS_DIMENSIONS = {
  default: 600,
  mobileMultiplier: 0.9,
};

interface UseFabricOptions {
  watermarkConfig?: WatermarkConfig
}

export function useFabric(options?: UseFabricOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const textManagerRef = useRef(createTextManager());
  
  const [textElements, setTextElements] = useState<any[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
  });

  const fileGeneratorRef = useRef<CanvasFileGenerator | null>(null)
  const watermarkManagerRef = useRef<WatermarkManager | null>(null)

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: CANVAS_DIMENSIONS.default,
      height: CANVAS_DIMENSIONS.default,
      backgroundColor: "#f0f0f0",
    });

    // Initialize watermark if config provided
    if (options?.watermarkConfig) {
      const watermarkManager = new WatermarkManager(options.watermarkConfig)
      watermarkManager.init(canvas)
      watermarkManagerRef.current = watermarkManager
    }

    fabricCanvasRef.current = canvas;
    textManagerRef.current.init(canvas);

    // Setup text manager selection callback
    textManagerRef.current.onSelectionChange((isSelected) => {
      if (isSelected) {
        const selectedText = textManagerRef.current.getSelectedText();
        if (selectedText) {
          setSelectedElement((selectedText as any).id);
        }
      } else {
        setSelectedElement(null);
      }
      updateTextElementsList();
    });

    // Initialize file generator
    const fileGenerator = new CanvasFileGenerator(
      canvas,
      watermarkManagerRef.current
    )
    fileGeneratorRef.current = fileGenerator

    // Handle window resize
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    const cleanupOutline = enableTextboxHoverOutline(canvas)

    return () => {
      watermarkManagerRef.current?.dispose()
      window.removeEventListener("resize", handleResize);
      textManagerRef.current.dispose();
      cleanupOutline()
      canvas.dispose();
    };
  }, []);

  // Update text elements list from canvas
  const updateTextElementsList = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects().filter((obj) => obj instanceof Textbox);
    setTextElements(
      objects.map((obj) => ({
        ...obj,
        id: (obj as any).id,
        text: (obj as Textbox).text,
      }))
    );
  };

  // Set background image
  const setBackgroundImage = async (imageUrl: string): Promise<Canvas | null> => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return null;

    try {
      const img = await FabricImage.fromURL(imageUrl, {
        crossOrigin: "anonymous",
      });

      if (!img) {
        alert("Failed to load image");
        return null;
      }

      // Calculate dimensions
      if (windowSize.width > 768) {
        const imgWidth = (img.width! * CANVAS_DIMENSIONS.default) / img.height!;
        canvas.setDimensions({
          width: imgWidth,
          height: CANVAS_DIMENSIONS.default,
        });
      } else {
        const size = Math.min(
          windowSize.width * CANVAS_DIMENSIONS.mobileMultiplier,
          CANVAS_DIMENSIONS.default
        );
        canvas.setDimensions({ width: size, height: size });
      }

      const canvasWidth = canvas.width!;
      const canvasHeight = canvas.height!;
      const scaleX = canvasWidth / img.width!;
      const scaleY = canvasHeight / img.height!;
      const scale = Math.max(scaleX, scaleY);

      img.scale(scale);
      img.set({
        originX: "center",
        originY: "center",
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        objectCaching: false,
        crossOrigin: "anonymous",
      });

      canvas.backgroundImage = img;
      canvas.renderAll();

      return canvas;
    } catch (error) {
      console.error("Error loading background image:", error);
      alert("Failed to load image. Please check the URL or try a different image.");
      return null;
    }
  };

  // Add text element
  const addTextElement = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const textBox = new Textbox("New Text", {
      left: 100,
      top: 100 + textElements.length * 50,
      width: 200,
      fontSize: 32,
      fill: "#ffffff",
      fontFamily: "Impact",
      textAlign: "center",
      strokeWidth: 2,
      stroke: "#000000",
      strokeLineJoin: "round",
      strokeLineCap: "round",
    });

    (textBox as any).id = Date.now().toString() + Math.random();
    makeTextboxResizable(textBox, canvas)

    canvas.add(textBox);
    canvas.setActiveObject(textBox);
    canvas.renderAll();
    updateTextElementsList();
    setSelectedElement((textBox as any).id);
  };

  // Delete selected element
  const deleteSelectedElement = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.renderAll();
      updateTextElementsList();
      setSelectedElement(null);
    }
  };

  // Load template
  const loadTemplate = (template: { textElements: any[] }) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Clear existing text objects
    const objects = canvas.getObjects().filter((obj) => obj instanceof Textbox);
    objects.forEach((obj) => canvas.remove(obj));

    console.log(template.textElements);
    // Add template text elements
    template.textElements.forEach((element) => {
      const textBox = deserializeTextElement(element, canvas);
      (textBox as any).id = element.id || Date.now().toString() + Math.random();

      canvas.add(textBox);
    });

    canvas.renderAll();
    updateTextElementsList();
  };

  async function downloadCanvas() {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return

    // Prepare watermark for download
    await watermarkManagerRef.current?.prepareForDownload()

    const dataURL = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 3,
    })

    const link = document.createElement("a")
    link.href = dataURL
    link.download = "meme.png"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Clean up watermark after download
    watermarkManagerRef.current?.cleanupAfterDownload()
  }

  function updateWatermark(config: Partial<WatermarkConfig>) {
    watermarkManagerRef.current?.updateConfig(config)
  }

  async function saveFiles(
    options?: CanvasFileOptions,
    includeWatermark: boolean = true
  ): Promise<{ background: File | null; edited: File | null }> {
    return (
      fileGeneratorRef.current?.saveFiles(options, includeWatermark) || {
        background: null,
        edited: null,
      }
    )
  }

  return {
    canvasRef,
    fabricCanvas: fabricCanvasRef.current,
    textElements,
    selectedElement,
    setSelectedElement: (id: string | null) => {
      setSelectedElement(id);
      const canvas = fabricCanvasRef.current;
      if (canvas && id) {
        const obj = canvas.getObjects().find((o) => (o as any).id === id);
        if (obj) {
          canvas.setActiveObject(obj);
          canvas.renderAll();
        }
      }
    },
    textManager: textManagerRef.current,
    setBackgroundImage,
    addTextElement,
    deleteSelectedElement,
    loadTemplate,
    saveFiles,
    updateWatermark,
    downloadCanvas,
  };
}