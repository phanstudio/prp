import { Canvas, Textbox, Shadow } from "fabric"
import * as fabric from "fabric"
import { makeTextboxResizable } from "./modules/fixed-size-textbox"
import type { TextAlignType, FontStyleType, TextEffectType } from "../../components/types"

export interface TextProperties {
  text?: string
  fontSize?: number
  fontFamily?: string
  fill?: string
  textAlign?: TextAlignType
  fontWeight?: string | number
  fontStyle?: FontStyleType
  underline?: boolean
  linethrough?: boolean
  effectType?: TextEffectType
  // Shadow properties
  shadowColor?: string
  shadowBlur?: number
  shadowOffsetX?: number
  shadowOffsetY?: number
  shadowOpacity?: number
  // Outline properties
  strokeColor?: string
  strokeWidth?: number

  maxFontSize?: number
}

export class TextManager {
  private canvas: Canvas | null = null
  private selectedText: Textbox | null = null
  private selectionChangeCallback: ((isSelected: boolean) => void) | null = null

  /**
   * Initialize the text manager with a fabric canvas
   */
  init(canvas: Canvas) {
    this.canvas = canvas
    this.setupSelectionListeners()
  }

  /**
   * Setup listeners for text selection changes
   */
  private setupSelectionListeners() {
    if (!this.canvas) return

    this.canvas.on("selection:created", (e) => {
      if (e.selected && e.selected[0] instanceof fabric.Textbox) {
        this.selectedText = e.selected[0] as Textbox
        this.selectionChangeCallback?.(true)
      }
    })

    this.canvas.on("selection:updated", (e) => {
      if (e.selected && e.selected[0] instanceof fabric.Textbox) {
        this.selectedText = e.selected[0] as Textbox
        this.selectionChangeCallback?.(true)
      } else {
        this.selectedText = null
        this.selectionChangeCallback?.(false)
      }
    })

    this.canvas.on("selection:cleared", () => {
      this.selectedText = null
      this.selectionChangeCallback?.(false)
    })
  }

  /**
   * Register callback for selection changes
   */
  onSelectionChange(callback: (isSelected: boolean) => void) {
    this.selectionChangeCallback = callback
  }

  /**
   * Get currently selected text object
   */
  getSelectedText(): Textbox | null {
    return this.selectedText
  }

  /**
   * Get properties of currently selected text
   */
  getSelectedTextProperties(): TextProperties | null {
    if (!this.selectedText) return null

    const shadow = this.selectedText.shadow as Shadow | null
    const hasStroke = (this.selectedText.strokeWidth || 0) > 0
    const hasShadow = shadow !== null

    let effectType: TextEffectType = "none"
    if (hasStroke) effectType = "outline"
    else if (hasShadow) effectType = "shadow"

    return {
      text: this.selectedText.text,
      fontSize: this.selectedText.fontSize,
      fontFamily: this.selectedText.fontFamily,
      fill: this.selectedText.fill as string,
      textAlign: this.selectedText.textAlign as TextAlignType,
      fontWeight: this.selectedText.fontWeight,
      fontStyle: this.selectedText.fontStyle as FontStyleType,
      underline: this.selectedText.underline,
      linethrough: this.selectedText.linethrough,
      effectType,
      shadowColor: shadow?.color || "#000000",
      shadowBlur: shadow?.blur || 10,
      shadowOffsetX: shadow?.offsetX || 5,
      shadowOffsetY: shadow?.offsetY || 5,
      shadowOpacity: shadow?.color ? this.parseShadowOpacity(shadow.color) : 0.75,
      strokeColor: this.selectedText.stroke as string || "#000000",
      strokeWidth: this.selectedText.strokeWidth || 2,
      maxFontSize: (this.selectedText as any)._maxFontSize || this.selectedText.fontSize,
    }
  }

