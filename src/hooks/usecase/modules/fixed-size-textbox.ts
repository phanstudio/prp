// //fixed-size-textbox.ts
// import * as fabric from "fabric"

// /**
//  * Makes a textbox have fixed text size while being fully resizable
//  * Text auto-shrinks when it exceeds the bounds (width OR height)
//  */
// export function makeTextboxResizable(
//   textbox: fabric.Textbox,
//   canvas: fabric.Canvas
// ) {
//   const maxFontSize = (textbox as any)._maxFontSize || textbox.fontSize || 40
//   const minFontSize = 8
//   const fixedHeight = (textbox as any)._fixedHeight // 🔒 for restore consistency
  
//   // Remove existing event listeners to prevent duplicates
//   textbox.off("scaling");
//   textbox.off("modified");
//   textbox.off("changed");
  
//   // KEY: Set these properties to make height manually controllable
//   textbox.set({
//     minHeight: 20,
//     splitByGrapheme: true,
//     dynamicMinWidth: 0,
//   })
  
//   // 🔒 If fixedHeight provided, ensure height is set ONCE
//   if (typeof fixedHeight === "number" && !isNaN(fixedHeight)) {
//     textbox.set("height", fixedHeight)
//   }

//   // Store the REAL original calcTextHeight only once
//   if (!(textbox as any)._realOriginalCalcTextHeight) {
//     (textbox as any)._realOriginalCalcTextHeight = fabric.Textbox.prototype.calcTextHeight
//   }
  
//   const realOriginalCalcTextHeight = (textbox as any)._realOriginalCalcTextHeight
  
//   // Override calcTextHeight to return the set height instead of calculated height
//   textbox.calcTextHeight = function() {
//     return textbox.height || realOriginalCalcTextHeight.call(textbox)
//   }
  
//   // Function to get the actual calculated text height (for constraint checking)
//   function getActualTextHeight(): number {
//     return realOriginalCalcTextHeight.call(textbox)
//   }

//   function checkFitsAtFontSize(realFontSize: number): { fitsWidth: boolean; fitsHeight: boolean } {
//     const zoom = canvas.getZoom()

//     // Normalize font size: Fabric actual size = realFontSize / zoom
//     const appliedSize = realFontSize / zoom

//     textbox.set({ fontSize: appliedSize })
//     textbox._clearCache()
    
//     const containerWidth = textbox.width || 200 / zoom
//     const containerHeight = textbox.height || 100 // zoom
    
//     // Check width constraint (no wrapping)
//     const text = textbox.text || ""
//     const lines = text.split("\n")
//     let maxLineWidth = 0
    
//     const ctx = canvas.getContext()
//     const fontString = textbox._getFontDeclaration()
    
//     for (const line of lines) {
//       if (!line) continue
      
//       ctx.save()
//       ctx.font = fontString
//       const metrics = ctx.measureText(line).width
//       ctx.restore()

//       console.log(metrics)
      
//       // normalize measurement (undo zoom)
//       maxLineWidth = Math.max(maxLineWidth, metrics / zoom)
//     }

//     maxLineWidth += 3/zoom // small padding
    
//     // Check height constraint (using true height)
//     const textHeight = getActualTextHeight() / zoom;

//     return {
//       fitsWidth: maxLineWidth <= containerWidth,
//       fitsHeight: textHeight <= containerHeight,
//     }
//   }
  
//   // Function to check if text fits and auto-adjust font size
//   function autoShrinkIfNeeded() {
//     // Binary search for optimal font size (always search up to maxFontSize)
//     let low = minFontSize
//     let high = maxFontSize
//     let bestFit = minFontSize
    
//     // console.log('Auto-shrink called, maxFontSize:', maxFontSize, 'container:', textbox.width, 'x', textbox.height)
    
//     while (low <= high) {
//       const mid = Math.floor((low + high) / 2)
      
//       const { fitsWidth, fitsHeight } = checkFitsAtFontSize(mid)
      
//       // console.log(`Testing fontSize ${mid}: fitsWidth=${fitsWidth}, fitsHeight=${fitsHeight}`)
      
