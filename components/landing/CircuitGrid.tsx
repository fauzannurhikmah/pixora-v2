'use client';

import { useEffect, useRef } from 'react';

const CELL = 72;
const SPEED = 1.3;
const MAX_PULSES = 10;
const COLORS = [
    'rgba(99,102,241,',
    'rgba(168,85,247,',
    'rgba(139,92,246,',
    'rgba(99,179,237,',
];

type Pulse = {
    x: number; y: number;
    tx: number; ty: number;
    ox: number; oy: number;
    dx: number; dy: number;
    progress: number;
    trail: number;
    alpha: number;
    color: string;
};

const snap = (v: number) => Math.round(v / CELL) * CELL;

export default function CircuitGrid() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        let raf: number;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const cx = () => canvas.width / 2;
        const cy = () => canvas.height / 2;
        const SR = () => Math.min(canvas.width, canvas.height) * 0.42;

        const spotFade = (px: number, py: number) => {
            const t = Math.min(Math.hypot(px - cx(), py - cy()) / SR(), 1);
            return 1 - t * t * (3 - 2 * t); // smooth-step
        };

        const newPulse = (): Pulse => {
            const ang = Math.random() * Math.PI * 2;
            const dist = Math.sqrt(Math.random()) * SR() * 0.85;
            const sx = snap(cx() + Math.cos(ang) * dist);
            const sy = snap(cy() + Math.sin(ang) * dist);
            const dirs: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
            const [dx, dy] = dirs[Math.floor(Math.random() * dirs.length)];
            const segs = 2 + Math.floor(Math.random() * 5);
            return {
                x: sx, y: sy, ox: sx, oy: sy,
                tx: sx + dx * CELL * segs,
                ty: sy + dy * CELL * segs,
                dx, dy, progress: 0,
                trail: CELL * (1.5 + Math.random() * 2),
                alpha: 0.15 + Math.random() * 0.35, // max 0.50
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
            };
        };

        const turn = (p: Pulse): Pulse => {
            const [ndx, ndy] = Math.random() < 0.6
                ? (Math.random() < 0.5 ? [-p.dy, p.dx] : [p.dy, -p.dx])
                : [p.dx, p.dy];
            const segs = 2 + Math.floor(Math.random() * 5);
            return {
                ...p, ox: p.tx, oy: p.ty, x: p.tx, y: p.ty,
                tx: p.tx + ndx * CELL * segs, ty: p.ty + ndy * CELL * segs,
                dx: ndx, dy: ndy, progress: 0
            };
        };

        const drawGrid = () => {
            const r = SR();
            const x0 = snap(cx() - r), x1 = snap(cx() + r);
            const y0 = snap(cy() - r), y1 = snap(cy() + r);
            ctx.lineWidth = 0.5;
            for (let x = x0; x <= x1; x += CELL) {
                ctx.strokeStyle = `rgba(255,255,255,${(0.035 * spotFade(x, cy())).toFixed(3)})`;
                ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke();
            }
            for (let y = y0; y <= y1; y += CELL) {
                ctx.strokeStyle = `rgba(255,255,255,${(0.035 * spotFade(cx(), y)).toFixed(3)})`;
                ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
            }
        };

        let pulses: Pulse[] = Array.from({ length: MAX_PULSES }, newPulse);

        const tick = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawGrid();

            pulses = pulses.map((p) => {
                const segLen = Math.abs(p.tx - p.ox) + Math.abs(p.ty - p.oy) || 1;
                p.progress = Math.min(1, p.progress + SPEED / segLen);

                const hx = p.ox + (p.tx - p.ox) * p.progress;
                const hy = p.oy + (p.ty - p.oy) * p.progress;
                const fade = spotFade(hx, hy);

                if (fade > 0.01) {
                    const tailFrac = Math.max(0, p.progress - p.trail / segLen);
                    const tx2 = p.ox + (p.tx - p.ox) * tailFrac;
                    const ty2 = p.oy + (p.ty - p.oy) * tailFrac;
                    const eff = p.alpha * fade; // always ≤ 0.50

                    const grad = ctx.createLinearGradient(tx2, ty2, hx, hy);
                    grad.addColorStop(0, p.color + '0)');
                    grad.addColorStop(0.5, p.color + (eff * 0.55).toFixed(3) + ')');
                    grad.addColorStop(1, p.color + eff.toFixed(3) + ')');

                    ctx.beginPath();
                    ctx.moveTo(tx2, ty2);
                    ctx.lineTo(hx, hy);
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(hx, hy, 2, 0, Math.PI * 2);
                    ctx.fillStyle = p.color + Math.min(eff * 1.4, 0.5).toFixed(3) + ')';
                    ctx.fill();
                }

                if (p.progress >= 1) return spotFade(p.tx, p.ty) < 0.05 ? newPulse() : turn(p);
                return { ...p, x: hx, y: hy };
            });

            raf = requestAnimationFrame(tick);
        };

        tick();
        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
    }, []);

    return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" />;
}