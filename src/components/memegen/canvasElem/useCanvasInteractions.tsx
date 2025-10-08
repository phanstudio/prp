import { useState, useCallback } from "react";
import type { TextElement } from "../../types";
import { CanvasRenderer } from "./CanvasRenderer";

interface UseCanvasInteractionsProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  textElements: TextElement[];
  selectedElement: string | null;
  onElementSelect: (id: string | null) => void;
  onElementMove: (id: string, x: number, y: number) => void;
  onElementRotate: (id: string, rotation: number) => void;
  // selectBorderColor: string;
  renderer: CanvasRenderer | null;
}

export const useCanvasInteractions = ({
  canvasRef,
  textElements,
  selectedElement,
  onElementSelect,
  onElementMove,
  onElementRotate,
  // selectBorderColor,
  renderer
}: UseCanvasInteractionsProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [rotationStartAngle, setRotationStartAngle] = useState(0);

  // Helper function to convert degrees to radians
  const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;

  // Helper function to get mouse coordinates relative to canvas
  const getMouseCoordinates = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    
    return { x, y };
  };

  // Helper function to get touch coordinates relative to canvas
  const getTouchCoordinates = (event: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Use the first touch point
    const touch = event.touches[0] || event.changedTouches[0];
    if (!touch) return { x: 0, y: 0 };
    
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    
    return { x, y };
  };

  // Helper function to transform mouse coordinates for rotation
  const transformCoordinatesForRotation = (x: number, y: number, element: TextElement, ctx: CanvasRenderingContext2D) => {
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
    
    return { localX, localY, centerX, centerY };
  };

  // Generic interaction handler that works for both mouse and touch
  const handleInteractionStart = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !renderer) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let clickedElement: string | null = null;
    let clickedOnRotationHandle = false;

    // Check if we clicked on a rotation handle first
    if (selectedElement) {
      const element = textElements.find((el) => el.id === selectedElement);
      if (element) {
        const { centerX, centerY } = transformCoordinatesForRotation(x, y, element, ctx);
        
        if (renderer.isClickOnRotationHandle(x, y, element, ctx)) {
          clickedOnRotationHandle = true;
          setIsRotating(true);
          const initialAngle = Math.atan2(y - centerY, x - centerX);
          const currentRotation = degreesToRadians(element.rotation || 0);
          setRotationStartAngle(initialAngle - currentRotation);
          return;
      }
      
      }
    }

    // Check if we clicked on any text element
    for (const element of [...textElements].reverse()) {
      if (renderer.isPointInRotatedRect(x, y, element, ctx)) {
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
  }, [canvasRef, textElements, selectedElement, onElementSelect, renderer]);

  const handleInteractionMove = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !renderer) return;
  
    if (isDragging && selectedElement) {
      const newX = x - dragOffset.x;
      const newY = y - dragOffset.y;
      onElementMove(selectedElement, newX, newY);
    } else if (isRotating && selectedElement) {
      const element = textElements.find((el) => el.id === selectedElement);
      if (element) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const { centerX, centerY } = transformCoordinatesForRotation(x, y, element, ctx);
          const currentAngle = Math.atan2(y - centerY, x - centerX);
          const rotation = ((currentAngle - rotationStartAngle) * 180) / Math.PI;
          onElementRotate(selectedElement, rotation);
        }
      }
    }
  
    // --- Cursor update when just hovering ---
    if (!isDragging && !isRotating) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        let overHandle = false;
        let overElement = false;
  
        for (const element of [...textElements].reverse()) {
          if (renderer.isClickOnRotationHandle(x, y, element, ctx)) {
            overHandle = true;
            break;
          }
          if (renderer.isPointInRotatedRect(x, y, element, ctx)) {
            overElement = true;
            break;
          }
        }
  
        if (overHandle) {
          canvas.style.cursor = "crosshair";      // rotation handle
        } else if (overElement) {
          canvas.style.cursor = "move";      // text box
        } else {
          canvas.style.cursor = "pointer";   // outside
        }
      }
    }
  }, [isDragging, isRotating, selectedElement, textElements,
      dragOffset, rotationStartAngle, onElementMove, onElementRotate,
      renderer, canvasRef]);
  

  // Generic interaction end handler
  const handleInteractionEnd = useCallback(() => {
    setIsDragging(false);
    setIsRotating(false);
  }, [canvasRef]);

  // Mouse event handlers
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getMouseCoordinates(event);
    handleInteractionStart(x, y);
  }, [handleInteractionStart]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getMouseCoordinates(event);
    handleInteractionMove(x, y);
  }, [handleInteractionMove]);

  const handleMouseUp = useCallback(() => {
    handleInteractionEnd();
  }, [handleInteractionEnd]);

  // Touch event handlers
  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
    const { x, y } = getTouchCoordinates(event);
    handleInteractionStart(x, y);
  }, [handleInteractionStart]);

  const handleTouchMove = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
    const { x, y } = getTouchCoordinates(event);
    handleInteractionMove(x, y);
  }, [handleInteractionMove]);

  const handleTouchEnd = useCallback((_: React.TouchEvent<HTMLCanvasElement>) => {
    handleInteractionEnd();
  }, [handleInteractionEnd]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
};