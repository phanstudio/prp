import type { TextElement, WatermarkOptions } from "../../types";

export class CanvasRenderer {
  private canvasRef: React.RefObject<HTMLCanvasElement>;
  private selectBorderColor: string;

  constructor(canvasRef: React.RefObject<HTMLCanvasElement>, selectBorderColor: string) {
    this.canvasRef = canvasRef;
    this.selectBorderColor = selectBorderColor;
  }

  // Helper function to convert degrees to radians
  private degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;

  // Helper function to split text into lines
  private getTextLines(text: string): string[] {
    return text.split('\n');
  }

  // Helper function to measure multi-line text dimensions
  private measureMultilineText(ctx: CanvasRenderingContext2D, element: TextElement) {
    const lines = this.getTextLines(element.text);
    const lineHeight = element.fontSize * 1.2; // 1.2 line height multiplier
    
    let maxWidth = 0;
    lines.forEach(line => {
      const metrics = ctx.measureText(line);
      maxWidth = Math.max(maxWidth, metrics.width);
    });
    
    const textWidth = element.text.trim() === "" ? 100 : maxWidth;
    const textHeight = element.text.trim() === "" ? element.fontSize : (lines.length * lineHeight);
    
    return { width: textWidth, height: textHeight, lines, lineHeight };
  }

  // Helper function to check if click is on rotation handle
  isClickOnRotationHandle(x: number, y: number, element: TextElement, ctx: CanvasRenderingContext2D) {
    const handle = this.getRotationHandlePosition(element, ctx);
    const distance = Math.sqrt(Math.pow(x - handle.x, 2) + Math.pow(y - handle.y, 2));
    return distance <= 10; // 10px radius for handle
  }

  // Helper function to check if a point is inside a rotated rectangle
  isPointInRotatedRect(x: number, y: number, element: TextElement, ctx: CanvasRenderingContext2D) {
    ctx.font = `${element.fontSize}px ${element.fontFamily}`;
    const { width, height } = this.measureMultilineText(ctx, element);
    const padding = 8;
    
    // Get the center of the element
    const centerX = element.x + width / 2;
    const centerY = element.y + height / 2;
    
    // Translate click point to element's local space (inverse rotation)
    const angleRad = -this.degreesToRadians(element.rotation || 0); // Negative for inverse
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    
    // Translate click to be relative to center
    const relX = x - centerX;
    const relY = y - centerY;
    
    // Rotate the click point by inverse rotation
    const localX = relX * cos - relY * sin;
    const localY = relX * sin + relY * cos;
    
    // Translate back and check if within non-rotated bounds
    const localClickX = centerX + localX;
    const localClickY = centerY + localY;
    
    return (
      localClickX >= element.x - padding &&
      localClickX <= element.x + width + padding &&
      localClickY >= element.y - padding &&
      localClickY <= element.y + height + padding
    );
  }

  // Helper function to get rotation handle position (in world space, accounting for rotation)
  getRotationHandlePosition(element: TextElement, ctx: CanvasRenderingContext2D) {
    ctx.font = `${element.fontSize}px ${element.fontFamily}`;
    const { width, height } = this.measureMultilineText(ctx, element);
    const padding = 8;
    const handleDistance = 20; // Distance above the selection box
    
    // Get the center point for rotation
    const centerX = element.x + width / 2;
    const centerY = element.y + height / 2;
    
    // Calculate handle position relative to element position (not center)
    const localHandleX = element.x + width / 2;
    const localHandleY = element.y - padding - handleDistance;
    
    // Apply rotation around the center
    const angleRad = this.degreesToRadians(element.rotation || 0);
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    
    // Translate to center, rotate, translate back
    const relX = localHandleX - centerX;
    const relY = localHandleY - centerY;
    
    const rotatedX = relX * cos - relY * sin;
    const rotatedY = relX * sin + relY * cos;
    
    const worldX = centerX + rotatedX;
    const worldY = centerY + rotatedY;
    
    return { x: worldX, y: worldY };
  }

  private drawImage(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, image: HTMLImageElement | null) {
    if (!image) return;

    const aspectRatio = image.width / image.height;
    let drawWidth = canvas.width;
    let drawHeight = canvas.height;

    if (aspectRatio > canvas.width / canvas.height) {
      drawHeight = canvas.width / aspectRatio;
    } else {
      drawWidth = canvas.height * aspectRatio;
    }

    const x = (canvas.width - drawWidth) / 2;
    const y = (canvas.height - drawHeight) / 2;
    ctx.drawImage(image, x, y, drawWidth, drawHeight);
  }

