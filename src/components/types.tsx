// Types
export type TextAlignType = "left" | "center" | "right" | "justify"
export type FontStyleType = "normal" | "italic" | "oblique"
export type TextEffectType = "none" | "shadow" | "outline" | "newShadow"

export interface TextElement {
  id: string;
  text: string;
  x: number; //left
  y: number; // top
  fontSize: number;
  color: string; // fill?: string
  fontFamily: string;
  rotation: number;
  outlineColor?: string; // strokeColor?: string
  outlineSize?: number; // strokeWidth?: number
  
  textAlign?: TextAlignType
  fontWeight?: string | number
  fontStyle?: FontStyleType
  underline?: boolean
  linethrough?: boolean
  effectType?: TextEffectType
  // Shadow properties
  shadowColor?: string
  shadowBlur?: number
  shadowOffsetX?: number
  shadowOffsetY?: number
  shadowOpacity?: number

  width:number;
  height:number;
  allCaps?: boolean;
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

export interface WatermarkOptions {
  text: string;
  placement?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  opacity?: number; // 0–1
  scale?: number;   // relative font size, e.g. 0.05 = 5% of canvas width
  font?: string;    // e.g. "Arial"
  color?: string;   // e.g. "rgba(255,255,255,0.7)"
}

export type WatermarkMode = "download-only" | "always" | "none";

export const DefualtTextSettings = {
  fontFamily: "Impact",
  textColor: "#ffffff",
  fontSize: 32,
  shadowColor: "#000000",
  outlineStrokeWidth: 3,
  outlineStrokeColor: "#000000",
  shadowOpacity: 0.75,
  shadowBlur: 10,
  shadowOffsetX: -1,// 5
  shadowOffsetY: 1,// 5
  paintFirst: "stroke" as "fill" | "stroke" | undefined,
  shadowStrokeWidth: 5,
}