import { useRef, useEffect, useState } from "react";
import { Canvas, Textbox, FabricImage } from "fabric";
import { createTextManager, applydefualt } from "../../hooks/usecase/text-manager";
import { CanvasFileGenerator, type CanvasFileOptions } from "./modules/canvas-file-generator"
import { WatermarkManager, type WatermarkConfig } from "./modules/use-watermark"
import { enableTextboxHoverOutline, type OutlineManger } from "./modules/textbox-hover-outline"
import { makeTextboxResizable } from "./modules/fixed-size-textbox"
import { deserializeTextElement } from "../../utilities/deserializeTextElements";
import { useWindow } from "./use-window"
import { DefualtTextSettings } from "../../components/types";
import { SaveCanvas } from "./modules/canvas-save-gen";
import { ensureFontLoaded } from "../../utilities/fontLoader";

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
    const resize = async() => {
      const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    adjustCanvasSize(canvas, isMobile);
    await refreshFontsAfterResize();
    canvas.renderAll();
    }
    resize();
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
    
    let bSize = Math.max(baseCanvasSize.width, baseCanvasSize.height);
    let zoom = targetSize / (BASE_CANVAS_SIZE.width);
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

  // async function refreshFontsAfterResize() {
    //   const canvas = fabricCanvasRef.current;
    //   if (!canvas) return;
    
    //   const objects = canvas.getObjects();
    
    //   for (const obj of objects) {
    //     if (!(obj instanceof Textbox)) continue;
    
    //     const font = obj.fontFamily;
    //     if (!font) continue;
    
    //     // // 1) Ask the browser to load the font *with a size* so it's actually usable for layout.
    //     // //    This tends to be more reliable than relying on a custom loader alone.
    //     // try {
    //     //   // try to load a regular weight first, then wait for fonts.ready as a fallback
    //     //   await Promise.all([
    //     //     // request some nominal size so the face is available for metrics
    //     //     (document as any).fonts?.load && (document as any).fonts.load(`16px "${font}"`),
    //     //     // ensureFontLoaded(font),
    //     //     (document as any).fonts?.ready
    //     //   ]);
    //     // } catch (err) {
    //     //   // ignore: font may still be available or document.fonts not supported
    //     //   // but we still continue to apply and force re-render.
    //     // }

    //     // console.log(obj.get("fontFamily"))
    
    //     // // 2) Apply font to the object
    //     // obj.set("fontFamily", font);  
    //     // 3) Recompute layout/metrics
    //     // initDimensions computes width/height based on font metrics
    //     // if (typeof (obj as any).initDimensions === "function") {
    //     //   try { obj.initDimensions(); } catch (e) { /* ignore */ }
    //     // }
    
    //     // // 4) Clear Fabric caching that can preserve old drawing
    //     // // markDirty / set('dirty', true) depends on Fabric version; do both
    //     // try { (obj as any).dirty = true; } catch {}
    //     // try { obj.set("dirty", true); } catch {}
    //     // // If object caching is enabled, clear its cache
    //     // try { (obj as any).canvas && (obj as any)._clearCache && (obj as any)._clearCache(); } catch {}
    //     // try { (obj as any)._clearCache && (obj as any)._clearCache(); } catch {}
    
    //     // // 5) update coordinates and request fresh draw
    //     // if (typeof (obj as any).setCoords === "function") obj.setCoords();

    //     await applyRealFont(obj, font)
    
    //     // small micro-yield so the browser has time to paint between many fonts (prevents jank)
    //     await new Promise((r) => setTimeout(r, 0));
    //   }
    
    //   // Final render
    //   canvas.requestRenderAll();
    // }

    // Update the refreshFontsAfterResize function to properly handle font reloading
  async function refreshFontsAfterResize() {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects();
    
    for (const obj of objects) {
      if (!(obj instanceof Textbox)) continue;

      const font = obj.fontFamily;
      if (!font) continue;

      await reloadFontForTextbox(obj, font);
    }

    canvas.requestRenderAll();
  }

  // New function to properly reload fonts for a textbox
  async function reloadFontForTextbox(textbox: Textbox, font: string) {
    // First, ensure the font is fully loaded
    await ensureFontLoaded(font);
    
    // Store all current properties
    const currentText = textbox.text;
    const currentWidth = textbox.width;
    const currentLeft = textbox.left;
    const currentTop = textbox.top;
    const currentScaleX = textbox.scaleX;
    const currentScaleY = textbox.scaleY;
    const currentAngle = textbox.angle;
    const currentFill = textbox.fill;
    const currentFontSize = textbox.fontSize;
    const currentTextAlign = textbox.textAlign;
    const currentLineHeight = textbox.lineHeight;
    const currentCharSpacing = textbox.charSpacing;
    const currentStyles = textbox.styles;
    
    // Create a temporary textbox to force proper font measurement
    const tempTextbox = new Textbox(currentText, {
      fontFamily: font,
      fontSize: currentFontSize,
      width: currentWidth,
      left: 0,
      top: 0,
      fill: currentFill,
      textAlign: currentTextAlign,
      lineHeight: currentLineHeight,
      charSpacing: currentCharSpacing,
      styles: currentStyles,
    });
    
    // Force Fabric to measure with the new font
    tempTextbox.initDimensions();
    
    // Now update the original textbox with proper metrics
    textbox.set({
      fontFamily: font,
      fontSize: currentFontSize,
      width: currentWidth,
      height: tempTextbox.height,
      scaleX: currentScaleX,
      scaleY: currentScaleY,
      left: currentLeft,
      top: currentTop,
      angle: currentAngle,
      fill: currentFill,
      textAlign: currentTextAlign,
      lineHeight: currentLineHeight,
      charSpacing: currentCharSpacing,
      styles: currentStyles,
    });
    
    // Clear all caches in Fabric 6.0+
    clearFabricTextCaches(textbox);
    
    // Reinitialize dimensions
    textbox.initDimensions();
    textbox.setCoords();
    
    // Mark as dirty
    textbox.set('dirty', true);
    textbox.canvas?.requestRenderAll();
  }

  // Function to clear all Fabric 6.0+ text caches
  function clearFabricTextCaches(textbox: Textbox) {
    const tb = textbox as any;
    
    // Clear the main caches
    tb._clearCache?.();
    
    // Clear text measurement caches
    tb.__lineHeights = null;
    tb.__lineWidths = null;
    tb._textLines = null;
    tb._unwrappedTextLines = null;
    tb._charBounds = null;
    
    // Clear dynamic width cache
    tb.dynamicMinWidth = 0;
    
    // Clear style caches
    if (tb._styleProperties) {
      tb._styleProperties = null;
    }
    
    // Clear path and offset caches
    tb._path = null;
    tb._offsets = null;
    
    // Clear rendering caches
    if (tb._cacheCanvas) {
      tb._cacheCanvas = null;
    }
    
    // Force cache clearing
    tb.forceCacheClear?.();
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
  // const addTextElement = () => {
  //   const canvas = fabricCanvasRef.current;
  //   if (!canvas) return;

  //   const textBox = new Textbox("New Text".toUpperCase(), {
  //     left: 100,
  //     top: 100 + textElements.length * 50,
  //     width: 200,
  //     fontSize: DefualtTextSettings.fontSize,
  //     fill: DefualtTextSettings.textColor,
  //     fontFamily: DefualtTextSettings.fontFamily,
  //     textAlign: "center",
  //   });
    

  //   (textBox as any).id = Date.now().toString() + Math.random();
  //   makeTextboxResizable(textBox, canvas);
  //   applydefualt(textBox);

  //   canvas.add(textBox);
  //   canvas.setActiveObject(textBox);
  //   canvas.renderAll();
  //   updateTextElementsList();
  //   setSelectedElement((textBox as any).id);
  // };

  // Update the addTextElement function to use the new font loading
  const addTextElement = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Ensure font is loaded before creating textbox
    await ensureFontLoaded(DefualtTextSettings.fontFamily);

    const textBox = new Textbox("New Text".toUpperCase(), {
      left: 100,
      top: 100 + textElements.length * 50,
      width: 200,
      fontSize: DefualtTextSettings.fontSize,
      fill: DefualtTextSettings.textColor,
      fontFamily: DefualtTextSettings.fontFamily,
      textAlign: "center",
    });
    
    (textBox as any).id = Date.now().toString() + Math.random();
    makeTextboxResizable(textBox, canvas);
    applydefualt(textBox);
    
    // Force initial font measurement
    clearFabricTextCaches(textBox);
    textBox.initDimensions();

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
    template.textElements.forEach(async (element) => {
      const textBox = await deserializeTextElement(element);
      canvas.add(textBox);

      await new Promise(resolve => setTimeout(resolve, 0));
      makeTextboxResizable(textBox, canvas)

    });

    canvas.renderAll();
    updateTextElementsList();
  };

  async function downloadCanvas() {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
  
    if (outlineManagerRef.current){
      outlineManagerRef.current.removeOutlineAndHover();
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  
    // Prepare watermark
    await watermarkManagerRef.current?.prepareForDownload();
  
    // // Bake blur/outline for all text with _newShadow
    const dataURL = SaveCanvas(canvas);
  
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'meme.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up watermark
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