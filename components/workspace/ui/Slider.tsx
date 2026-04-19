'use client';

import { useRef } from 'react';

interface Props {
    value: number;
    min?: number;
    max?: number;
    onChange: (v: number) => void;
}

export default function Slider({ value, min = 0, max = 100, onChange }: Props) {
    const trackRef = useRef<HTMLDivElement>(null);

    const getVal = (clientX: number) => {
        const rect = trackRef.current!.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        return Math.round(min + pct * (max - min));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        onChange(getVal(e.clientX));
        const onMove = (ev: MouseEvent) => onChange(getVal(ev.clientX));
        const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    };

    const pct = ((value - min) / (max - min)) * 100;

    return (
        <div
            ref={trackRef}
            onMouseDown={handleMouseDown}
            className="relative h-5 flex items-center cursor-pointer group select-none"
        >
            {/* Track */}
            <div className="w-full h-1.5 rounded-full bg-white/[0.07]" />
            {/* Fill */}
            <div
                className="absolute h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 pointer-events-none"
                style={{ width: `${pct}%` }}
            />
            {/* Thumb */}
            <div
                className="absolute w-4 h-4 rounded-full bg-white shadow-lg shadow-indigo-500/30 border border-white/20 pointer-events-none transition-transform group-hover:scale-110 group-active:scale-95"
                style={{ left: `calc(${pct}% - 8px)` }}
            />
        </div>
    );
}