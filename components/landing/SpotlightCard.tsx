'use client';

import { useRef, useState, MouseEvent } from 'react';

interface Props {
    children: React.ReactNode;
    className?: string;
}

export default function SpotlightCard({ children, className }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ x: 0, y: 0, opacity: 0 });

    const onMove = (e: MouseEvent<HTMLDivElement>) => {
        const r = ref.current!.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top, opacity: 1 });
    };

    return (
        <div
            ref={ref}
            onMouseMove={onMove}
            onMouseLeave={() => setPos(p => ({ ...p, opacity: 0 }))}
            className={`relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-6
        transition-all duration-300 hover:border-white/10 hover:-translate-y-1 ${className}`}
        >
            <div
                className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
                style={{
                    opacity: pos.opacity,
                    background: `radial-gradient(280px circle at ${pos.x}px ${pos.y}px, rgba(99,102,241,0.08), transparent 70%)`,
                }}
            />
            {children}
        </div>
    );
}