  /**
   * Parse opacity from rgba color string
   */
  private parseShadowOpacity(color: string): number {
    if (color.startsWith("rgba")) {
      const match = color.match(/rgba\([^,]+,[^,]+,[^,]+,([^)]+)\)/)
      return match ? parseFloat(match[1]) : 1
    }
    return 1
  }

  /**
   * Convert hex color and opacity to rgba
   */
  private colorWithOpacity(color: string, opacity: number): string {
    // If already rgba, replace opacity
    if (color.startsWith("rgba")) {
      return color.replace(/,([^,]+)\)$/, `,${opacity})`)
    }
    
    // Convert hex to rgb
    const hex = color.replace("#", "")
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }

  /**
   * Apply shadow effect to selected text
   */
  private applyShadow(properties: TextProperties) {
    if (!this.selectedText) return

    const shadowColor = this.colorWithOpacity(
      properties.shadowColor || "#000000",
      properties.shadowOpacity || 0.75
    )

    this.selectedText.set({
      shadow: new Shadow({
        color: shadowColor,
        blur: properties.shadowBlur || 10,
        offsetX: properties.shadowOffsetX || 5,
        offsetY: properties.shadowOffsetY || 5,
      }),
      stroke: undefined,
      strokeWidth: 0,
    })
  }

  /**
   * Apply outline effect to selected text
   */
  private applyOutline(properties: TextProperties) {
    if (!this.selectedText) return

    this.selectedText.set({
      stroke: properties.strokeColor || "#000000",
      strokeWidth: properties.strokeWidth || 2,
      strokeLineJoin: "round",
      strokeLineCap: "round",
      shadow: null,
    })
  }

  /**
   * Remove all effects from selected text
   */
  private removeEffects() {
    if (!this.selectedText) return

    this.selectedText.set({
      shadow: null,
      stroke: undefined,
      strokeWidth: 0,
    })
  }

  /**
   * Update properties of currently selected text
   */
  updateSelectedText(properties: TextProperties): boolean {
    if (!this.selectedText || !this.canvas) return false

    // Handle effect type changes
    if (properties.effectType !== undefined) {
      switch (properties.effectType) {
        case "shadow":
          this.applyShadow(properties)
          break
        case "outline":
          this.applyOutline(properties)
          break
        case "none":
          this.removeEffects()
          break
      }
    } else {
      // If no effect type specified, but shadow/outline properties are provided
      // update the current effect
      const currentProps = this.getSelectedTextProperties()
      if (currentProps?.effectType === "shadow" && 
          (properties.shadowColor || properties.shadowBlur !== undefined || 
           properties.shadowOffsetX !== undefined || properties.shadowOffsetY !== undefined ||
           properties.shadowOpacity !== undefined)) {
        this.applyShadow({ ...currentProps, ...properties })
      } else if (currentProps?.effectType === "outline" && 
                 (properties.strokeColor || properties.strokeWidth !== undefined)) {
        this.applyOutline({ ...currentProps, ...properties })
      }
    }

    // Update basic text properties
    const basicProps: any = {}
    
    if (properties.text !== undefined) basicProps.text = properties.text
    if (properties.fontSize !== undefined) basicProps.fontSize = properties.fontSize
    if (properties.fontFamily !== undefined) basicProps.fontFamily = properties.fontFamily
    if (properties.fill !== undefined) basicProps.fill = properties.fill
    if (properties.textAlign !== undefined) basicProps.textAlign = properties.textAlign
    if (properties.fontWeight !== undefined) basicProps.fontWeight = properties.fontWeight
    if (properties.fontStyle !== undefined) basicProps.fontStyle = properties.fontStyle
    if (properties.underline !== undefined) basicProps.underline = properties.underline
    if (properties.linethrough !== undefined) basicProps.linethrough = properties.linethrough
    if (properties.maxFontSize !== undefined) basicProps.maxFontSize = properties.maxFontSize

    if (Object.keys(basicProps).length > 0) {
      this.selectedText.set(basicProps);
      if (properties.maxFontSize !== undefined && properties.text === undefined) {
        (this.selectedText as any)._maxFontSize = properties.maxFontSize;
        makeTextboxResizable(this.selectedText, this.canvas);
      }
    }

    // Trigger auto-adjust for text content changes or any property that affects layout
    if (properties.text !== undefined || properties.maxFontSize !== undefined || 
        properties.fontFamily !== undefined || properties.fontWeight !== undefined) {
      (this.selectedText as any)._autoShrinkIfNeeded?.();
    }
    // this.canvas.renderAll()
    // if (properties.text !== undefined) {
    //   (this.selectedText as any)._autoShrinkIfNeeded?.();
    //   // this.canvas.requestRenderAll();
    // }
    this.canvas.requestRenderAll();
    return true
  }

  getAllTextElements(): any[] {
    if (!this.canvas) return []
  
    return this.canvas.getObjects()
      .filter((obj) => obj instanceof fabric.Textbox)
      .map((obj) => {
        const textbox = obj as Textbox
        const shadow = textbox.shadow as Shadow | null
        
        return {
          id: (textbox as any).id,
          text: textbox.text,
          x: textbox.left,
          y: textbox.top,
          fontSize: textbox.fontSize,
          fontFamily: textbox.fontFamily,
          fill: textbox.fill,
          textAlign: textbox.textAlign,
          fontWeight: textbox.fontWeight,
          fontStyle: textbox.fontStyle,
          underline: textbox.underline,
          linethrough: textbox.linethrough,
          rotation: textbox.angle,
          width: textbox.width,
          height: textbox.height,
          _maxFontSize: (textbox as any)._maxFontSize ?? textbox.fontSize,
          // Outline properties
          stroke: textbox.stroke,
          strokeWidth: textbox.strokeWidth,
          strokeLineJoin: textbox.strokeLineJoin,
          strokeLineCap: textbox.strokeLineCap,
          // Shadow properties
          shadow: shadow ? {
            color: shadow.color,
            blur: shadow.blur,
            offsetX: shadow.offsetX,
            offsetY: shadow.offsetY,
          } : null,
        }
      })
  }

  /**
   * Check if there's a selected text object
   */
  hasSelectedText(): boolean {
    return this.selectedText !== null
  }

  /**
   * Dispose of the text manager
   */
  dispose() {
    if (this.canvas) {
      this.canvas.off("selection:created")
      this.canvas.off("selection:updated")
      this.canvas.off("selection:cleared")
    }
    
    this.canvas = null
    this.selectedText = null
    this.selectionChangeCallback = null
  }
}

/**
 * Helper function to create text manager
 */
export function createTextManager() {
  return new TextManager()
}
