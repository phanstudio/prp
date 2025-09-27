// Types
export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  rotation: number;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  image: string; // base64 data URL
  textElements: TextElement[];
  createdAt: Date;
  tags?: string[];
}
