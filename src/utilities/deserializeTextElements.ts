import { Textbox, Shadow, type Canvas } from "fabric";
import { makeTextboxResizable } from "../hooks/usecase/modules/fixed-size-textbox";
import { DefualtTextSettings } from "../components/types";
import { ensureFontLoaded } from "../utilities/fontLoader";
import { applyDefaultNewShad } from "../hooks/usecase/text-manager";

/**
 * Normalize rotation angle to within -180° → 180°
 */
function normalizeRotation(value: number | null | undefined): number {
  if (typeof value !== "number" || isNaN(value)) return 0;
  value = value % 360;
  if (value > 180) value -= 360;
  return value;
}

/**
 * Safely handle possibly null/undefined numbers
 */
function safeNumber(value: any, fallback = 0): number {
  return typeof value === "number" && !isNaN(value) ? value : fallback;
}

/**
 * Deserialize a single text element from template data into a Fabric Textbox
 */
export function deserializeTextElement(el: any, canvas: Canvas): Textbox {
  const effectType = el.effectType || "none"
  
  // Determine if we should apply outline based on effectType
  const shouldApplyOutline = effectType === "outline"
  const outlineStroke = shouldApplyOutline 
    ? (el.stroke || el.outlineColor || DefualtTextSettings.outlineStrokeColor)
    : undefined
  const outlineWidth = shouldApplyOutline 
    ? safeNumber(el.strokeWidth ?? el.outlineSize, 2)
    : 0
  const shouldApplyNewShad = effectType === "newShadow"
  const shadWidth = shouldApplyNewShad 
    ? safeNumber(el.strokeWidth ?? el.outlineSize, 2)
    : 0.1
  const shadStroke = shouldApplyNewShad 
  ? (el.stroke || el.outlineColor || DefualtTextSettings.outlineStrokeColor)
  : undefined
  
  // Determine if we should apply shadow based on effectType
  const shouldApplyShadow = effectType === "shadow"
  const shadowConfig = shouldApplyShadow && (el.shadow || el.shadowColor)
    ? new Shadow({
        color: el.shadow?.color || computeShadowColor(
          el.shadowColor || "#000000", 
          el.shadowOpacity ?? 0.75
        ),
        blur: safeNumber(el.shadow?.blur ?? el.shadowBlur, 10),
        offsetX: safeNumber(el.shadow?.offsetX ?? el.shadowOffsetX, 5),
        offsetY: safeNumber(el.shadow?.offsetY ?? el.shadowOffsetY, 5),
      })
    : undefined
  ensureFontLoaded(el.fontFamily);
  const textBox = new Textbox(el.text || "", {
    left: safeNumber(el.x, 100),
    top: safeNumber(el.y, 100),
    width: safeNumber(el.width, 200),
    height: safeNumber(el.height, 50),
    fontSize: safeNumber(el.fontSize, DefualtTextSettings.fontSize),
    fontFamily: el.fontFamily || DefualtTextSettings.fontFamily,
    fontStyle: el.fontStyle || "normal",
    fontWeight: el.fontWeight || "normal",
    underline: !!el.underline,
    linethrough: !!el.linethrough,
    textAlign: el.textAlign || "center",
    fill: el.color || el.fill || DefualtTextSettings.textColor,

    // Outline
    stroke: outlineStroke,
    strokeWidth: outlineWidth,
    strokeLineJoin: shouldApplyOutline ? "round" : undefined,
    strokeLineCap: shouldApplyOutline ? "round" : undefined,
    paintFirst: shouldApplyOutline ? DefualtTextSettings.paintFirst: undefined,
    strokeUniform: true,

    // Rotation
    angle: normalizeRotation(el.rotation),

    // Shadow (if any)
    shadow: shadowConfig,
  });

  if (effectType === "newShadow"){
    applyDefaultNewShad(textBox, shadStroke, shadWidth);
  }

  // Restore custom metadata for serialization or editing
  (textBox as any).id = el.id || Date.now().toString() + Math.random();
  (textBox as any).effectType = el.effectType || "none";
  (textBox as any).maxFontSize = safeNumber(el.fontSize, DefualtTextSettings.fontSize);

  ;(textBox as any)._fixedHeight = safeNumber(el.height, 50);

  makeTextboxResizable(textBox, canvas);
  return textBox;
}

/**
 * Load a full template (array of text elements) into the canvas
 */
export function loadTemplateToCanvas(template: { textElements: any[] }, canvas: Canvas, updateList?: () => void) {
  if (!canvas || !template?.textElements) return;

  // Remove existing textboxes
  const existing = canvas.getObjects().filter((obj) => obj instanceof Textbox);
  existing.forEach((obj) => canvas.remove(obj));

  // Add each new text element
  template.textElements.forEach((el) => {
    const textBox = deserializeTextElement(el, canvas);
    canvas.add(textBox);
  });

  canvas.renderAll();
  updateList?.();
}

/**
 * Combine shadowColor + shadowOpacity into RGBA string
 */
function computeShadowColor(color: string, opacity: number | null | undefined): string {
  if (!color) return "rgba(0,0,0,1)";
  const alpha = typeof opacity === "number" ? opacity : 1;

  // If color is already rgba(), just replace alpha
  const rgbaMatch = color.match(/^rgba?\(([^)]+)\)$/);
  if (rgbaMatch) {
    const parts = rgbaMatch[1].split(",").map((v) => v.trim());
    const [r, g, b] = parts;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Otherwise, assume hex color
  const hex = color.replace("#", "");
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
