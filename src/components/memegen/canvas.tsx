import React, { useRef, useState, useEffect } from 'react';
import type { TextElement } from './textelement';

interface CanvasProps {
  image: HTMLImageElement | null;
  textElements: TextElement[];
  selectedElement: string | null;
  onElementSelect: (id: string | null) => void;
  onElementMove: (id: string, x: number, y: number) => void;
  onSave: () => void;
}

const Canvas: React.FC<CanvasProps> = ({ 
  image, 
  textElements, 
  selectedElement, 
  onElementSelect, 
  onElementMove,
  onSave 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image if loaded
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

    // Draw text elements
    textElements.forEach(element => {
      ctx.font = `${element.fontSize}px ${element.fontFamily}`;
      ctx.fillStyle = element.color;
      ctx.textBaseline = 'top';
      
      // Calculate text bounds with padding
      const metrics = ctx.measureText(element.text);
      const textWidth = element.text.trim() === '' ? 100 : metrics.width;
      const textHeight = element.fontSize;
      const padding = 8;
      
      // Draw selection border/background if selected
      if (selectedElement === element.id) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
        ctx.fillRect(
          element.x - padding, 
          element.y - padding, 
          textWidth + (padding * 2), 
          textHeight + (padding * 2)
        );
        
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          element.x - padding, 
          element.y - padding, 
          textWidth + (padding * 2), 
          textHeight + (padding * 2)
        );
        ctx.setLineDash([]);
      }
      
      // Draw text (show placeholder for empty text)
      const displayText = element.text.trim() === '' ? 'Type here...' : element.text;
      ctx.fillStyle = element.text.trim() === '' ? 'rgba(255, 255, 255, 0.5)' : element.color;
      
      // Add stroke for better visibility
      if (element.text.trim() !== '') {
        ctx.strokeStyle = element.color === '#ffffff' ? '#000000' : '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeText(displayText, element.x, element.y);
      }
      ctx.fillText(displayText, element.x, element.y);
    });
  };

  useEffect(() => {
    redrawCanvas();
  }, [image, textElements, selectedElement]);

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let clickedElement: string | null = null;
    
    for (const element of [...textElements].reverse()) {
      ctx.font = `${element.fontSize}px ${element.fontFamily}`;
      const metrics = ctx.measureText(element.text);
      
      const textWidth = element.text.trim() === '' ? 100 : metrics.width;
      const textHeight = element.fontSize;
      const padding = 8;
      
      if (x >= element.x - padding && 
          x <= element.x + textWidth + padding && 
          y >= element.y - padding && 
          y <= element.y + textHeight + padding) {
        clickedElement = element.id;
        break;
      }
    }
    
    if (clickedElement) {
      onElementSelect(clickedElement);
      setIsDragging(true);
      const element = textElements.find(el => el.id === clickedElement);
      if (element) {
        setDragOffset({ x: x - element.x, y: y - element.y });
      }
    } else {
      onElementSelect(null);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedElement) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX - dragOffset.x;
    const y = (event.clientY - rect.top) * scaleY - dragOffset.y;
    
    onElementMove(selectedElement, x, y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'edited-photo.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div>
      <div className="border border-gray-300 inline-block">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="cursor-pointer"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
      
      <div className="mt-4">
        <button
          onClick={handleSave}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Save Image
        </button>
      </div>
    </div>
  );
};

export default Canvas