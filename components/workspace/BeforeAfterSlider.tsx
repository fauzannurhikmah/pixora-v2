'use client';

import { useState, useRef } from 'react';

interface Props {
    beforeUrl: string;
    afterUrl: string;
}

export default function BeforeAfterSlider({ beforeUrl, afterUrl }: Props) {
    const [pos, setPos] = useState(50);
    const dragging = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const update = (clientX: number) => {
        const rect = containerRef.current!.getBoundingClientRect();
        setPos(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
    };

    return (
        <div
            ref={containerRef}
            className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/60 select-none cursor-col-resize max-w-[680px] max-h-[560px]"
            onMouseDown={(e) => { dragging.current = true; update(e.clientX); }}
            onMouseMove={(e) => { if (dragging.current) update(e.clientX); }}
            onMouseUp={() => { dragging.current = false; }}
            onMouseLeave={() => { dragging.current = false; }}
        >
            {/* After layer (base) */}
            <img src={afterUrl} alt="After" className="block max-w-[680px] max-h-[560px] w-auto h-auto object-contain" />

            {/* Before layer (clipped) */}
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
                <img src={beforeUrl} alt="Before" className="block max-w-[680px] max-h-[560px] w-auto h-auto object-contain" />
            </div>

            {/* Divider line */}
            <div className="absolute top-0 bottom-0 w-px bg-white/50 shadow-[0_0_8px_rgba(255,255,255,0.3)]" style={{ left: `${pos}%` }}>
                {/* Handle */}
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-black/60 border-2 border-white/70 backdrop-blur-sm shadow-2xl flex items-center justify-center gap-1">
                    <div className="w-0.5 h-3.5 rounded-full bg-white/80" />
                    <div className="w-0.5 h-3.5 rounded-full bg-white/80" />
                </div>
            </div>

            {/* Labels */}
            <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-[10px] text-gray-300 font-medium">
                Before
            </span>
            <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-[10px] text-gray-300 font-medium">
                After
            </span>
        </div>
    );
}