//       if (fitsWidth && fitsHeight) {
//         bestFit = mid
//         low = mid + 1
//       } else {
//         high = mid - 1
//       }
//     }
    
//     // console.log('Best fit fontSize:', bestFit)
    
//     // Set the best fitting font size
//     // textbox.set({ fontSize: bestFit })
//     textbox.set({ fontSize: bestFit / canvas.getZoom() });
//     textbox._clearCache()
//   }
  
//   // Handle resizing via corner dragging
//   textbox.on("scaling", () => {
//     const scaleX = textbox.scaleX || 1
//     const scaleY = textbox.scaleY || 1
    
//     textbox.set({
//       width: (textbox.width || 200) * scaleX,
//       height: (textbox.height || 100) * scaleY,
//       scaleX: 1,
//       scaleY: 1,
//     })
    
//     autoShrinkIfNeeded()
//     canvas.requestRenderAll()
//   })
  
//   textbox.on("modified", () => {
//     autoShrinkIfNeeded()
//     canvas.requestRenderAll()
//   })
  
//   // Auto-shrink when text changes
//   textbox.on("changed", () => {
//     autoShrinkIfNeeded()
//     canvas.requestRenderAll()
//   })
  
//   // Store the max font size and shrink function
//   ;(textbox as any)._maxFontSize = maxFontSize
//   ;(textbox as any)._autoShrinkIfNeeded = autoShrinkIfNeeded
  
//   // Initial check
//   autoShrinkIfNeeded();
//   delete (textbox as any)._fixedHeight;
// }


// //fixed-size-textbox.ts
// import * as fabric from "fabric"

// /**
//  * Makes a textbox have fixed text size while being fully resizable
//  * Text auto-shrinks when it exceeds the bounds (width OR height)
//  */
// export function makeTextboxResizable(
//   textbox: fabric.Textbox,
//   canvas: fabric.Canvas
// ) {
//   const maxFontSize = (textbox as any)._maxFontSize || textbox.fontSize || 40
//   const minFontSize = 8
//   const fixedHeight = (textbox as any)._fixedHeight
  
//   // Remove existing event listeners to prevent duplicates
//   textbox.off("scaling");
//   textbox.off("modified");
//   textbox.off("changed");
  
//   // KEY: Set these properties to make height manually controllable
//   textbox.set({
//     minHeight: 20,
//     splitByGrapheme: true,
//     dynamicMinWidth: 0,
//     lockUniScaling: true, // Prevent uniform scaling issues
//   })
  
//   // 🔒 If fixedHeight provided, ensure height is set ONCE
//   if (typeof fixedHeight === "number" && !isNaN(fixedHeight)) {
//     textbox.set("height", fixedHeight)
//   }

//   // Store the REAL original calcTextHeight only once
//   if (!(textbox as any)._realOriginalCalcTextHeight) {
//     (textbox as any)._realOriginalCalcTextHeight = fabric.Textbox.prototype.calcTextHeight
//   }
  
//   const realOriginalCalcTextHeight = (textbox as any)._realOriginalCalcTextHeight
  
//   // Override calcTextHeight to return the set height instead of calculated height
//   textbox.calcTextHeight = function() {
//     return textbox.height || realOriginalCalcTextHeight.call(textbox)
//   }
  
//   // Function to get the actual calculated text height (for constraint checking)
//   function getActualTextHeight(): number {
//     return realOriginalCalcTextHeight.call(textbox)
//   }

//   function checkFitsAtFontSize(realFontSize: number): { fitsWidth: boolean; fitsHeight: boolean } {
//     // Save current font size
//     const originalFontSize = textbox.fontSize;
    
//     try {
//       // Set the font size directly (no zoom division)
//       textbox.set({ fontSize: realFontSize });
//       textbox._clearCache();
      
//       // Force text layout calculation
//       textbox.initDimensions();
      
//       const containerWidth = textbox.width || 200;
//       const containerHeight = textbox.height || 100;
      
//       // Get actual text dimensions from Fabric
//       const textLines = textbox._textLines || [];
//       let maxLineWidth = 0;
      
