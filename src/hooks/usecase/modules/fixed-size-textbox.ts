//fixed-size-textbox.ts
import * as fabric from "fabric"

/**
 * Makes a textbox have fixed text size while being fully resizable
 * Text auto-shrinks when it exceeds the bounds (width OR height)
 */
export function makeTextboxResizable(
  textbox: fabric.Textbox,
  canvas: fabric.Canvas
) {
  const maxFontSize = (textbox as any)._maxFontSize || textbox.fontSize || 40
  const minFontSize = 8
  const fixedHeight = (textbox as any)._fixedHeight // 🔒 for restore consistency
  
  // Remove existing event listeners to prevent duplicates
  textbox.off("scaling");
  textbox.off("modified");
  textbox.off("changed");
  
  // KEY: Set these properties to make height manually controllable
  textbox.set({
    minHeight: 20,
    splitByGrapheme: true,
    dynamicMinWidth: 0,
  })
  
  // 🔒 If fixedHeight provided, ensure height is set ONCE
  if (typeof fixedHeight === "number" && !isNaN(fixedHeight)) {
    textbox.set("height", fixedHeight)
  }

  // Store the REAL original calcTextHeight only once
  if (!(textbox as any)._realOriginalCalcTextHeight) {
    (textbox as any)._realOriginalCalcTextHeight = fabric.Textbox.prototype.calcTextHeight
  }
  
  const realOriginalCalcTextHeight = (textbox as any)._realOriginalCalcTextHeight
  
  // Override calcTextHeight to return the set height instead of calculated height
  textbox.calcTextHeight = function() {
    return textbox.height || realOriginalCalcTextHeight.call(textbox)
  }
  
  // Function to get the actual calculated text height (for constraint checking)
  function getActualTextHeight(): number {
    return realOriginalCalcTextHeight.call(textbox)
  }

  // // Function to check if text fits with a given font size
  // function checkFitsAtFontSize(fontSize: number): { fitsWidth: boolean; fitsHeight: boolean } {
  //   // Set font size for measurement
  //   textbox.set({ fontSize })
  //   textbox._clearCache()
    
  //   const containerWidth = textbox.width || 200
  //   const containerHeight = textbox.height || 100
  //   console.log(containerWidth)
    
  //   // Get stroke width to account for outline
  //   // const strokeWidth = textbox.strokeWidth || 0
  //   // const strokePadding = strokeWidth //* 2 // Account for both sides
    
  //   // Check width constraint (unwrapped lines)
  //   const text = textbox.text || ""
  //   const lines = text.split('\n')
  //   let maxLineWidth = 0
  //   const zoom = canvas.getZoom();
    
  //   const ctx = canvas.getContext()
  //   const fontString = textbox._getFontDeclaration()
  //   for (const line of lines) {
  //     if (!line) continue
  //     ctx.save()
  //     ctx.font = fontString
      
  //     // const metrics = ctx.measureText(line);
  //     const metrics = ctx.measureText(line).width / zoom;
  //     maxLineWidth = Math.max(maxLineWidth, metrics)//.width)
  //     ctx.restore()
  //   }

  //   console.log(maxLineWidth, zoom, "news")

  //   // Add padding for outline and general spacing
  //   maxLineWidth += 3 //+ strokePadding
    
  //   // Check height constraint (with wrapping applied) - use REAL calculation
  //   const textHeight = getActualTextHeight()/zoom //+ strokePadding
    
  //   return {
  //     fitsWidth: maxLineWidth <= containerWidth,
  //     fitsHeight: textHeight <= containerHeight
  //   }
  // }

  function checkFitsAtFontSize(realFontSize: number): { fitsWidth: boolean; fitsHeight: boolean } {
    const zoom = canvas.getZoom()

    // Normalize font size: Fabric actual size = realFontSize / zoom
    const appliedSize = realFontSize / zoom

    textbox.set({ fontSize: appliedSize })
    textbox._clearCache()
    
    const containerWidth = textbox.width || 200
    const containerHeight = textbox.height || 100
    
    // Check width constraint (no wrapping)
    const text = textbox.text || ""
    const lines = text.split("\n")
    let maxLineWidth = 0
    
    console.log(canvas)
    const ctx = canvas.getContext()
    const fontString = textbox._getFontDeclaration()
    
    for (const line of lines) {
      if (!line) continue
      
      ctx.save()
      ctx.font = fontString
      const metrics = ctx.measureText(line).width
      ctx.restore()
      
      // normalize measurement (undo zoom)
      maxLineWidth = Math.max(maxLineWidth, metrics / zoom)
    }

    maxLineWidth += 3 // small padding
    
    // Check height constraint (using true height)
    const textHeight = getActualTextHeight() / zoom;

    return {
      fitsWidth: maxLineWidth <= containerWidth,
      fitsHeight: textHeight <= containerHeight,
    }
  }
  
  // Function to check if text fits and auto-adjust font size
  function autoShrinkIfNeeded() {
    // Binary search for optimal font size (always search up to maxFontSize)
    let low = minFontSize
    let high = maxFontSize
    let bestFit = minFontSize
    
    // console.log('Auto-shrink called, maxFontSize:', maxFontSize, 'container:', textbox.width, 'x', textbox.height)
    
    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      
      const { fitsWidth, fitsHeight } = checkFitsAtFontSize(mid)
      
      // console.log(`Testing fontSize ${mid}: fitsWidth=${fitsWidth}, fitsHeight=${fitsHeight}`)
      
      if (fitsWidth && fitsHeight) {
        bestFit = mid
        low = mid + 1
      } else {
        high = mid - 1
      }
    }
    
    // console.log('Best fit fontSize:', bestFit)
    
    // Set the best fitting font size
    // textbox.set({ fontSize: bestFit })
    textbox.set({ fontSize: bestFit / canvas.getZoom() });
    textbox._clearCache()
  }
  
  // Handle resizing via corner dragging
  textbox.on("scaling", () => {
    const scaleX = textbox.scaleX || 1
    const scaleY = textbox.scaleY || 1
    
    textbox.set({
      width: (textbox.width || 200) * scaleX,
      height: (textbox.height || 100) * scaleY,
      scaleX: 1,
      scaleY: 1,
    })
    
    autoShrinkIfNeeded()
    canvas.requestRenderAll()
  })
  
  textbox.on("modified", () => {
    autoShrinkIfNeeded()
    canvas.requestRenderAll()
  })
  
  // Auto-shrink when text changes
  textbox.on("changed", () => {
    autoShrinkIfNeeded()
    canvas.requestRenderAll()
  })
  
  // Store the max font size and shrink function
  ;(textbox as any)._maxFontSize = maxFontSize
  ;(textbox as any)._autoShrinkIfNeeded = autoShrinkIfNeeded
  
  // Initial check
  autoShrinkIfNeeded();
  delete (textbox as any)._fixedHeight;
}
