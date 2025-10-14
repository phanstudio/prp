// modules/textbox-hover-outline.ts
import type { Canvas, Rect, Textbox } from "fabric"
import * as fabric from "fabric"

interface OutlineOptions {
  color?: string
  dash?: number[]
  width?: number
  opacity?: number
}

/**
 * Adds temporary bounding-box outlines to all textboxes
 * whenever the mouse is inside the canvas.
 * These are visual only (not selections) and auto-clean up.
 */
export function enableTextboxHoverOutline(
  canvas: Canvas,
  options: OutlineOptions = {},
) {
  const {
    color = "#000",
    dash = [4, 4],
    width = 2,
    opacity = 0.8,
  } = options

  const outlines: Map<Textbox, Rect> = new Map() // Track which outline belongs to which textbox
  let isMouseOverCanvas = false
  let isUpdating = false // Prevent infinite loops
  let transformingObject: Textbox | null = null // Track which object is being transformed

  function createOutlineForTextbox(textbox: Textbox): Rect {
    const rect = new fabric.Rect({
      left: textbox.left,
      top: textbox.top,
      width: textbox.width! * textbox.scaleX!,
      height: textbox.height! * textbox.scaleY!,
      angle: textbox.angle,
      originX: textbox.originX,
      originY: textbox.originY,
      stroke: color,
      strokeDashArray: dash,
      strokeWidth: width,
      opacity,
      fill: "transparent",
      selectable: false,
      evented: false,
      objectCaching: false,
      data: { isOutline: true }, // Mark this as an outline
    } as any)
    rect.setCoords()
    return rect
  }

  function showOutlines() {
    if (isUpdating) return
    isUpdating = true
    
    clearOutlines()
    canvas.getObjects().forEach((obj) => {
      if (obj.type === "textbox" && !(obj as any).data?.isOutline) {
        const textbox = obj as Textbox
        // Skip the outline for the object being transformed
        if (textbox === transformingObject) return
        
        const outline = createOutlineForTextbox(textbox)
        outlines.set(textbox, outline)
        canvas.add(outline)
        canvas.bringObjectToFront(outline)
      }
    })
    canvas.requestRenderAll()
    
    isUpdating = false
  }

  function clearOutlines() {
    if (outlines.size === 0) return
    
    outlines.forEach((outline) => canvas.remove(outline))
    outlines.clear()
    canvas.requestRenderAll()
  }

  function hideOutlineFor(textbox: Textbox) {
    const outline = outlines.get(textbox)
    if (outline) {
      canvas.remove(outline)
      outlines.delete(textbox)
      canvas.requestRenderAll()
    }
  }

  // Track mouse entering canvas
  const handleMouseMove = () => {
    if (!isMouseOverCanvas) {
      isMouseOverCanvas = true
      showOutlines()
    }
  }

  // Track mouse leaving canvas
  const handleMouseOut = (e: fabric.TPointerEventInfo) => {
    // Check if mouse actually left the canvas element
    const evt = e.e as MouseEvent
    const canvasElement = canvas.getElement()
    const rect = canvasElement.getBoundingClientRect()
    
    if (
      evt.clientX < rect.left ||
      evt.clientX > rect.right ||
      evt.clientY < rect.top ||
      evt.clientY > rect.bottom
    ) {
      isMouseOverCanvas = false
      clearOutlines()
    }
  }

  // Hide outline for the specific object being transformed
  const handleTransformStart = (e: any) => {
    if ((e.target as any)?.data?.isOutline) return
    if (e.target?.type === "textbox") {
      transformingObject = e.target as Textbox
      hideOutlineFor(transformingObject)
    }
  }

  // Show outline again when transformation ends
  const handleTransformEnd = (e: any) => {
    if ((e.target as any)?.data?.isOutline) return
    
    transformingObject = null
    if (isMouseOverCanvas) {
      showOutlines()
    }
  }

  // Recreate all outlines when objects are added/removed
  const handleObjectChange = (e: any) => {
    // Ignore events from outline rectangles
    if ((e.target as any)?.data?.isOutline) return
    
    if (isMouseOverCanvas) {
      showOutlines()
    }
  }

  canvas.on("mouse:move", handleMouseMove)
  canvas.on("mouse:out", handleMouseOut)
  canvas.on("object:moving", handleTransformStart)
  canvas.on("object:scaling", handleTransformStart)
  canvas.on("object:rotating", handleTransformStart)
  canvas.on("object:resizing", handleTransformStart) // Added for textbox width resize
  canvas.on("object:modified", handleTransformEnd)
  canvas.on("object:removed", handleObjectChange)
  canvas.on("object:added", handleObjectChange)

  // Cleanup when disposing
  return () => {
    clearOutlines()
    canvas.off("mouse:move", handleMouseMove)
    canvas.off("mouse:out", handleMouseOut)
    canvas.off("object:moving", handleTransformStart)
    canvas.off("object:scaling", handleTransformStart)
    canvas.off("object:rotating", handleTransformStart)
    canvas.off("object:resizing", handleTransformStart) // Clean up the new listener
    canvas.off("object:modified", handleTransformEnd)
    canvas.off("object:removed", handleObjectChange)
    canvas.off("object:added", handleObjectChange)
  }
}