export const canvasUtils = {
    // Helper function to convert degrees to radians
    degreesToRadians: (degrees: number) => (degrees * Math.PI) / 180,
  
    // Helper function to convert radians to degrees
    radiansToDegrees: (radians: number) => (radians * 180) / Math.PI,
  
    // Calculate distance between two points
    getDistance: (x1: number, y1: number, x2: number, y2: number) => {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },
  
    // Calculate angle between two points
    getAngle: (centerX: number, centerY: number, pointX: number, pointY: number) => {
      return Math.atan2(pointY - centerY, pointX - centerX);
    },
  
    // Transform point based on rotation around center
    rotatePoint: (
      x: number, 
      y: number, 
      centerX: number, 
      centerY: number, 
      rotation: number
    ) => {
      const cos = Math.cos(canvasUtils.degreesToRadians(rotation));
      const sin = Math.sin(canvasUtils.degreesToRadians(rotation));
      const dx = x - centerX;
      const dy = y - centerY;
      
      return {
        x: centerX + (dx * cos - dy * sin),
        y: centerY + (dx * sin + dy * cos)
      };
    },
  
    // Inverse transform point (undo rotation)
    inverseRotatePoint: (
      x: number, 
      y: number, 
      centerX: number, 
      centerY: number, 
      rotation: number
    ) => {
      const cos = Math.cos(-canvasUtils.degreesToRadians(rotation));
      const sin = Math.sin(-canvasUtils.degreesToRadians(rotation));
      const dx = x - centerX;
      const dy = y - centerY;
      
      return {
        x: centerX + (dx * cos - dy * sin),
        y: centerY + (dx * sin + dy * cos)
      };
    },
  
    // Calculate canvas scaling factors for mouse coordinate transformation
    getCanvasScaling: (canvas: HTMLCanvasElement) => {
      const rect = canvas.getBoundingClientRect();
      return {
        scaleX: canvas.width / rect.width,
        scaleY: canvas.height / rect.height
      };
    },
  
    // Get mouse coordinates relative to canvas with proper scaling
    getMouseCoordinates: (event: React.MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
      const rect = canvas.getBoundingClientRect();
      const { scaleX, scaleY } = canvasUtils.getCanvasScaling(canvas);
      
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
      };
    },
  
    // Calculate optimal canvas size while maintaining aspect ratio
    calculateCanvasSize: (
      imageWidth: number, 
      imageHeight: number, 
      maxWidth: number = 800, 
      maxHeight: number = 600
    ) => {
      let width = imageWidth;
      let height = imageHeight;
      const aspect = width / height;
  
      if (width > maxWidth) {
        width = maxWidth;
        height = Math.round(maxWidth / aspect);
      }
      if (height > maxHeight) {
        height = maxHeight;
        width = Math.round(maxHeight * aspect);
      }
  
      return { width, height };
    },
  
    // Calculate centered position for image drawing
    getCenteredImagePosition: (
      canvasWidth: number,
      canvasHeight: number,
      imageWidth: number,
      imageHeight: number
    ) => {
      const aspectRatio = imageWidth / imageHeight;
      let drawWidth = canvasWidth;
      let drawHeight = canvasHeight;
  
      if (aspectRatio > canvasWidth / canvasHeight) {
        drawHeight = canvasWidth / aspectRatio;
      } else {
        drawWidth = canvasHeight * aspectRatio;
      }
  
      return {
        x: (canvasWidth - drawWidth) / 2,
        y: (canvasHeight - drawHeight) / 2,
        width: drawWidth,
        height: drawHeight
      };
    },
  
    // Clamp a value between min and max
    clamp: (value: number, min: number, max: number) => {
      return Math.min(Math.max(value, min), max);
    },
  
    // Normalize angle to 0-360 degrees
    normalizeAngle: (degrees: number) => {
      return ((degrees % 360) + 360) % 360;
    }
  };