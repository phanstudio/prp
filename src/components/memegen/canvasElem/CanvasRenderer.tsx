import type { TextElement } from "../../types";

export class CanvasRenderer {
  private canvasRef: React.RefObject<HTMLCanvasElement>;
  private selectBorderColor: string;

  constructor(canvasRef: React.RefObject<HTMLCanvasElement>, selectBorderColor: string) {
    this.canvasRef = canvasRef;
    this.selectBorderColor = selectBorderColor;
  }

  // Helper function to convert degrees to radians
  private degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;

  // Helper function to get rotation handle position
  getRotationHandlePosition(element: TextElement, ctx: CanvasRenderingContext2D) {
    const metrics = ctx.measureText(element.text);
    const textWidth = element.text.trim() === "" ? 100 : metrics.width;
    const padding = 8;
    const handleDistance = 20; // Distance above the selection box
    
    // Position handle at top-center, above the selection box
    const handleX = element.x + textWidth / 2;
    const handleY = element.y - padding - handleDistance;
    
    return { x: handleX, y: handleY };
  }

  // Helper function to check if click is on rotation handle
  isClickOnRotationHandle(x: number, y: number, element: TextElement, ctx: CanvasRenderingContext2D) {
    const handle = this.getRotationHandlePosition(element, ctx);
    const distance = Math.sqrt(Math.pow(x - handle.x, 2) + Math.pow(y - handle.y, 2));
    return distance <= 10; // 10px radius for handle
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
    const metrics = ctx.measureText(element.text);
    const textWidth = element.text.trim() === "" ? 100 : metrics.width;
    const textHeight = element.fontSize;
    const padding = 8;

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

    // Draw the text
    ctx.font = `${element.fontSize}px ${element.fontFamily}`;
    ctx.textBaseline = "top";
    const displayText = element.text.trim() === "" ? "" : element.text;
    
    ctx.fillStyle = element.text.trim() === "" ? "rgba(255,255,255,0.5)" : element.color;

    if (element.text.trim() !== "") {
      ctx.strokeStyle = element.outlineColor || "#000000";
      ctx.lineWidth = element.outlineSize || 1;
      ctx.strokeText(displayText, element.x, element.y);
    }
    ctx.fillText(displayText, element.x, element.y);

    ctx.restore(); // Restore the canvas state
  }

  private drawRotationHandle(ctx: CanvasRenderingContext2D, element: TextElement) {
    ctx.save();
    
    // Get text dimensions
    ctx.font = `${element.fontSize}px ${element.fontFamily}`;
    const metrics = ctx.measureText(element.text);
    const textWidth = element.text.trim() === "" ? 100 : metrics.width;
    const textHeight = element.fontSize;
    const padding = 8;
    
    // Calculate handle position in rotated space
    const handleLocalPos = this.getRotationHandlePosition(element, ctx);
    const centerX = element.x + textWidth / 2;
    const centerY = element.y + textHeight / 2;
    
    // Transform handle position
    ctx.translate(centerX, centerY);
    ctx.rotate(this.degreesToRadians(element.rotation || 0));
    ctx.translate(-centerX, -centerY);
    
    // Draw connecting line from top-center of selection box to handle
    const topCenterX = element.x + textWidth / 2;
    const topCenterY = element.y - padding;
    
    ctx.strokeStyle = this.selectBorderColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(topCenterX, topCenterY);
    ctx.lineTo(handleLocalPos.x, handleLocalPos.y);
    ctx.stroke();
    
    // Draw rotation handle
    ctx.fillStyle = this.selectBorderColor;
    ctx.beginPath();
    ctx.arc(handleLocalPos.x, handleLocalPos.y, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw rotation icon (small curved arrow)
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(handleLocalPos.x, handleLocalPos.y, 4, -Math.PI/2, Math.PI/2);
    ctx.stroke();
    
    // Arrow head
    ctx.beginPath();
    ctx.moveTo(handleLocalPos.x + 2, handleLocalPos.y + 4);
    ctx.lineTo(handleLocalPos.x + 4, handleLocalPos.y + 2);
    ctx.lineTo(handleLocalPos.x + 4, handleLocalPos.y + 6);
    ctx.closePath();
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    
    ctx.restore();
  }

  redraw(image: HTMLImageElement | null, textElements: TextElement[], selectedElement: string | null) {
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
      if (selectedElement === element.id) {
        this.drawRotationHandle(ctx, element);
      }
    });
  }
}