//       // Calculate maximum line width
//       if (textLines.length > 0) {
//         const ctx = canvas.getContext();
//         const originalTransform = ctx.getTransform();
        
//         // Reset transform to get accurate measurements
//         ctx.setTransform(1, 0, 0, 1, 0, 0);
        
//         // Use Fabric's text measurement
//         for (let i = 0; i < textLines.length; i++) {
//           const lineWidth = textbox.getLineWidth(i);
//           maxLineWidth = Math.max(maxLineWidth, lineWidth);
//         }
        
//         // Restore transform
//         ctx.setTransform(originalTransform);
//       }
      
//       // Add some padding for safety
//       maxLineWidth += 3;
      
//       // Get actual text height
//       const textHeight = getActualTextHeight();
      
//       return {
//         fitsWidth: maxLineWidth <= containerWidth,
//         fitsHeight: textHeight <= containerHeight,
//       };
//     } finally {
//       // Restore original font size
//       textbox.set({ fontSize: originalFontSize });
//     }
//   }
  
//   // Function to check if text fits and auto-adjust font size
//   function autoShrinkIfNeeded() {
//     // Don't shrink if text is empty
//     if (!textbox.text || textbox.text.trim() === "") {
//       return;
//     }
    
//     // Binary search for optimal font size (always search up to maxFontSize)
//     let low = minFontSize
//     let high = maxFontSize
//     let bestFit = minFontSize
    
//     while (low <= high) {
//       const mid = Math.floor((low + high) / 2)
      
//       const { fitsWidth, fitsHeight } = checkFitsAtFontSize(mid)
      
//       if (fitsWidth && fitsHeight) {
//         bestFit = mid
//         low = mid + 1
//       } else {
//         high = mid - 1
//       }
//     }
    
//     // Set the best fitting font size
//     textbox.set({ fontSize: bestFit });
//     textbox._clearCache();
//     textbox.initDimensions();
    
//     canvas.requestRenderAll();
//   }
  
//   // Handle resizing via corner dragging
//   textbox.on("scaling", () => {
//     const scaleX = textbox.scaleX || 1
//     const scaleY = textbox.scaleY || 1
    
//     textbox.set({
//       width: (textbox.width || 200) * scaleX,
//       height: (textbox.height || 100) * scaleY,
//       scaleX: 1,
//       scaleY: 1,
//     })
    
//     autoShrinkIfNeeded()
//     canvas.requestRenderAll()
//   })
  
//   textbox.on("modified", () => {
//     autoShrinkIfNeeded()
//     canvas.requestRenderAll()
//   })
  
//   // Auto-shrink when text changes
//   textbox.on("changed", () => {
//     autoShrinkIfNeeded()
//     canvas.requestRenderAll()
//   })
  
//   // Store the max font size and shrink function
//   ;(textbox as any)._maxFontSize = maxFontSize
//   ;(textbox as any)._autoShrinkIfNeeded = autoShrinkIfNeeded
  
//   // Initial check
//   autoShrinkIfNeeded();
//   delete (textbox as any)._fixedHeight;
// }


// //fixed-size-textbox.ts
// import * as fabric from "fabric"

// /**
//  * Makes a textbox have fixed text size while being fully resizable
//  * Text auto-shrinks when it exceeds the bounds (width OR height)
//  */
// export function makeTextboxResizable(
//   textbox: fabric.Textbox,
//   canvas: fabric.Canvas
// ) {
//   const maxFontSize = (textbox as any)._maxFontSize || textbox.fontSize || 40
//   const minFontSize = 4 // Lower minFontSize for mobile
//   const fixedHeight = (textbox as any)._fixedHeight
  
//   // Remove existing event listeners to prevent duplicates
//   textbox.off("scaling");
//   textbox.off("modified");
//   textbox.off("changed");
  
//   // KEY: Set these properties to make height manually controllable
//   textbox.set({
//     minHeight: 20,
//     splitByGrapheme: true,
//     dynamicMinWidth: 0,
//     lockUniScaling: true,
//     lockScalingFlip: true,
//     noScaleCache: false, // Keep cache for performance
//   })
  
