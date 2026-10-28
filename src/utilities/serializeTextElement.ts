// utils/serializeTextElement.ts
import type { TextElement } from "../components/types";

/**
 * Normalize rotation to stay within -180° → 180°
 */
function normalizeRotation(value: number | undefined): number {
  if (typeof value !== "number" || isNaN(value)) return 0;
  value = value % 360;
  if (value > 180) value -= 360;
  return value;
}

function extractShadowProps(shadow: any) {
  if (!shadow) return {};
  return {
    shadowColor: shadow.color ?? undefined,
    shadowBlur: shadow.blur ?? undefined,
    shadowOffsetX: shadow.offsetX ?? undefined,
    shadowOffsetY: shadow.offsetY ?? undefined,
    shadowOpacity: extractOpacityFromColor(shadow.color),
  };
}

function extractOpacityFromColor(color?: string): number | undefined {
  if (!color) return undefined;
  const rgba = color.match(/^rgba?\(([^)]+)\)$/);
  if (!rgba) return 1;
  const parts = rgba[1].split(",").map((v) => v.trim());
  return parts.length === 4 ? parseFloat(parts[3]) : 1;
}

/**
 * Serialize a text element by extracting only the necessary properties
 * This prevents circular reference errors when saving to backend
 */
export const serializeTextElement = (element: any): TextElement => {
  const shadowProps = extractShadowProps(element.shadow);
  return {
    id: element.id,
    text: element.text,
    x: element.x ?? element.left ?? 0,
    y: element.y ?? element.top ?? 0,
    fontSize: element.fontSize ?? element._maxFontSize ?? 36,
    color: element.color ?? element.fill ?? "#000000",
    fontFamily: element.fontFamily || "Arial",
    rotation: normalizeRotation(element.rotation ?? element.angle ?? 0),
    width: element.width,
    height: element.height,
    
    // Outline / stroke
    outlineColor: element.outlineColor ?? element.stroke ?? undefined,
    outlineSize: element.outlineSize !== undefined ? element.outlineSize : (element.strokeWidth !== undefined ? element.strokeWidth : undefined),
    
    // Formatting
    textAlign: element.textAlign,
    fontWeight: element.fontWeight,
    fontStyle: element.fontStyle,
    underline: element.underline ?? false,
    linethrough: element.linethrough ?? false,
    effectType: element.effectType ?? (element.outlineSize || element.strokeWidth ? "outline" : "none"),
    allCaps: element.allCaps,

    // Shadow
    shadowColor: element.shadowColor ?? shadowProps.shadowColor,
    shadowBlur: element.shadowBlur ?? shadowProps.shadowBlur,
    shadowOffsetX: element.shadowOffsetX ?? shadowProps.shadowOffsetX,
    shadowOffsetY: element.shadowOffsetY ?? shadowProps.shadowOffsetY,
    shadowOpacity: element.shadowOpacity ?? shadowProps.shadowOpacity,
  };
};

/**
 * Serialize an array of text elements
 */
export const serializeTextElements = (elements: any[]): TextElement[] => {
  return elements.map(serializeTextElement);
};