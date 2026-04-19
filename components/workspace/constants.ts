import {
    ArrowUpFromLine,
    FileDown,
    Eraser,
    Droplets,
    RefreshCw,
    Crop,
    Wand2,
    Wind,
    Layers,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type ToolId =
    | 'upscale'
    | 'compress'
    | 'remove-bg'
    | 'remove-watermark'
    | 'convert'
    | 'resize-crop'
    | 'auto-enhance'
    | 'denoise'
    | 'batch';

export interface Tool {
    id: ToolId;
    label: string;
    icon: LucideIcon;
    color: string;  // text-*
    glow: string;   // bg-*/border-* for active glow
}

export const TOOLS: Tool[] = [
    { id: 'upscale', label: 'Upscale', icon: ArrowUpFromLine, color: 'text-indigo-400', glow: 'bg-indigo-500/10 border-indigo-500/25' },
    { id: 'compress', label: 'Compress', icon: FileDown, color: 'text-amber-400', glow: 'bg-amber-500/10  border-amber-500/25' },
    { id: 'remove-bg', label: 'Remove BG', icon: Eraser, color: 'text-emerald-400', glow: 'bg-emerald-500/10 border-emerald-500/25' },
    { id: 'remove-watermark', label: 'Remove Watermark', icon: Droplets, color: 'text-cyan-400', glow: 'bg-cyan-500/10   border-cyan-500/25' },
    { id: 'convert', label: 'Convert', icon: RefreshCw, color: 'text-violet-400', glow: 'bg-violet-500/10 border-violet-500/25' },
    { id: 'resize-crop', label: 'Resize & Crop', icon: Crop, color: 'text-pink-400', glow: 'bg-pink-500/10   border-pink-500/25' },
    { id: 'auto-enhance', label: 'Auto Enhance', icon: Wand2, color: 'text-yellow-400', glow: 'bg-yellow-500/10 border-yellow-500/25' },
    { id: 'denoise', label: 'Denoise', icon: Wind, color: 'text-teal-400', glow: 'bg-teal-500/10   border-teal-500/25' },
    { id: 'batch', label: 'Batch', icon: Layers, color: 'text-orange-400', glow: 'bg-orange-500/10 border-orange-500/25' },
];