//   // 🔒 If fixedHeight provided, ensure height is set ONCE
//   if (typeof fixedHeight === "number" && !isNaN(fixedHeight)) {
//     textbox.set("height", fixedHeight)
//   }

//   // Store the REAL original calcTextHeight only once
//   if (!(textbox as any)._realOriginalCalcTextHeight) {
//     (textbox as any)._realOriginalCalcTextHeight = fabric.Textbox.prototype.calcTextHeight
//   }
  
//   const realOriginalCalcTextHeight = (textbox as any)._realOriginalCalcTextHeight
  
//   // Override calcTextHeight to return the set height instead of calculated height
//   textbox.calcTextHeight = function() {
//     return textbox.height || realOriginalCalcTextHeight.call(textbox)
//   }

//   function checkFitsAtFontSize(fontSize: number): { fitsWidth: boolean; fitsHeight: boolean } {
//     // Save current state
//     const originalFontSize = textbox.fontSize;
//     const originalScaleX = textbox.scaleX || 1;
//     const originalScaleY = textbox.scaleY || 1;
    
//     try {
//       // Set font size without any zoom adjustment
//       textbox.set({ 
//         fontSize: fontSize,
//         scaleX: 1,
//         scaleY: 1
//       });
      
//       // Force recalculation
//       textbox._clearCache();
//       textbox.initDimensions();
      
//       const containerWidth = Math.max(1, textbox.width || 1);
//       const containerHeight = Math.max(1, textbox.height || 1);
      
//       // Use Fabric's built-in measurement methods
//       let measuredWidth = 0;
//       let measuredHeight = 0;
      
//       // Get the actual text measurements from Fabric
//       const textLines = textbox._textLines || [];
      
//       if (textLines.length > 0) {
//         // Calculate total width (max line width)
//         for (let i = 0; i < textLines.length; i++) {
//           // Use the public method getLineWidth instead of _getLineWidth
//           const lineWidth = textbox.getLineWidth(i);
//           measuredWidth = Math.max(measuredWidth, lineWidth);
//         }
        
//         // Calculate total height
//         // Use the actual height calculation method
//         measuredHeight = realOriginalCalcTextHeight.call(textbox);
        
//         // Add some padding for safety
//         measuredWidth += 4; // 2px padding on each side
//         measuredHeight += 4; // 2px padding top and bottom
//       }
      
//       return {
//         fitsWidth: measuredWidth <= containerWidth,
//         fitsHeight: measuredHeight <= containerHeight,
//       };
//     } catch (error) {
//       console.warn("Error checking font size fit:", error);
//       // If measurement fails, assume it doesn't fit
//       return { fitsWidth: false, fitsHeight: false };
//     } finally {
//       // Restore original state
//       textbox.set({ 
//         fontSize: originalFontSize,
//         scaleX: originalScaleX,
//         scaleY: originalScaleY
//       });
//       textbox._clearCache();
//     }
//   }
  
//   // Function to check if text fits and auto-adjust font size
//   function autoShrinkIfNeeded() {
//     // Don't process if no text
//     if (!textbox.text || textbox.text.trim() === "") {
//       return;
//     }
    
//     // Get current container size
//     const containerWidth = Math.max(1, textbox.width || 1);
//     const containerHeight = Math.max(1, textbox.height || 1);
    
//     // If container is too small, use a simplified approach
//     if (containerWidth < 10 || containerHeight < 10) {
//       // For very small containers, use a simple calculation
//       const minPossibleSize = Math.max(minFontSize, 1);
//       textbox.set({ fontSize: minPossibleSize });
//       textbox._clearCache();
//       canvas.requestRenderAll();
//       return;
//     }
    
//     // Use binary search for optimal font size
//     let low = minFontSize;
//     let high = Math.min(maxFontSize, Math.max(containerWidth, containerHeight) * 2);
//     let bestFit = minFontSize;
//     let iterations = 0;
//     const maxIterations = 20; // Prevent infinite loops
    
