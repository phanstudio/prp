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
  outlineColor?: string;
  outlineSize?: number;
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

export interface TemplateIn {
  id: string;
  name: string;
  description?: string;
  image_url: string;
  textElements: TextElement[];
  created_at: Date;
  tag?: string;
  thumbnail_url:string;
}
