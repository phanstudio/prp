import React, { useRef, useEffect, useMemo, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Rect, Transformer, Group } from "react-konva";
import type Konva from "konva";
import type { TextElement } from "../types";
import { DefualtTextSettings as DefaultSettings } from "../types";
import { ensureFontLoaded } from "../../utilities/fontLoader";
import type { WatermarkConfig } from "../../hooks/usecase/use-konva";

/**
 * Computes optimal font size using binary search so text strictly fits inside boxWidth AND boxHeight.
 * Accounts for both horizontal word boundaries and vertical line wrapping / explicit newlines.
 */
function computeAutoFitFontSize(
  text: string,
  boxWidth: number,
  boxHeight: number,
  fontFamily: string,
  maxSize: number
): number {
  if (!text || !text.trim() || typeof document === "undefined") {
    return Math.max(12, maxSize || 36);
  }

  const safeWidth = Math.max(20, boxWidth - 12);
  const safeHeight = Math.max(16, boxHeight - 8);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return maxSize || 36;

  const fontName = fontFamily || DefaultSettings.fontFamily;
  const initialMax = Math.max(12, maxSize || 36);

  // Test if a given font size fits inside the bounded rectangle
  const testFit = (size: number): boolean => {
    ctx.font = `${size}px "${fontName}", Impact, sans-serif`;
    const lineHeight = size * 1.15;

    const paragraphs = text.split("\n");
    let totalLines = 0;

    for (const para of paragraphs) {
      if (!para.trim()) {
        totalLines += 1;
        continue;
      }

      const words = para.split(" ");
      let currentLineWidth = 0;
      let paraLines = 1;
      const spaceWidth = ctx.measureText(" ").width;

      for (const word of words) {
        const wordWidth = ctx.measureText(word).width;
        // If a single word cannot fit horizontally, this size is too big
        if (wordWidth > safeWidth) {
          return false;
        }

        if (currentLineWidth === 0) {
          currentLineWidth = wordWidth;
        } else if (currentLineWidth + spaceWidth + wordWidth > safeWidth) {
          paraLines += 1;
          currentLineWidth = wordWidth;
        } else {
          currentLineWidth += spaceWidth + wordWidth;
        }
      }
      totalLines += paraLines;
    }

    return totalLines * lineHeight <= safeHeight;
  };

  let low = 10;
  let high = initialMax;
  let best = 10;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (testFit(mid)) {
      best = mid;
      low = mid + 1; // Try larger font size
    } else {
      high = mid - 1; // Try smaller font size
    }
  }

  return Math.max(10, Math.min(best, initialMax));
}

interface EditableTextBoxProps {
  element: TextElement;
  isSelected: boolean;
  isExporting: boolean;
  onSelect: () => void;
  onChange: (newAttrs: Partial<TextElement>) => void;
}