//     while (low <= high && iterations < maxIterations) {
//       iterations++;
//       const mid = Math.floor((low + high) / 2);
      
//       try {
//         const { fitsWidth, fitsHeight } = checkFitsAtFontSize(mid);
        
//         if (fitsWidth && fitsHeight) {
//           bestFit = mid;
//           low = mid + 1;
//         } else {
//           high = mid - 1;
//         }
//       } catch (error) {
//         // If checking fails at this size, try a smaller size
//         high = mid - 1;
//       }
//     }
    
//     // Ensure we don't set an invalid font size
//     const safeFontSize = Math.max(minFontSize, Math.min(bestFit, maxFontSize));
    
//     // Set the font size
//     textbox.set({ fontSize: safeFontSize });
//     textbox._clearCache();
//     textbox.initDimensions();
    
//     canvas.requestRenderAll();
//   }
  
//   // Handle resizing via corner dragging
//   textbox.on("scaling", () => {
//     const scaleX = textbox.scaleX || 1;
//     const scaleY = textbox.scaleY || 1;
    
//     // Calculate new dimensions
//     let newWidth = (textbox.width || 200) * scaleX;
//     let newHeight = (textbox.height || 100) * scaleY;
    
//     // Enforce minimum size for mobile
//     newWidth = Math.max(10, newWidth);
//     newHeight = Math.max(10, newHeight);
    
//     textbox.set({
//       width: newWidth,
//       height: newHeight,
//       scaleX: 1,
//       scaleY: 1,
//     });
    
//     autoShrinkIfNeeded();
//     canvas.requestRenderAll();
//   });
  
//   textbox.on("modified", () => {
//     autoShrinkIfNeeded();
//     canvas.requestRenderAll();
//   });
  
//   // Auto-shrink when text changes
//   textbox.on("changed", () => {
//     autoShrinkIfNeeded();
//     canvas.requestRenderAll();
//   });
  
//   // Also handle when the object is being scaled via controls
//   textbox.on("moving", () => {
//     // Ensure dimensions are valid
//     if (textbox.width < 10 || textbox.height < 10) {
//       textbox.set({
//         width: Math.max(10, textbox.width || 10),
//         height: Math.max(10, textbox.height || 10),
//       });
//     }
//   });
  
//   // Store the max font size and shrink function
//   (textbox as any)._maxFontSize = maxFontSize;
//   (textbox as any)._autoShrinkIfNeeded = autoShrinkIfNeeded;
  
//   // Initial check with a small delay to ensure everything is loaded
//   setTimeout(() => {
//     autoShrinkIfNeeded();
//   }, 10);
  
