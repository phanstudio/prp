import { useRef, useEffect, useState } from "react";
import { Canvas, Textbox, FabricImage } from "fabric";
import { createTextManager } from "../../hooks/usecase/text-manager";
import { CanvasFileGenerator, type CanvasFileOptions } from "./modules/canvas-file-generator"
import { WatermarkManager, type WatermarkConfig } from "./modules/use-watermark"
import { enableTextboxHoverOutline, type OutlineManger } from "./modules/textbox-hover-outline"
import { makeTextboxResizable } from "./modules/fixed-size-textbox"
import { deserializeTextElement } from "../../utilities/deserializeTextElements";
import { useWindow } from "./use-window"
import { DefualtTextSettings } from "../../components/types";

const CANVAS_DIMENSIONS = {
  default: 600,//700,
  mobileMultiplier: 0.9,
};

const BASE_CANVAS_SIZE = {width:CANVAS_DIMENSIONS.default, height:CANVAS_DIMENSIONS.default};

const CANVAS_PADDING = {
  mobile: 64,
  tablet: 48,
  laptop: 64,
}

interface CanvasSize{
  width: number,
  height: number,
}

interface UseFabricOptions {
  watermarkConfig?: WatermarkConfig
}

export function useFabric(options?: UseFabricOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const textManagerRef = useRef(createTextManager());
  
  const [textElements, setTextElements] = useState<any[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const { isMobile, windowSize } = useWindow()

  const fileGeneratorRef = useRef<CanvasFileGenerator | null>(null)
  const watermarkManagerRef = useRef<WatermarkManager | null>(null)
  const [baseCanvasSize, setBaseCanvasSize] = useState<CanvasSize>(BASE_CANVAS_SIZE);
  const currentZoomRef = useRef(1); 

  const outlineManagerRef = useRef<OutlineManger>(null);

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
    outlineManagerRef.current = enableTextboxHoverOutline(canvas)

    return () => {
      watermarkManagerRef.current?.dispose()
      textManagerRef.current.dispose();
      outlineManagerRef.current?.destroy();
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    adjustCanvasSize(canvas, isMobile);
    canvas.renderAll();
  }, [isMobile, windowSize.width, windowSize.height, baseCanvasSize]);

  function adjustCanvasSize(fabricCanvas: Canvas, isMobile: boolean) {
    if (!windowSize.width || !windowSize.height) return;
  
    // Compute available space like before
    const targetSize = isMobile
      ? Math.min(
          windowSize.width * CANVAS_DIMENSIONS.mobileMultiplier,
          CANVAS_DIMENSIONS.default
        )
      : CANVAS_DIMENSIONS.default;
  
    const bSize = Math.max(baseCanvasSize.width, baseCanvasSize.height);
    const zoom = targetSize / (BASE_CANVAS_SIZE.width);
    const scale = targetSize / bSize;
    currentZoomRef.current = zoom;

    // Resize the visible DOM element so it matches scaled view
    fabricCanvas.setDimensions({
      width: baseCanvasSize.width * scale,
      height: baseCanvasSize.height * scale,
    });

    // Set zoom instead of scaling all objects
    fabricCanvas.setZoom(zoom);
  
    fabricCanvas.renderAll();
  }
  
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

  async function setBackgroundImage(imageUrl: string): Promise<Canvas | null> {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return null;
  
    const img = await FabricImage.fromURL(imageUrl, { crossOrigin: "anonymous" });
    if (!img) {
      alert("Failed to load image");
      return null;
    }
  
    // Determine canvas max dimensions based on window size
    let maxWidth: number, maxHeight: number;
    if (windowSize.width! <= 640) {
      maxWidth = Math.min(windowSize.width! - CANVAS_PADDING.mobile, 500);
      maxHeight = maxWidth;
    } else if (windowSize.width! <= 768) {
      maxWidth = Math.min(windowSize.width! - CANVAS_PADDING.tablet, 600);
      maxHeight = maxWidth;
    } else if (windowSize.width! <= 1024) {
      maxWidth = Math.min(windowSize.width! - CANVAS_PADDING.laptop, 700);
      maxHeight = windowSize.height! - 350;
    } else {
      maxWidth = Math.min(windowSize.width! * 0.6 - CANVAS_PADDING.laptop, 800);
      maxHeight = windowSize.height! - 300;
    }
  
    // Maintain aspect ratio
    let canvasWidth = maxWidth;
    let canvasHeight = maxHeight;
  
    if (img.width! / img.height! > canvasWidth / canvasHeight) {
      img.scaleToHeight(canvasHeight);
    } else {
      img.scaleToWidth(canvasWidth);
    }    
  
    const canvasAspect = canvas.width! / canvas.height!;
    const imgAspect = img.width! / img.height!;

    let scale: number;
    const sameAspects:boolean = (imgAspect > canvasAspect);
    // Fit image entirely inside canvas
    if (sameAspects) {
      // Image is wider than canvas → scale to fit width
      scale = canvas.width! / img.width!;
    } else {
      // Image is taller → scale to fit height
      scale = canvas.height! / img.height!;
    }

    const scalew = (sameAspects ? canvas.width!: img.width! * scale);
    const scaleh = (!sameAspects ?  canvas.height!: img.height! * scale);

    // Set image properties
    img.set({
      originX: "left",
      originY: "top",
      left: 0,
      top: 0,
      scaleX: scale / currentZoomRef.current,
      scaleY: scale / currentZoomRef.current,
      selectable: false,
      evented: false,
    });

    setBaseCanvasSize({
      width:scalew,
      height:scaleh
    })
  
    canvas.backgroundImage = img;
    canvas.backgroundColor = "transparent";
    // adjustCanvasSize(canvas, isMobile, true);
    canvas.renderAll();

    return canvas;
  }
  
  // Add text element
  const addTextElement = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const textBox = new Textbox("New Text", {
      left: 100,
      top: 100 + textElements.length * 50,
      width: 200,
      fontSize: DefualtTextSettings.fontSize,
      fill: DefualtTextSettings.textColor,
      fontFamily: DefualtTextSettings.fontFamily,
      textAlign: "center",
      strokeWidth: DefualtTextSettings.outlineStrokeWidth,
      stroke: DefualtTextSettings.outlineStrokeColor,
      strokeLineJoin: "round",
      strokeLineCap: "round",
      paintFirst: DefualtTextSettings.paintFirst,
      strokeUniform: false
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
    
    if (outlineManagerRef.current){
      outlineManagerRef.current.removeOutlineAndHover();
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

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
    watermarkManagerRef.current?.cleanupAfterDownload();
  }

  function updateWatermark(config: Partial<WatermarkConfig>) {
    watermarkManagerRef.current?.updateConfig(config)
  }

  async function saveFiles(
    options?: CanvasFileOptions,
    includeWatermark: boolean = true
  ): Promise<{ background: File | null; edited: File | null }> {
    if (outlineManagerRef.current){
      outlineManagerRef.current.removeOutlineAndHover();
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
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
    downloadCanvas
  };
}