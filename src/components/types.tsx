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
  textAlign?: 'left' | 'center' | 'right';
}

export interface Template {
  id: Number;
  name: string;
  description?: string;
  imageUrl: string; // base64 data URL
  textElements: TextElement[];
  createdAt: Date;
  tags?: string[];
  thumbnailUrl: string;
}

export interface TemplateIn {
  id: string;//Number
  name: string;
  description?: string;
  image_url: string;
  textElements: TextElement[];
  created_at: Date;
  tag?: string;
  thumbnail_url:string;
}
