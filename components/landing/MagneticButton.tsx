'use client';

import { useRef, MouseEvent } from 'react';
import { motion, useSpring } from 'framer-motion';

interface Props {
    children: React.ReactNode;
    className?: string;
}

export default function MagneticButton({ children, className }: Props) {
    const ref = useRef<HTMLButtonElement>(null);
    const x = useSpring(0, { stiffness: 200, damping: 18 });
    const y = useSpring(0, { stiffness: 200, damping: 18 });

    const onMove = (e: MouseEvent) => {
        const r = ref.current!.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.35);
        y.set((e.clientY - r.top - r.height / 2) * 0.35);
    };

    return (
        <motion.button
            ref={ref}
            style={{ x, y }}
            onMouseMove={onMove}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            className={className}
        >
            {children}
        </motion.button>
    );
}