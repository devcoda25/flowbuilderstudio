// src/types/MediaPart.ts
export type MediaPart = {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  name?: string;
};