const EditableTextBox: React.FC<EditableTextBoxProps> = ({
  element,
  isSelected,
  isExporting,
  onSelect,
  onChange,
}) => {
  const groupRef = useRef<Konva.Group>(null);
  const textRef = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [fontVersion, setFontVersion] = useState(0);

  // Load font binary and trigger redraw with actual font metrics
  useEffect(() => {
    let active = true;
    if (element.fontFamily) {
      ensureFontLoaded(element.fontFamily).then(() => {
        if (active) {
          setFontVersion((v) => v + 1);
          groupRef.current?.getLayer()?.batchDraw();
        }
      });
    }
    return () => {
      active = false;
    };
  }, [element.fontFamily]);

  // Connect transformer when selected
  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const boxWidth = Math.max(40, element.width || 300);
  const boxHeight = Math.max(25, element.height || 100);

  const safeText = element.text ?? "";
  const displayText = element.allCaps ? safeText.toUpperCase() : safeText;

  // Auto-fit font size based on width and height (re-computes when font is loaded)
  const autoFontSize = useMemo(() => {
    return computeAutoFitFontSize(
      displayText,
      boxWidth,
      boxHeight,
      element.fontFamily || DefaultSettings.fontFamily,
      element.fontSize || 36
    );
  }, [displayText, boxWidth, boxHeight, element.fontFamily, element.fontSize, fontVersion]);

  const isNone = element.effectType === "none";
  const hasOutline = !isNone && (element.effectType === "outline" || element.effectType === "newShadow") && (element.outlineSize ?? DefaultSettings.outlineStrokeWidth) > 0;
  const hasShadow = !isNone && (element.effectType === "shadow" || element.effectType === "newShadow") && ((element.shadowOpacity ?? DefaultSettings.shadowOpacity) > 0);

  const fontStyleString = useMemo(() => {
    const isBold = element.fontWeight === "bold" || element.fontWeight === 700;
    const isItalic = element.fontStyle === "italic";
    if (isBold && isItalic) return "italic bold";
    if (isBold) return "bold";
    if (isItalic) return "italic";
    return "normal";
  }, [element.fontWeight, element.fontStyle]);

  const textDecorationString = useMemo(() => {
    if (element.underline) return "underline";
    if (element.linethrough) return "line-through";
    return "";
  }, [element.underline, element.linethrough]);

  const handlePointerDown = (e: any) => {
    e.cancelBubble = true;
    onSelect();
  };

  return (
    <>
      <Group
        ref={groupRef}
        x={element.x}
        y={element.y}
        rotation={element.rotation || 0}
        draggable={!isExporting}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        onDragStart={handlePointerDown}
        onMouseEnter={(e) => {
          if (!isExporting) {
            const stage = e.target.getStage();
            if (stage) stage.container().style.cursor = "move";
          }
        }}
        onMouseLeave={(e) => {
          const stage = e.target.getStage();
          if (stage) stage.container().style.cursor = "default";
        }}
        onDragEnd={(e) => {
          onChange({
            x: Math.round(e.target.x()),
            y: Math.round(e.target.y()),
          });
        }}
        onTransformEnd={() => {
          const node = groupRef.current;
          if (!node) return;

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);

          const newWidth = Math.max(50, Math.round(boxWidth * scaleX));
          const newHeight = Math.max(30, Math.round(boxHeight * scaleY));

          onChange({
            x: Math.round(node.x()),
            y: Math.round(node.y()),
            rotation: Math.round(node.rotation()),
            width: newWidth,
            height: newHeight,
          });
        }}
      >
        {/* Transparent hit area & dashed boundary box (hidden on export) */}
        <Rect
          x={0}
          y={0}
          width={boxWidth}
          height={boxHeight}
          fill="rgba(0, 0, 0, 0.001)"
          stroke={!isExporting ? (isSelected ? "#3b82f6" : "rgba(255, 255, 255, 0.45)") : undefined}
          strokeWidth={!isExporting ? (isSelected ? 1.5 : 1) : 0}
          dash={!isExporting ? [6, 4] : undefined}
          listening={!isExporting}
        />

        {/* Text wrapped and centered inside the box */}
        <KonvaText
          key={`${element.id}-${element.fontFamily || "def"}-${fontVersion}`}
          ref={textRef}
          x={0}
          y={0}
          width={boxWidth}
          height={boxHeight}
          text={displayText}
          fontSize={autoFontSize}
          fontFamily={element.fontFamily || DefaultSettings.fontFamily}
          fontStyle={fontStyleString}
          textDecoration={textDecorationString}
          fill={element.color || DefaultSettings.textColor}
          align={element.textAlign || "center"}
          verticalAlign="middle"
          wrap="word"

          // Outline
          stroke={hasOutline ? (element.outlineColor || DefaultSettings.outlineStrokeColor) : undefined}
          strokeWidth={hasOutline ? (element.outlineSize ?? DefaultSettings.outlineStrokeWidth) : 0}
          fillAfterStrokeEnabled={true}
          // Shadow
          shadowColor={hasShadow ? (element.shadowColor || DefaultSettings.shadowColor) : undefined}
          shadowBlur={hasShadow ? (element.shadowBlur ?? DefaultSettings.shadowBlur) : 0}
          shadowOffset={hasShadow ? { x: element.shadowOffsetX ?? DefaultSettings.shadowOffsetX, y: element.shadowOffsetY ?? DefaultSettings.shadowOffsetY } : undefined}
          shadowOpacity={hasShadow ? (element.shadowOpacity ?? DefaultSettings.shadowOpacity) : 0}
          listening={false}
        />
      </Group>

      {/* Transformer for selected box */}
      {isSelected && !isExporting && (
        <Transformer
          ref={(node) => {
            trRef.current = node;
            if (node && groupRef.current) {
              node.nodes([groupRef.current]);
            }
          }}
          enabledAnchors={[
            "top-left", "top-right", "bottom-left", "bottom-right",
            "top-center", "bottom-center", "middle-left", "middle-right"
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 40 || Math.abs(newBox.height) < 25) {
              return oldBox;
            }
            return newBox;
          }}
          anchorSize={8}
          anchorCornerRadius={2}
          borderStroke="#3b82f6"
          borderStrokeWidth={1.5}
        />
      )}
    </>
  );
};


export interface KonvaStageCanvasProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  displayWidth: number;
  displayHeight: number;
  scale: number;
  baseWidth: number;
  baseHeight: number;
  bgImage: HTMLImageElement | null;
  textElements: TextElement[];
  selectedElement: string | null;
  isExporting: boolean;
  watermarkConfig?: WatermarkConfig;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<TextElement>) => void;
  className?: string;
}

export const KonvaStageCanvas: React.FC<KonvaStageCanvasProps> = ({
  stageRef,
  displayWidth,
  displayHeight,
  scale,
  baseWidth,
  baseHeight,
  bgImage,
  textElements,
  selectedElement,
  isExporting,
  watermarkConfig,
  onSelectElement,
  onUpdateElement,
  className = "",
}) => {
  const handleStageMouseDown = (e: any) => {
    // Deselect if clicking on empty stage or background
    if (e.target === e.target.getStage() || (bgImage && e.target.image && e.target.image() === bgImage)) {
      onSelectElement(null);
    }
  };

  return (
    <div
      className={`overflow-hidden select-none ${className}`}
      style={{ width: displayWidth, height: displayHeight, touchAction: "none" }}
    >
      <Stage
        ref={stageRef}
        width={displayWidth}
        height={displayHeight}
        scaleX={scale}
        scaleY={scale}
        onMouseDown={handleStageMouseDown}
        onTouchStart={handleStageMouseDown}
      >
        <Layer>
          {bgImage && (
            <KonvaImage
              image={bgImage}
              width={baseWidth}
              height={baseHeight}
              listening={false}
            />
          )}

          {textElements.map((el) => (
            <EditableTextBox
              key={el.id}
              element={el}
              isSelected={el.id === selectedElement}
              isExporting={isExporting}
              onSelect={() => onSelectElement(el.id)}
              onChange={(updates) => onUpdateElement(el.id, updates)}
            />
          ))}

          {watermarkConfig?.text && watermarkConfig.mode !== "none" && (
            <KonvaText
              text={watermarkConfig.text}
              x={15}
              y={baseHeight - 28}
              fontSize={14}
              fontFamily="Arial"
              fill="rgba(255, 255, 255, 0.85)"
              shadowColor="rgba(0,0,0,0.8)"
              shadowBlur={3}
              shadowOffset={{ x: 1, y: 1 }}
              listening={false}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};
