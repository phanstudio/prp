import React, { useRef, useState, useCallback, useMemo } from "react";
import type Konva from "konva";
import type { TextElement, TextAlignType, FontStyleType, TextEffectType } from "../../components/types";
import { DefualtTextSettings as DefaultSettings } from "../../components/types";
import { useWindow } from "./use-window";
import { ensureFontLoaded } from "../../utilities/fontLoader";

export interface WatermarkConfig {
  text: string;
  mode?: "download-only" | "always" | "none";
  position?: "bottom-left" | "bottom-right" | "top-left" | "top-right" | "center";
  fontSizeRatio?: number;
  opacity?: number;
}

export interface UseKonvaOptions {
  watermarkConfig?: WatermarkConfig;
}

export interface TextProperties {
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  textAlign?: TextAlignType;
  fontWeight?: string | number;
  fontStyle?: FontStyleType;
  underline?: boolean;
  linethrough?: boolean;
  effectType?: TextEffectType;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  maxFontSize?: number;
  allCaps?: boolean;
}

import { KonvaStageCanvas } from "../../components/canvas/KonvaStageCanvas";

export function useKonva(options?: UseKonvaOptions) {
  const stageRef = useRef<Konva.Stage>(null);
  const { windowSize } = useWindow();

  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [bgImageSrc, setBgImageSrc] = useState<string>("");
  const [baseSize, setBaseSize] = useState<{ width: number; height: number }>({
    width: 750,
    height: 750,
  });

  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig | undefined>(options?.watermarkConfig);

  // Background Image loader
  const setBackgroundImage = useCallback(async (imageUrl: string) => {
    if (!imageUrl) {
      setBgImage(null);
      setBgImageSrc("");
      setBaseSize({ width: 750, height: 750 });
      return;
    }
    return new Promise<void>((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;

      img.onload = () => {
        setBgImage(img);
        setBgImageSrc(imageUrl);

        const maxBaseDim = 750;
        const imgRatio = (img.width || 750) / (img.height || 750);
        let baseW = maxBaseDim;
        let baseH = maxBaseDim;

        if (imgRatio >= 1) {
          baseW = maxBaseDim;
          baseH = Math.round(maxBaseDim / imgRatio);
        } else {
          baseH = maxBaseDim;
          baseW = Math.round(maxBaseDim * imgRatio);
        }

        setBaseSize({ width: baseW, height: baseH });
        resolve();
      };

      img.onerror = (e) => {
        console.error("Failed to load background image:", e);
        reject(e);
      };
    });
  }, []);

  // Compute responsive display dimensions
  const { displayWidth, displayHeight, scale } = useMemo(() => {
    let maxDisplayWidth: number;
    let maxDisplayHeight: number;

    if (windowSize.width < 640) {
      maxDisplayWidth = Math.min(windowSize.width - 32, 450);
      maxDisplayHeight = Math.max(260, (windowSize.height || 600) * 0.55);
    } else if (windowSize.width < 1024) {
      maxDisplayWidth = Math.min(windowSize.width - 64, 580);
      maxDisplayHeight = Math.max(350, (windowSize.height || 700) * 0.65);
    } else {
      maxDisplayWidth = Math.min(windowSize.width * 0.52, 720);
      maxDisplayHeight = Math.max(420, (windowSize.height || 800) * 0.72);
    }

    const scaleByWidth = maxDisplayWidth / baseSize.width;
    const scaleByHeight = maxDisplayHeight / baseSize.height;
    const calculatedScale = Math.min(scaleByWidth, scaleByHeight, 1.0);

    return {
      displayWidth: Math.round(baseSize.width * calculatedScale),
      displayHeight: Math.round(baseSize.height * calculatedScale),
      scale: calculatedScale,
    };
  }, [windowSize.width, windowSize.height, baseSize]);

  // Add text element
  const addTextElement = useCallback(() => {
    const newId = Date.now().toString() + Math.random().toString().slice(2, 6);
    const newElement: TextElement = {
      id: newId,
      text: "YOUR TEXT HERE",
      x: Math.round(baseSize.width * 0.1),
      y: Math.min(60 + textElements.length * 50, baseSize.height - 80),
      fontSize: DefaultSettings.fontSize,
      color: DefaultSettings.textColor,
      fontFamily: DefaultSettings.fontFamily,
      rotation: 0,
      width: Math.round(baseSize.width * 0.8),
      height: 60,
      textAlign: "center",
      outlineColor: DefaultSettings.outlineStrokeColor,
      outlineSize: DefaultSettings.outlineStrokeWidth,
      effectType: "outline",
      allCaps: true,
    };

    setTextElements((prev) => [...prev, newElement]);
    setSelectedElement(newId);
  }, [baseSize, textElements.length]);

  // Delete selected text element
  const deleteSelectedElement = useCallback(() => {
    if (!selectedElement) return;
    setTextElements((prev) => prev.filter((el) => el.id !== selectedElement));
    setSelectedElement(null);
  }, [selectedElement]);

  // Update text element
  const updateTextElement = useCallback((id: string, updates: Partial<TextElement>) => {
    setTextElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  }, []);

  // Load template
  const loadTemplate = useCallback((template: { textElements: any[] }) => {
    setSelectedElement(null);
    const loaded = (template.textElements || []).map((el: any) => {
      const family = el.fontFamily ?? el.font_family ?? DefaultSettings.fontFamily;
      // Preload font immediately for this template element
      if (family) {
        ensureFontLoaded(family);
      }

      return {
        id: String(el.id || Date.now().toString() + Math.random().toString().slice(2, 6)),
        text: el.text || "",
        x: el.x ?? el.left ?? 50,
        y: el.y ?? el.top ?? 50,
        fontSize: el.fontSize ?? el.font_size ?? DefaultSettings.fontSize,
        color: el.color ?? el.fill ?? DefaultSettings.textColor,
        fontFamily: family,
        rotation: el.rotation ?? el.angle ?? 0,
        width: el.width ?? 300,
        height: el.height ?? 60,
        textAlign: (el.textAlign ?? el.text_align ?? "center") as TextAlignType,
        outlineColor: el.outlineColor ?? el.outline_color ?? el.stroke ?? DefaultSettings.outlineStrokeColor,
        outlineSize: el.outlineSize ?? el.outline_size ?? el.strokeWidth ?? DefaultSettings.outlineStrokeWidth,
        effectType: el.effectType ?? el.effect_type ?? (el.strokeWidth || el.outline_size ? "outline" : "none"),
        shadowColor: el.shadowColor ?? el.shadow_color ?? DefaultSettings.shadowColor,
        shadowBlur: el.shadowBlur ?? el.shadow_blur ?? DefaultSettings.shadowBlur,
        shadowOffsetX: el.shadowOffsetX ?? el.shadow_offset_x ?? DefaultSettings.shadowOffsetX,
        shadowOffsetY: el.shadowOffsetY ?? el.shadow_offset_y ?? DefaultSettings.shadowOffsetY,
        shadowOpacity: el.shadowOpacity ?? el.shadow_opacity ?? DefaultSettings.shadowOpacity,
        fontWeight: el.fontWeight ?? el.font_weight,
        fontStyle: el.fontStyle ?? el.font_style,
        underline: el.underline ?? false,
        linethrough: el.linethrough ?? false,
        allCaps: el.allCaps ?? (el.text && el.text === el.text.toUpperCase()),
      };
    });

    setTextElements(loaded);
  }, []);


  // TextManager compatibility interface for TemplateEditor and TextPanel
  const textManager = useMemo(() => {
    return {
      getSelectedTextProperties: (): TextProperties | null => {
        if (!selectedElement) return null;
        const el = textElements.find((t) => t.id === selectedElement);
        if (!el) return null;

        return {
          text: el.text,
          fontSize: el.fontSize,
          fontFamily: el.fontFamily,
          fill: el.color,
          textAlign: el.textAlign,
          fontWeight: el.fontWeight,
          fontStyle: el.fontStyle,
          underline: el.underline,
          linethrough: el.linethrough,
          effectType: el.effectType,
          shadowColor: el.shadowColor,
          shadowBlur: el.shadowBlur,
          shadowOffsetX: el.shadowOffsetX,
          shadowOffsetY: el.shadowOffsetY,
          shadowOpacity: el.shadowOpacity,
          strokeColor: el.outlineColor,
          strokeWidth: el.outlineSize,
          maxFontSize: el.fontSize,
          allCaps: el.allCaps ?? (el.text === el.text.toUpperCase()),
        };
      },

      updateSelectedText: (props: Partial<TextProperties>) => {
        if (!selectedElement) return false;

        const updates: Partial<TextElement> = {};
        if (props.text !== undefined) updates.text = props.text;
        if (props.fontSize !== undefined) updates.fontSize = props.fontSize;
        if (props.maxFontSize !== undefined) updates.fontSize = props.maxFontSize;
        if (props.fontFamily !== undefined) {
          updates.fontFamily = props.fontFamily;
          ensureFontLoaded(props.fontFamily);
        }
        if (props.fill !== undefined) updates.color = props.fill;
        if (props.textAlign !== undefined) updates.textAlign = props.textAlign;
        if (props.fontWeight !== undefined) updates.fontWeight = props.fontWeight;
        if (props.fontStyle !== undefined) updates.fontStyle = props.fontStyle;
        if (props.underline !== undefined) updates.underline = props.underline;
        if (props.linethrough !== undefined) updates.linethrough = props.linethrough;
        if (props.effectType !== undefined) {
          updates.effectType = props.effectType;
          if (props.effectType === "none") {
            updates.outlineSize = 0;
            updates.shadowBlur = 0;
            updates.shadowOpacity = 0;
          }
        }
        if (props.strokeColor !== undefined) updates.outlineColor = props.strokeColor;
        if (props.strokeWidth !== undefined) updates.outlineSize = props.strokeWidth;
        if (props.shadowColor !== undefined) updates.shadowColor = props.shadowColor;
        if (props.shadowBlur !== undefined) updates.shadowBlur = props.shadowBlur;
        if (props.shadowOffsetX !== undefined) updates.shadowOffsetX = props.shadowOffsetX;
        if (props.shadowOffsetY !== undefined) updates.shadowOffsetY = props.shadowOffsetY;
        if (props.shadowOpacity !== undefined) updates.shadowOpacity = props.shadowOpacity;
        if (props.allCaps !== undefined) updates.allCaps = props.allCaps;

        updateTextElement(selectedElement, updates);
        return true;
      },

      duplicateSelectedText: () => {
        if (!selectedElement) return null;
        const current = textElements.find((t) => t.id === selectedElement);
        if (!current) return null;

        const newId = Date.now().toString() + Math.random().toString().slice(2, 6);
        const duplicated: TextElement = {
          ...current,
          id: newId,
          x: current.x + 20,
          y: current.y + 20,
        };

        setTextElements((prev) => [...prev, duplicated]);
        setSelectedElement(newId);
        return null;
      },

      getAllTextElements: (): TextElement[] => {
        return textElements;
      },
    };
  }, [selectedElement, textElements, updateTextElement]);

  // Export / Download canvas
  const downloadCanvas = useCallback(async () => {
    if (!stageRef.current) return;

    const prevSelected = selectedElement;
    setSelectedElement(null);
    setIsExporting(true);

    // Wait for Konva to render clean stage without dashed borders or transformer
    await new Promise((r) => setTimeout(r, 80));

    try {
      if (!stageRef.current) return;
      const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = `meme-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExporting(false);
      setSelectedElement(prevSelected);
    }
  }, [selectedElement]);

  // Copy canvas image to system clipboard
  const copyCanvasToClipboard = useCallback(async (): Promise<boolean> => {
    const prevSelected = selectedElement;
    setSelectedElement(null);
    setIsExporting(true);

    await new Promise((r) => setTimeout(r, 80));

    try {
      if (!stageRef.current) return false;
      const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
      const res = await fetch(dataURL);
      const blob = await res.blob();
      if (typeof navigator !== "undefined" && navigator.clipboard && (window as any).ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        return true;
      }
      return false;
    } catch (err) {
      console.warn("Failed to copy image to clipboard:", err);
      return false;
    } finally {
      setIsExporting(false);
      setSelectedElement(prevSelected);
    }
  }, [selectedElement]);

  // Save template files
  const saveFiles = useCallback(async () => {
    if (!stageRef.current) {
      return { background: null, edited: null };
    }

    const prevSelected = selectedElement;
    setSelectedElement(null);
    setIsExporting(true);

    await new Promise((r) => setTimeout(r, 80));

    try {
      if (!stageRef.current) {
        return { background: null, edited: null };
      }

      // 1. Generate edited file
      const dataURL = stageRef.current.toDataURL({ pixelRatio: 1.5 });
      const res = await fetch(dataURL);
      const editedBlob = await res.blob();
      const editedFile = new File([editedBlob], "edited.png", { type: "image/png" });

      // 2. Background file
      let bgFile: File | null = null;
      if (bgImageSrc) {
        try {
          const bgRes = await fetch(bgImageSrc);
          const bgBlob = await bgRes.blob();
          bgFile = new File([bgBlob], "background.png", { type: bgBlob.type });
        } catch (err) {
          console.warn("Could not fetch background directly, creating from canvas image:", err);
        }
      }

      return { background: bgFile, edited: editedFile };
    } finally {
      setIsExporting(false);
      setSelectedElement(prevSelected);
    }
  }, [bgImageSrc, selectedElement]);

  const updateWatermark = useCallback((config: Partial<WatermarkConfig>) => {
    setWatermarkConfig((prev) => ({ ...(prev || { text: "" }), ...config }));
  }, []);

  // Stable stage props ref to prevent unmounting/remounting Konva Stage on state changes
  const stagePropsRef = useRef({
    stageRef,
    displayWidth,
    displayHeight,
    scale,
    baseWidth: baseSize.width,
    baseHeight: baseSize.height,
    bgImage,
    textElements,
    selectedElement,
    isExporting,
    watermarkConfig,
    onSelectElement: setSelectedElement,
    onUpdateElement: updateTextElement,
  });

  stagePropsRef.current = {
    stageRef,
    displayWidth,
    displayHeight,
    scale,
    baseWidth: baseSize.width,
    baseHeight: baseSize.height,
    bgImage,
    textElements,
    selectedElement,
    isExporting,
    watermarkConfig,
    onSelectElement: setSelectedElement,
    onUpdateElement: updateTextElement,
  };

  // Stable StageCanvas component: reference never changes, preventing lag/freeze on select
  const StageCanvas: React.FC<{ className?: string }> = useMemo(() => {
    return function StableStageCanvas({ className = "" }: { className?: string }) {
      return (
        <KonvaStageCanvas
          {...stagePropsRef.current}
          className={className}
        />
      );
    };
  }, []);


  return {
    StageCanvas,
    stageRef,
    textElements,
    selectedElement,
    setSelectedElement,
    addTextElement,
    deleteSelectedElement,
    loadTemplate,
    saveFiles,
    updateWatermark,
    downloadCanvas,
    copyCanvasToClipboard,
    setBackgroundImage,
    textManager,
    hasImage: !!bgImage,
  };
}
