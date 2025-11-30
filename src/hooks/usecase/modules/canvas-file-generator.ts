import { Canvas } from "fabric"
import type { WatermarkManager } from "./use-watermark"
import { SaveCanvas } from "./canvas-save-gen"

export interface CanvasFileOptions {
  format?: "png" | "jpeg"
  quality?: number
  multiplier?: number
  filename?: string
}

export class CanvasFileGenerator {
  private canvas: Canvas
  private watermarkManager: WatermarkManager | null

  constructor(canvas: Canvas, watermarkManager?: WatermarkManager | null) {
    this.canvas = canvas
    this.watermarkManager = watermarkManager || null
  }

  /**
   * Generates a File object from the canvas
   * @param options - Configuration for file generation
   * @param includeWatermark - Whether to include watermark in the output
   * @returns Promise<File | null>
   */
  async getCanvasFile(
    options: CanvasFileOptions = {},
    includeWatermark: boolean = true
  ): Promise<File | null> {
    const {
      format = "png",
      quality = 1,
      multiplier = 3,
      filename = "edited-photo.png",
    } = options

    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          // Deselect any active objects
          this.canvas.discardActiveObject()
          this.canvas.renderAll()

          // Prepare watermark if needed
          if (includeWatermark && this.watermarkManager) {
            await this.watermarkManager.prepareForDownload()
          }

          // Generate blob from canvas
          const dataURL = SaveCanvas(
            this.canvas,
            format,
            quality,
            multiplier,
          );

          // Convert dataURL to Blob
          const blob = await this.dataURLToBlob(dataURL)

          if (blob) {
            const file = new File([blob], filename, { type: blob.type })
            resolve(file)
          } else {
            reject(new Error("Failed to generate file"))
          }

          // Clean up watermark after generation
          if (includeWatermark && this.watermarkManager) {
            this.watermarkManager.cleanupAfterDownload()
          }
        } catch (error) {
          reject(error)
        }
      }, 5)
    })
  }

  /**
   * Gets the background image as a File
   * @returns Promise<File | null>
   */
  async getBackgroundFile(): Promise<File | null> {
    const backgroundImage = this.canvas.backgroundImage

    if (!backgroundImage || !("_element" in backgroundImage)) {
      return null
    }

    try {
      // Get the image source
      const imgElement = (backgroundImage as any)._element as HTMLImageElement
      const src = imgElement.src

      // Convert image URL to Blob
      const res = await fetch(src)
      const blob = await res.blob()

      // Wrap in a File
      return new File([blob], "background.png", { type: blob.type })
    } catch (error) {
      console.error("Failed to get background file:", error)
      return null
    }
  }

  /**
   * Saves both background and edited canvas files
   * @param options - Configuration for canvas file generation
   * @param includeWatermark - Whether to include watermark in edited file
   * @returns Promise with both files
   */
  async saveFiles(
    options: CanvasFileOptions = {},
    includeWatermark: boolean = true
  ): Promise<{ background: File | null; edited: File | null }> {
    // Deselect any active objects first
    this.canvas.discardActiveObject()
    this.canvas.renderAll()

    const background = await this.getBackgroundFile()
    const edited = await this.getCanvasFile(options, includeWatermark)

    return { background, edited }
  }

  /**
   * Helper method to convert dataURL to Blob
   */
  private async dataURLToBlob(dataURL: string): Promise<Blob | null> {
    try {
      const res = await fetch(dataURL)
      return await res.blob()
    } catch (error) {
      console.error("Failed to convert dataURL to blob:", error)
      return null
    }
  }

  /**
   * Update the watermark manager reference
   */
  setWatermarkManager(watermarkManager: WatermarkManager | null) {
    this.watermarkManager = watermarkManager
  }
}