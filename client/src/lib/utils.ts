import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Tauri型定義の拡張
declare global {
  interface Window {
    __TAURI__?: any;
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
