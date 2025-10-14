// modules/textbox-hover-highlight.ts
import type { Canvas, Textbox } from "fabric"

interface HighlightOptions {
  highlightColor?: string
  highlightDash?: number[]
  normalBorderColor?: string
}

export function enableTextboxHoverHighlight(
  canvas: Canvas,
  options: HighlightOptions = {},
) {
  const {
    highlightColor = "#cccccc",
    highlightDash = [5, 5],
    normalBorderColor = "transparent",
  } = options

  const highlightSet = new Set<Textbox>()

  function highlightAllTextboxes() {
    canvas.getObjects().forEach((obj) => {
      if (obj.type === "textbox") {
        const textbox = obj as Textbox
        if (!highlightSet.has(textbox)) {
          textbox.set({
            stroke: highlightColor,
            strokeDashArray: highlightDash,
            strokeWidth: 1,
          })
          highlightSet.add(textbox)
        }
      }
    })
    canvas.renderAll()
  }

  function clearHighlights() {
    highlightSet.forEach((textbox) => {
      textbox.set({
        stroke: normalBorderColor,
        strokeDashArray: undefined,
        strokeWidth: 0,
      })
    })
    highlightSet.clear()
    canvas.renderAll()
  }

  // When mouse enters canvas, highlight all textboxes
  const handleMouseOver = () => highlightAllTextboxes()
  const handleMouseOut = () => clearHighlights()

  canvas.on("mouse:over", handleMouseOver)
  canvas.on("mouse:out", handleMouseOut)

  // Cleanup method (for unmount/dispose)
  return () => {
    canvas.off("mouse:over", handleMouseOver)
    canvas.off("mouse:out", handleMouseOut)
    clearHighlights()
  }
}