//   delete (textbox as any)._fixedHeight;
// }

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
  const minFontSize = 4 // Lower minFontSize for mobile
  const fixedHeight = (textbox as any)._fixedHeight
  
  // Remove existing event listeners to prevent duplicates
  textbox.off("scaling");
  textbox.off("modified");
  textbox.off("changed");
  
  // KEY: Set these properties to make height manually controllable
  textbox.set({
    minHeight: 20,
    splitByGrapheme: true,
    dynamicMinWidth: 0,
    lockUniScaling: true,
    lockScalingFlip: true,
    noScaleCache: false,
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

  function checkFitsAtFontSize(fontSize: number): { fitsWidth: boolean; fitsHeight: boolean } {
    // Save current state
    const originalFontSize = textbox.fontSize;
    
    try {
      // Set the font size
      textbox.set({ fontSize: fontSize });
      textbox._clearCache();
      
      // Initialize dimensions to get accurate measurements
      textbox.initDimensions();
      
      const containerWidth = Math.max(1, textbox.width || 1);
      const containerHeight = Math.max(1, textbox.height || 1);
      
      // Get the text lines
      const textLines = textbox._textLines || [];
      
      if (textLines.length === 0) {
        return { fitsWidth: true, fitsHeight: true };
      }
      
      // Get canvas context for accurate measurement
      const ctx = canvas.getContext();
      
      // Save current transform
      ctx.save();
      
      // Reset transform to get pixel-perfect measurements
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      
      // Set the font
      const fontString = textbox._getFontDeclaration();
      ctx.font = fontString;
      
      // Calculate the maximum line width in pixels
      let maxLineWidth = 0;
      for (const line of textLines) {
        if (line) {
          const metrics = ctx.measureText(line.join());
          maxLineWidth = Math.max(maxLineWidth, metrics.width);
        }
      }
      
      // Restore context
      ctx.restore();
      
      // Calculate actual text height
      const textHeight = realOriginalCalcTextHeight.call(textbox);
      
      // Add small padding for safety
      const paddedMaxLineWidth = maxLineWidth + 4;
      const paddedTextHeight = textHeight + 4;
      
      return {
        fitsWidth: paddedMaxLineWidth <= containerWidth,
        fitsHeight: paddedTextHeight <= containerHeight,
      };
    } catch (error) {
      console.warn("Error checking font size fit:", error);
      return { fitsWidth: false, fitsHeight: false };
    } finally {
      // Restore original font size
      textbox.set({ fontSize: originalFontSize });
      textbox._clearCache();
    }
  }
  
  // Function to check if text fits and auto-adjust font size
  function autoShrinkIfNeeded() {
    // Don't process if no text
    if (!textbox.text || textbox.text.trim() === "") {
      return;
    }
    
    // Get current container size
    const containerWidth = Math.max(1, textbox.width || 1);
    const containerHeight = Math.max(1, textbox.height || 1);
    
    // If container is too small, use a simplified approach
    if (containerWidth < 10 || containerHeight < 10) {
      const minPossibleSize = Math.max(minFontSize, 1);
      textbox.set({ fontSize: minPossibleSize });
      textbox._clearCache();
      canvas.requestRenderAll();
      return;
    }
    
    // Use binary search for optimal font size
    let low = minFontSize;
    let high = Math.min(maxFontSize, Math.max(containerWidth, containerHeight) * 2);
    let bestFit = minFontSize;
    let iterations = 0;
    const maxIterations = 20;
    
    while (low <= high && iterations < maxIterations) {
      iterations++;
      const mid = Math.floor((low + high) / 2);
      
      try {
        const { fitsWidth, fitsHeight } = checkFitsAtFontSize(mid);
        
        if (fitsWidth && fitsHeight) {
          bestFit = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      } catch (error) {
        high = mid - 1;
      }
    }
    
    // Ensure we don't set an invalid font size
    const safeFontSize = Math.max(minFontSize, Math.min(bestFit, maxFontSize));
    
    // Set the font size
    textbox.set({ fontSize: safeFontSize });
    textbox._clearCache();
    textbox.initDimensions();
    
    canvas.requestRenderAll();
  }
  
  // Handle resizing via corner dragging
  textbox.on("scaling", () => {
    const scaleX = textbox.scaleX || 1;
    const scaleY = textbox.scaleY || 1;
    
    let newWidth = (textbox.width || 200) * scaleX;
    let newHeight = (textbox.height || 100) * scaleY;
    
    newWidth = Math.max(10, newWidth);
    newHeight = Math.max(10, newHeight);
    
    textbox.set({
      width: newWidth,
      height: newHeight,
      scaleX: 1,
      scaleY: 1,
    });
    
    autoShrinkIfNeeded();
    canvas.requestRenderAll();
  });
  
  textbox.on("modified", () => {
    autoShrinkIfNeeded();
    canvas.requestRenderAll();
  });
  
  textbox.on("changed", () => {
    autoShrinkIfNeeded();
    canvas.requestRenderAll();
  });
  
  textbox.on("moving", () => {
    if (textbox.width < 10 || textbox.height < 10) {
      textbox.set({
        width: Math.max(10, textbox.width || 10),
        height: Math.max(10, textbox.height || 10),
      });
    }
  });
  
  (textbox as any)._maxFontSize = maxFontSize;
  (textbox as any)._autoShrinkIfNeeded = autoShrinkIfNeeded;
  
  setTimeout(() => {
    autoShrinkIfNeeded();
  }, 10);
  
  delete (textbox as any)._fixedHeight;
}