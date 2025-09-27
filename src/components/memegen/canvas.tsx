import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import type { TextElement } from "./textelement";

const selectBorderColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
// const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-default').trim();

// what methods the parent can call via ref
export interface CanvasHandle {
  saveImage: () => void;
}

interface CanvasProps {
  image: HTMLImageElement | null;
  textElements: TextElement[];
  selectedElement: string | null;
  onElementSelect: (id: string | null) => void;
  onElementMove: (id: string, x: number, y: number) => void;
  onElementRotate: (id: string, rotation: number) => void;
}

const Canvas = forwardRef<CanvasHandle, CanvasProps>(
  ({ image, textElements, selectedElement, onElementSelect, onElementMove, onElementRotate }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isRotating, setIsRotating] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [rotationStartAngle, setRotationStartAngle] = useState(0);

    // Helper function to convert degrees to radians
    const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;

    // Helper function to get rotation handle position
    const getRotationHandlePosition = (element: TextElement, ctx: CanvasRenderingContext2D) => {
      const metrics = ctx.measureText(element.text);
      const textWidth = element.text.trim() === "" ? 100 : metrics.width;
      const padding = 8;
      const handleDistance = 20; // Distance above the selection box
      
      // Position handle at top-center, above the selection box
      const handleX = element.x + textWidth / 2;
      const handleY = element.y - padding - handleDistance;
      
      return { x: handleX, y: handleY };
    };

    // Helper function to check if click is on rotation handle
    const isClickOnRotationHandle = (x: number, y: number, element: TextElement, ctx: CanvasRenderingContext2D) => {
      const handle = getRotationHandlePosition(element, ctx);
      const distance = Math.sqrt(Math.pow(x - handle.x, 2) + Math.pow(y - handle.y, 2));
      return distance <= 10; // 10px radius for handle
    };

    // --- drawing logic ---
    const redrawCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // draw image
      if (image) {
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

      // draw text
      textElements.forEach((element) => {
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
        ctx.rotate(degreesToRadians(element.rotation || 0));
        ctx.translate(-centerX, -centerY);

        // selection border (drawn in rotated context)
        if (selectedElement === element.id) {
          const color = selectBorderColor.replace(')', ' / 0.3)');
          ctx.fillStyle = color;
          ctx.fillRect(
            element.x - padding,
            element.y - padding,
            textWidth + padding * 2,
            textHeight + padding * 2
          );

          ctx.strokeStyle = selectBorderColor;
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
        const displayText = element.text.trim() === "" ? "Type here..." : element.text;
        
        ctx.fillStyle = element.text.trim() === "" ? "rgba(255,255,255,0.5)" : element.color;

        if (element.text.trim() !== "") {
          ctx.strokeStyle = element.color === "#ffffff" ? "#000000" : "#ffffff";
          ctx.lineWidth = 1;
          ctx.strokeText(displayText, element.x, element.y);
        }
        ctx.fillText(displayText, element.x, element.y);

        ctx.restore(); // Restore the canvas state

        // Draw rotation handle for selected element (outside of rotation transform)
        if (selectedElement === element.id) {
          ctx.save();
          
          // Calculate handle position in rotated space
          const handleLocalPos = getRotationHandlePosition(element, ctx);
          const handleCenterX = centerX;
          const handleCenterY = centerY;
          
          // Transform handle position
          ctx.translate(handleCenterX, handleCenterY);
          ctx.rotate(degreesToRadians(element.rotation || 0));
          ctx.translate(-handleCenterX, -handleCenterY);
          
          // Draw connecting line from top-center of selection box to handle
          const topCenterX = element.x + textWidth / 2;
          const topCenterY = element.y - padding;
          
          ctx.strokeStyle = selectBorderColor;
          ctx.lineWidth = 2;
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(topCenterX, topCenterY);
          ctx.lineTo(handleLocalPos.x, handleLocalPos.y);
          ctx.stroke();
          
          // Draw rotation handle
          ctx.fillStyle = selectBorderColor;
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
      });
    };

    useEffect(() => {
      redrawCanvas();
    }, [image, textElements, selectedElement]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
    
      if (image) {
        // Maintain aspect ratio but limit max width/height
        const maxWidth = 800;
        const maxHeight = 600;
    
        let width = image.width;
        let height = image.height;
    
        const aspect = width / height;
    
        if (width > maxWidth) {
          width = maxWidth;
          height = Math.round(maxWidth / aspect);
        }
        if (height > maxHeight) {
          height = maxHeight;
          width = Math.round(maxHeight * aspect);
        }
    
        canvas.width = width;
        canvas.height = height;
      } else {
        // Default size when no image is loaded
        canvas.width = 800;
        canvas.height = 600;
      }
    
      redrawCanvas();
    }, [image]);    

    // --- mouse handlers ---
    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let clickedElement: string | null = null;
      let clickedOnRotationHandle = false;

      // Check if we clicked on a rotation handle first
      if (selectedElement) {
        const element = textElements.find((el) => el.id === selectedElement);
        if (element) {
          // Transform mouse coordinates to account for rotation
          ctx.font = `${element.fontSize}px ${element.fontFamily}`;
          const metrics = ctx.measureText(element.text);
          const textWidth = element.text.trim() === "" ? 100 : metrics.width;
          const textHeight = element.fontSize;
          const centerX = element.x + textWidth / 2;
          const centerY = element.y + textHeight / 2;
          
          // Inverse transform to get local coordinates
          const cos = Math.cos(-degreesToRadians(element.rotation || 0));
          const sin = Math.sin(-degreesToRadians(element.rotation || 0));
          const dx = x - centerX;
          const dy = y - centerY;
          const localX = centerX + (dx * cos - dy * sin);
          const localY = centerY + (dx * sin + dy * cos);
          
          if (isClickOnRotationHandle(localX, localY, element, ctx)) {
            clickedOnRotationHandle = true;
            setIsRotating(true);
            
            // Calculate initial angle using original mouse coordinates (not transformed)
            const initialAngle = Math.atan2(y - centerY, x - centerX);
            const currentRotation = degreesToRadians(element.rotation || 0);
            setRotationStartAngle(initialAngle - currentRotation);
            return;
          }
        }
      }

      // Check if we clicked on any text element
      for (const element of [...textElements].reverse()) {
        ctx.font = `${element.fontSize}px ${element.fontFamily}`;
        const metrics = ctx.measureText(element.text);
        const textWidth = element.text.trim() === "" ? 100 : metrics.width;
        const textHeight = element.fontSize;
        const padding = 8;
        const centerX = element.x + textWidth / 2;
        const centerY = element.y + textHeight / 2;

        // Transform mouse coordinates to account for rotation
        const cos = Math.cos(-degreesToRadians(element.rotation || 0));
        const sin = Math.sin(-degreesToRadians(element.rotation || 0));
        const dx = x - centerX;
        const dy = y - centerY;
        const localX = centerX + (dx * cos - dy * sin);
        const localY = centerY + (dx * sin + dy * cos);

        if (
          localX >= element.x - padding &&
          localX <= element.x + textWidth + padding &&
          localY >= element.y - padding &&
          localY <= element.y + textHeight + padding
        ) {
          clickedElement = element.id;
          break;
        }
      }

      if (clickedElement && !clickedOnRotationHandle) {
        onElementSelect(clickedElement);
        setIsDragging(true);
        const element = textElements.find((el) => el.id === clickedElement);
        if (element) {
          setDragOffset({ x: x - element.x, y: y - element.y });
        }
      } else if (!clickedOnRotationHandle) {
        onElementSelect(null);
      }
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;

      if (isDragging && selectedElement) {
        const newX = x - dragOffset.x;
        const newY = y - dragOffset.y;
        onElementMove(selectedElement, newX, newY);
      } else if (isRotating && selectedElement) {
        const element = textElements.find((el) => el.id === selectedElement);
        if (element) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.font = `${element.fontSize}px ${element.fontFamily}`;
            const metrics = ctx.measureText(element.text);
            const textWidth = element.text.trim() === "" ? 100 : metrics.width;
            const textHeight = element.fontSize;
            const centerX = element.x + textWidth / 2;
            const centerY = element.y + textHeight / 2;
            
            // Calculate angle from center to mouse, accounting for initial offset
            const currentAngle = Math.atan2(y - centerY, x - centerX);
            const rotation = ((currentAngle - rotationStartAngle) * 180) / Math.PI;
            onElementRotate(selectedElement, rotation);
          }
        }
      }

      // Update cursor based on hover state
      if (selectedElement && !isDragging && !isRotating) {
        const element = textElements.find((el) => el.id === selectedElement);
        if (element) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.font = `${element.fontSize}px ${element.fontFamily}`;
            const metrics = ctx.measureText(element.text);
            const textWidth = element.text.trim() === "" ? 100 : metrics.width;
            const textHeight = element.fontSize;
            const centerX = element.x + textWidth / 2;
            const centerY = element.y + textHeight / 2;
            
            // Transform mouse coordinates
            const cos = Math.cos(-degreesToRadians(element.rotation || 0));
            const sin = Math.sin(-degreesToRadians(element.rotation || 0));
            const dx = x - centerX;
            const dy = y - centerY;
            const localX = centerX + (dx * cos - dy * sin);
            const localY = centerY + (dx * sin + dy * cos);
            
            if (isClickOnRotationHandle(localX, localY, element, ctx)) {
              canvas.style.cursor = 'grab';
            } else {
              canvas.style.cursor = 'pointer';
            }
          }
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsRotating(false);
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.cursor = 'pointer';
      }
    };

    // --- save logic (exposed to parent) ---
    const saveImage = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = "edited-photo.png";
      link.href = canvas.toDataURL();
      link.click();
    };

    useImperativeHandle(ref, () => ({
      saveImage,
    }));

    return (
      <div className="border border-base-100 inline-block">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="cursor-pointer"
          onMouseLeave={handleMouseUp} // Stop dragging/rotating when mouse leaves canvas
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </div>
    );
  }
);

export default Canvas;