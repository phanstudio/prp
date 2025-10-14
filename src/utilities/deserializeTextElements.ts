import { Textbox, Shadow, type Canvas } from "fabric";
import { makeTextboxResizable } from "../hooks/usecase/modules/fixed-size-textbox";
import { DefualtTextSettings } from "../components/types";
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
    fill: el.color || el.fill || "#ffffff",

    // Outline
    stroke: el.outlineColor || el.stroke || "#000000",
    strokeWidth: safeNumber(el.outlineSize ?? el.strokeWidth, 0),
    strokeLineJoin: "round",
    strokeLineCap: "round",

    // Rotation
    angle: normalizeRotation(el.rotation),

    // Shadow (if any)
    shadow:
      el.shadowColor
        ? new Shadow({
            color: computeShadowColor(el.shadowColor, el.shadowOpacity),
            blur: safeNumber(el.shadowBlur, 5),
            offsetX: safeNumber(el.shadowOffsetX, 0),
            offsetY: safeNumber(el.shadowOffsetY, 0),
          })
        : undefined,
  });

  // Restore custom metadata for serialization or editing
  (textBox as any).id = el.id || Date.now().toString() + Math.random();
  (textBox as any).effectType = el.effectType || "none";
  (textBox as any).strokeColor = el.outlineColor;
  (textBox as any).strokeWidth = el.outlineSize;
  (textBox as any).shadowColor = el.shadowColor;
  (textBox as any).shadowBlur = el.shadowBlur;
  (textBox as any).shadowOffsetX = el.shadowOffsetX;
  (textBox as any).shadowOffsetY = el.shadowOffsetY;
  (textBox as any).shadowOpacity = el.shadowOpacity;
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
