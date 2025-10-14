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
  console.log(element)
  const shadowProps = extractShadowProps(element.shadow);
  return {
    id: element.id,
    text: element.text,
    x: element.x || element.left,
    y: element.y || element.top,
    fontSize: element._maxFontSize ?? element.fontSize,
    color: element.fill,
    fontFamily: element.fontFamily,
    rotation: normalizeRotation(element.rotation),
    width: element.width,
    height: element.height,
    
    // Optional properties
    ...(element.stroke && { outlineColor: element.stroke }),
    ...(element.strokeWidth !== undefined && { outlineSize: element.strokeWidth }),
    ...(element.textAlign && { textAlign: element.textAlign }),
    ...(element.fontWeight && { fontWeight: element.fontWeight }),
    ...(element.fontStyle && { fontStyle: element.fontStyle }),
    ...(element.underline !== undefined && { underline: element.underline }),
    ...(element.linethrough !== undefined && { linethrough: element.linethrough }),
    ...(element.effectType && { effectType: element.effectType }),
    ...shadowProps,
  };
};

/**
 * Serialize an array of text elements
 */
export const serializeTextElements = (elements: any[]): TextElement[] => {
  return elements.map(serializeTextElement);
};