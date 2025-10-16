import { Canvas, FabricText } from "fabric"

export type WatermarkMode = "disabled" | "always" | "download-only"

export interface WatermarkConfig {
  text: string
  mode: WatermarkMode
  fontSizeRatio?: number // Ratio relative to canvas width (default: 0.03)
  opacity?: number
  color?: string
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "center"
  stroke?: string
}

export class WatermarkManager {
  private canvas: Canvas | null = null
  private config: WatermarkConfig
  private watermarkObject: FabricText | null = null
  private contextMenuHandler: ((e: MouseEvent) => void) | null = null
  private resizeObserver: ResizeObserver | null = null

  constructor(config: WatermarkConfig) {
    this.config = {
      fontSizeRatio: 0.03, // 3% of canvas width
      opacity: 0.5,
      color: "#FFFFFF",
      position: "bottom-right",
      stroke: "#000000",
      ...config,
    }
  }

  /**
   * Initialize the watermark manager with a fabric canvas
   */
  init(canvas: Canvas) {
    this.canvas = canvas
    
    if (this.config.mode === "always") {
      this.addWatermark()
    }

    this.setupRightClickProtection()
    this.setupCanvasResizeObserver()
  }

  /**
   * Setup observer to watch for canvas size changes
   */
  private setupCanvasResizeObserver() {
    if (!this.canvas) return

    // Listen to canvas dimension changes
    const originalSetDimensions = this.canvas.setDimensions.bind(this.canvas)
    this.canvas.setDimensions = (dimensions: any, options?: any) => {
      const result = originalSetDimensions(dimensions, options)
      if (this.watermarkObject && this.config.mode === "always") {
        this.updateWatermarkSize()
      }
      return result
    }
  }

  /**
   * Update watermark configuration
   */
  updateConfig(config: Partial<WatermarkConfig>) {
    const oldMode = this.config.mode
    this.config = { ...this.config, ...config }

    if (oldMode !== this.config.mode) {
      this.removeWatermark()
      
      if (this.config.mode === "always") {
        this.addWatermark()
      }
    } else if (this.config.mode === "always" && this.watermarkObject) {
      this.updateWatermarkAppearance()
    }

    this.setupRightClickProtection()
  }

  /**
   * Calculate font size based on canvas width
   */
  private calculateFontSize(): number {
    if (!this.canvas) return 16

    const canvasWidth = this.canvas.getWidth()
    return Math.max(10, canvasWidth * (this.config.fontSizeRatio || 0.03))
  }

  /**
   * Calculate padding based on canvas size
   */
  private calculatePadding(): number {
    if (!this.canvas) return 10

    const canvasWidth = this.canvas.getWidth()
    return Math.max(5, canvasWidth * 0.02) // 2% of canvas width
  }

  /**
   * Add watermark to canvas
   */
  private addWatermark() {
    if (!this.canvas || this.watermarkObject) return

    const fontSize = this.calculateFontSize()

    const watermark = new FabricText(this.config.text, {
      fontSize: fontSize,
      fill: this.config.color,
      opacity: this.config.opacity,
      stroke: this.config.stroke,
      strokeWidth: fontSize * 0.05, // 5% of font size for proportional outline
      paintFirst: "stroke",
      selectable: false,
      evented: false,
      hasControls: false,
      hasBorders: false,
      lockMovementX: true,
      lockMovementY: true,
    })

    this.positionWatermark(watermark)
    this.canvas.add(watermark)
    this.watermarkObject = watermark
    this.canvas.renderAll()
  }

  /**
   * Position watermark based on config
   */
  private positionWatermark(watermark: FabricText) {
    if (!this.canvas) return

    const padding = this.calculatePadding()
    const canvasWidth = this.canvas.getWidth()
    const canvasHeight = this.canvas.getHeight()

    switch (this.config.position) {
      case "bottom-right":
        watermark.set({
          left: canvasWidth - (watermark.width || 0) - padding,
          top: canvasHeight - (watermark.height || 0) - padding,
        })
        break
      case "bottom-left":
        watermark.set({
          left: padding,
          top: canvasHeight - (watermark.height || 0) - padding,
        })
        break
      case "top-right":
        watermark.set({
          left: canvasWidth - (watermark.width || 0) - padding,
          top: padding,
        })
        break
      case "top-left":
        watermark.set({
          left: padding,
          top: padding,
        })
        break
      case "center":
        watermark.set({
          left: canvasWidth / 2,
          top: canvasHeight / 2,
          originX: "center",
          originY: "center",
        })
        break
    }
  }

  /**
   * Update watermark size when canvas is resized
   */
  private updateWatermarkSize() {
    if (!this.watermarkObject || !this.canvas) return

    const fontSize = this.calculateFontSize()
    
    this.watermarkObject.set({
      fontSize: fontSize,
    })

    this.positionWatermark(this.watermarkObject)
    this.canvas.renderAll()
  }

  /**
   * Update existing watermark appearance
   */
  private updateWatermarkAppearance() {
    if (!this.watermarkObject) return

    const fontSize = this.calculateFontSize()

    this.watermarkObject.set({
      text: this.config.text,
      fontSize: fontSize,
      fill: this.config.color,
      opacity: this.config.opacity,
    })

    this.positionWatermark(this.watermarkObject)
    this.canvas?.renderAll()
  }

  /**
   * Remove watermark from canvas
   */
  private removeWatermark() {
    if (!this.canvas || !this.watermarkObject) return

    this.canvas.remove(this.watermarkObject)
    this.watermarkObject = null
    this.canvas.renderAll()
  }

  /**
   * Setup right-click protection when watermark is active
   */
  private setupRightClickProtection() {
    // Remove existing handler
    if (this.contextMenuHandler && this.canvas) {
      this.canvas.upperCanvasEl?.removeEventListener(
        "contextmenu",
        this.contextMenuHandler
      )
    }

    // Add handler if mode requires protection
    if (
      this.canvas &&
      (this.config.mode === "always" || this.config.mode === "download-only")
    ) {
      this.contextMenuHandler = (e: MouseEvent) => {
        e.preventDefault()
        return false
      }

      this.canvas.upperCanvasEl?.addEventListener(
        "contextmenu",
        this.contextMenuHandler
      )
    }
  }

  /**
   * Prepare canvas for download (adds watermark if needed)
   */
  async prepareForDownload(): Promise<void> {
    if (this.config.mode === "download-only") {
      this.addWatermark()
      // Small delay to ensure watermark is rendered
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  }

  /**
   * Clean up after download (removes watermark if in download-only mode)
   */
  cleanupAfterDownload() {
    if (this.config.mode === "download-only") {
      this.removeWatermark()
    }
  }

  /**
   * Dispose of the watermark manager
   */
  dispose() {
    this.removeWatermark()
    
    if (this.contextMenuHandler && this.canvas) {
      this.canvas.upperCanvasEl?.removeEventListener(
        "contextmenu",
        this.contextMenuHandler
      )
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }

    this.canvas = null
    this.contextMenuHandler = null
    this.resizeObserver = null
  }
}

/**
 * Helper hook for React components
 */
export function createWatermarkManager(config: WatermarkConfig) {
  return new WatermarkManager(config)
}