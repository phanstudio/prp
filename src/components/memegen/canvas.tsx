import {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import type { TextElement } from "../types";
import { CanvasRenderer } from "./canvasElem/CanvasRenderer";
import { useCanvasInteractions } from "./canvasElem/useCanvasInteractions";

const selectBorderColor = "oklch(70% 0.14 182.503)";//getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();

// what methods the parent can call via ref
export interface CanvasHandle {
  saveImage: () => void;
  saveFiles: () => Promise<{ background: File | null; edited: File | null }>;
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
    const canvasRef = useRef<HTMLCanvasElement>(null!);
    const rendererRef = useRef<CanvasRenderer | null>(null);
    
    const {
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd
    } = useCanvasInteractions({
      canvasRef,
      textElements,
      selectedElement,
      onElementSelect,
      onElementMove,
      onElementRotate,
      renderer: rendererRef.current
    });

    // Initialize renderer once when canvas is ready
    useEffect(() => {
      if (canvasRef.current && !rendererRef.current) {
        rendererRef.current = new CanvasRenderer(canvasRef, selectBorderColor);
      }
    }, []);

    // Handle canvas sizing and drawing
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !rendererRef.current) return;
      
      // Set canvas size
      if (image) {
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
        canvas.width = 800;
        canvas.height = 600;
      }

      // Always redraw after any change
      rendererRef.current.redraw(image, textElements, selectedElement);
    }, [image, textElements, selectedElement]);

    const getCanvasFile = async (): Promise<File | null> => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      onElementSelect(null);
    
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], "edited-photo.png", { type: blob.type });
              resolve(file);
            } else {
              reject(new Error("Failed to generate file"));
            }
          }, "image/png");
        }), 5
      });
    };
    
    const getBackgroundFile = async (): Promise<File | null> => {
      if (!image) return null;
    
      // Convert image.src (URL or base64) to a Blob
      const res = await fetch(image.src);
      const blob = await res.blob();
    
      // Wrap in a File so you can send it in FormData
      return new File([blob], "background.png", { type: blob.type });
    };

    const saveFiles = async (): Promise<{ background: File | null; edited: File | null }> => {
      const background = await getBackgroundFile();
      const edited = await getCanvasFile();
    
      return { background, edited };
    };    

    // --- save logic (exposed to parent) ---
    const saveImage = () => {
      onElementSelect(null); // might increase the wait time or take it to some where else
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
    
        const link = document.createElement("a");
        link.download = "edited-photo.png";
        link.href = canvas.toDataURL();
        link.click();
      }, 5); // wait 5ms
    };

    useImperativeHandle(ref, () => ({
      saveImage,
      saveFiles
    }));

    return (
      <div className="border border-base-300 inline-block">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="cursor-pointer"
          onMouseLeave={handleMouseUp}
          style={{ 
            maxWidth: "100%", 
            height: "auto", 
            touchAction: "none",
            userSelect: "none",
            WebkitUserSelect: "none"
          }}
        />
      </div>
    );
  }
);

export default Canvas;