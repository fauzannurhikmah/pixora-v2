import { Zap, Wand2, Grid3x3 } from 'lucide-react';

export const FEATURES = [
    {
        icon: Zap,
        title: 'Instant Processing',
        desc: 'GPU-accelerated pipeline runs at native 60fps on any device.',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
    },
    {
        icon: Wand2,
        title: 'Neural Upscaling',
        desc: 'Proprietary 4× upscaler trained on 80M+ high-res images.',
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/20',
    },
    {
        icon: Grid3x3,
        title: 'Batch Workflow',
        desc: 'Queue hundreds of assets and export with one keystroke.',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
    },
];

export const STATS = [
    { val: 14000, suffix: '+', label: 'Images processed' },
    { val: 99, suffix: '%', label: 'Uptime SLA' },
    { val: 4, suffix: '×', label: 'Upscale factor' },
];

export const FORMATS = ['PNG', 'JPG', 'WEBP', 'AVIF', 'GIF'];