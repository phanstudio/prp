import { Canvas, Textbox, type ImageFormat } from "fabric";
import { applyNewShadFinal } from "../../../hooks/usecase/text-manager";

/**
 * Generates a high-resolution PNG Data URL from a Fabric canvas,
 * baking custom _newShadow effects for export and restoring them afterward.
 *
 * @param canvas Fabric canvas instance
 * @param multiplier Export scale multiplier (default 3)
 * @returns PNG data URL
 */
export function SaveCanvas(canvas: Canvas, format: ImageFormat = "png", quality: number = 1, multiplier: number = 3): string {
    if (!canvas) return "";
  
    const newShadowObjects: Textbox[] = [];
  
    // Bake blur/outline for all text with _newShadow
    canvas.getObjects().forEach((obj: any) => {
      if (obj instanceof Textbox && (obj as any)._newShadow) {
        newShadowObjects.push(obj);
        applyNewShadFinal(obj, obj.strokeWidth || 2, multiplier);
      }
    });
  
    // Generate high-res PNG
    const dataURL = canvas.toDataURL({
      format: format,
      quality: quality,
      multiplier,
    });
  
    // Restore on-canvas preview
    newShadowObjects.forEach((obj) => {
      applyNewShadFinal(obj, obj.strokeWidth || 2, 1);
    });
  
    return dataURL;
  }