  private drawTextElement(ctx: CanvasRenderingContext2D, element: TextElement, isSelected: boolean) {
    ctx.save(); // Save the current canvas state

    // Get text dimensions for selection box
    ctx.font = `${element.fontSize}px ${element.fontFamily}`;
    const { width: textWidth, height: textHeight, lines, lineHeight } = this.measureMultilineText(ctx, element);
    const padding = 8;
    const alignment = element.textAlign || 'left'; // Default to left alignment

    // Move to the element position and apply rotation
    const centerX = element.x + textWidth / 2;
    const centerY = element.y + textHeight / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate(this.degreesToRadians(element.rotation || 0));
    ctx.translate(-centerX, -centerY);

    // selection border (drawn in rotated context)
    if (isSelected) {
      const color = this.selectBorderColor.replace(')', ' / 0.3)');
      ctx.fillStyle = color;
      ctx.fillRect(
        element.x - padding,
        element.y - padding,
        textWidth + padding * 2,
        textHeight + padding * 2
      );

      ctx.strokeStyle = this.selectBorderColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.strokeRect(
        element.x - padding,
        element.y - padding,
        textWidth + padding * 2,
        textHeight + padding * 2
      );
      ctx.setLineDash([]);
    }

    // Draw the text line by line
    ctx.font = `${element.fontSize}px ${element.fontFamily}`;
    ctx.textBaseline = "top";
    
    const fillColor = element.text.trim() === "" ? "rgba(255,255,255,0.5)" : element.color;
    const hasOutline = element.text.trim() !== "" && (element.outlineSize || 0) > 0;
    
    lines.forEach((line, index) => {
      const lineY = element.y + (index * lineHeight);
      let lineX = element.x;
      
      // Calculate x position based on alignment
      if (alignment === 'center') {
        const lineMetrics = ctx.measureText(line);
        lineX = element.x + (textWidth - lineMetrics.width) / 2;
      } else if (alignment === 'right') {
        const lineMetrics = ctx.measureText(line);
        lineX = element.x + (textWidth - lineMetrics.width);
      }
      
      // Draw outline if specified
      if (hasOutline) {
        ctx.strokeStyle = element.outlineColor || "#000000";
        ctx.lineWidth = element.outlineSize || 0;
        ctx.strokeText(line, lineX, lineY);
      }
      
      // Draw fill text
      ctx.fillStyle = fillColor;
      ctx.fillText(line, lineX, lineY);
    });

    ctx.restore(); // Restore the canvas state
  }

  private drawRotationHandle(ctx: CanvasRenderingContext2D, element: TextElement) {
    ctx.save();

    ctx.font = `${element.fontSize}px ${element.fontFamily}`;
    const { width: textWidth, height: textHeight } = this.measureMultilineText(ctx, element);
    const padding = 8;

    // Handle position already rotated
    const handleWorldPos = this.getRotationHandlePosition(element, ctx);

    // Compute *top-center in world space* (rotate it once)
    const centerX = element.x + textWidth / 2;
    const centerY = element.y + textHeight / 2;

    // local top-center before rotation
    const localTopX = 0;
    const localTopY = -textHeight / 2 - padding;

    // rotate once around center
    const angleRad = this.degreesToRadians(element.rotation || 0);
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    const rotatedTopX = localTopX * cos - localTopY * sin;
    const rotatedTopY = localTopX * sin + localTopY * cos;

    const topCenterX = centerX + rotatedTopX;
    const topCenterY = centerY + rotatedTopY;

    // --- Draw ---
    // Line from top-center to handle
    ctx.strokeStyle = this.selectBorderColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(topCenterX, topCenterY);
    ctx.lineTo(handleWorldPos.x, handleWorldPos.y);
    ctx.stroke();

    // Circle handle
    ctx.fillStyle = this.selectBorderColor;
    ctx.beginPath();
    ctx.arc(handleWorldPos.x, handleWorldPos.y, 8, 0, 2 * Math.PI);
    ctx.fill();

    // Small rotation icon
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(handleWorldPos.x, handleWorldPos.y, 4, -Math.PI/2, Math.PI/2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(handleWorldPos.x + 2, handleWorldPos.y + 4);
    ctx.lineTo(handleWorldPos.x + 4, handleWorldPos.y + 2);
    ctx.lineTo(handleWorldPos.x + 4, handleWorldPos.y + 6);
    ctx.closePath();
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    ctx.restore();
  }

  private drawWatermark(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, options: WatermarkOptions) {
    const { image, placement = "bottom-right", opacity = 0.5, scale = 0.15 } = options;
  
    const wmWidth = canvas.width * scale;
    const aspect = image.width / image.height;
    const wmHeight = wmWidth / aspect;
  
    let x = 0, y = 0;
    const padding = 10;
  
    switch (placement) {
      case "top-left": x = padding; y = padding; break;
      case "top-right": x = canvas.width - wmWidth - padding; y = padding; break;
      case "bottom-left": x = padding; y = canvas.height - wmHeight - padding; break;
      case "bottom-right": x = canvas.width - wmWidth - padding; y = canvas.height - wmHeight - padding; break;
      case "center": x = (canvas.width - wmWidth) / 2; y = (canvas.height - wmHeight) / 2; break;
    }
  
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.drawImage(image, x, y, wmWidth, wmHeight);
    ctx.restore();
  }
  

  redraw(
    image: HTMLImageElement | null,
    textElements: TextElement[],
    selectedElement: string | null,
    watermark?: WatermarkOptions
  ) {
    const canvas = this.canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    this.drawImage(ctx, canvas, image);

    // Draw text elements
    textElements.forEach((element) => {
      this.drawTextElement(ctx, element, selectedElement === element.id);
      // Draw rotation handle for selected element (outside of rotation transform)
      if (selectedElement === element.id) {this.drawRotationHandle(ctx, element);}
    });

    // watermark
    if (watermark?.image) {
      this.drawWatermark(ctx, canvas, watermark);
    };
  }  
}