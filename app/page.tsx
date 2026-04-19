'use client';

import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Upload, Sparkles, Zap, Wand2, Grid3x3, Command, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useImageStore } from '@/stores/imageStore';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect, useCallback, MouseEvent } from 'react';

// ─── Animated Circuit / Grid Lines ──────────────────────────────────────────
function CircuitGrid() {
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

    const CELL = 72;
    const SPEED = 1.3;
    const MAX_PULSES = 10;

    // ── Spotlight mask: ellipse centered on screen ──────────────────────
    // Pulses only spawn / are visible inside this radius
    const SR = () => Math.min(canvas.width, canvas.height) * 0.42; // spotlight radius

    type Pulse = {
      x: number; y: number;
      tx: number; ty: number;
      ox: number; oy: number;
      dx: number; dy: number;
      progress: number;
      trail: number;
      alpha: number;   // max 0.50
      color: string;
    };

    const COLORS = [
      'rgba(99,102,241,',
      'rgba(168,85,247,',
      'rgba(139,92,246,',
      'rgba(99,179,237,',
    ];

    const snap = (v: number) => Math.round(v / CELL) * CELL;
    const cx = () => canvas.width / 2;
    const cy = () => canvas.height / 2;

    // Spawn inside the spotlight circle, on a random grid intersection
    const newPulse = (): Pulse => {
      const r = SR();
      const ang = Math.random() * Math.PI * 2;
      const dist = Math.sqrt(Math.random()) * r * 0.85; // bias toward center
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
        // random alpha, hard cap at 0.50
        alpha: 0.15 + Math.random() * 0.35,
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

    // Fade-out factor based on distance from spotlight center
    const spotFade = (px: number, py: number) => {
      const r = SR();
      const d = Math.hypot(px - cx(), py - cy());
      const t = Math.min(d / r, 1);
      // smooth step: 1 at center → 0 at edge
      return 1 - t * t * (3 - 2 * t);
    };

    let pulses: Pulse[] = Array.from({ length: MAX_PULSES }, newPulse);

    const drawGrid = () => {
      const r = SR();
      // Only draw grid lines inside bounding box of spotlight
      const x0 = snap(cx() - r), x1 = snap(cx() + r);
      const y0 = snap(cy() - r), y1 = snap(cy() + r);

      for (let x = x0; x <= x1; x += CELL) {
        const fade = spotFade(x, cy());
        ctx.strokeStyle = `rgba(255,255,255,${(0.035 * fade).toFixed(3)})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke();
      }
      for (let y = y0; y <= y1; y += CELL) {
        const fade = spotFade(cx(), y);
        ctx.strokeStyle = `rgba(255,255,255,${(0.035 * fade).toFixed(3)})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      }
    };

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid();

      pulses = pulses.map((p) => {
        const segLen = Math.abs(p.tx - p.ox) + Math.abs(p.ty - p.oy) || 1;
        p.progress = Math.min(1, p.progress + SPEED / segLen);

        const hx = p.ox + (p.tx - p.ox) * p.progress;
        const hy = p.oy + (p.ty - p.oy) * p.progress;

        // Apply spotlight fade to alpha — ensures edges are transparent
        const fade = spotFade(hx, hy);
        if (fade > 0.01) {
          const trailFrac = p.trail / segLen;
          const tailFrac = Math.max(0, p.progress - trailFrac);
          const tx2 = p.ox + (p.tx - p.ox) * tailFrac;
          const ty2 = p.oy + (p.ty - p.oy) * tailFrac;

          const eff = p.alpha * fade; // effective alpha, always ≤ 0.50

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

          // head dot
          ctx.beginPath();
          ctx.arc(hx, hy, 2, 0, Math.PI * 2);
          ctx.fillStyle = p.color + Math.min(eff * 1.4, 0.5).toFixed(3) + ')';
          ctx.fill();
        }

        if (p.progress >= 1) {
          // Recycle if pulse wandered too far outside spotlight
          const outsideSpot = spotFade(p.tx, p.ty) < 0.05;
          return outsideSpot ? newPulse() : turn(p);
        }
        return { ...p, x: hx, y: hy };
      });

      raf = requestAnimationFrame(tick);
    };

    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}

// ─── Magnetic Button ────────────────────────────────────────────────────────
function MagneticButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useSpring(0, { stiffness: 200, damping: 18 });
  const y = useSpring(0, { stiffness: 200, damping: 18 });
  const onMove = (e: MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.35);
    y.set((e.clientY - r.top - r.height / 2) * 0.35);
  };
  const onLeave = () => { x.set(0); y.set(0); };
  return (
    <motion.button ref={ref} style={{ x, y }} onMouseMove={onMove} onMouseLeave={onLeave} className={className}>
      {children}
    </motion.button>
  );
}

// ─── Spotlight Feature Card ──────────────────────────────────────────────────
function SpotlightCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const divRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0, opacity: 0 });
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = divRef.current!.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top, opacity: 1 });
  };
  return (
    <div ref={divRef} onMouseMove={onMove} onMouseLeave={() => setPos(p => ({ ...p, opacity: 0 }))}
      className={`relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/10 hover:-translate-y-1 ${className}`}>
      <div className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{ opacity: pos.opacity, background: `radial-gradient(280px circle at ${pos.x}px ${pos.y}px, rgba(99,102,241,0.08), transparent 70%)` }} />
      {children}
    </div>
  );
}

// ─── Animated Counter ───────────────────────────────────────────────────────
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(to / 60);
    const t = setInterval(() => { start = Math.min(start + step, to); setVal(start); if (start >= to) clearInterval(t); }, 16);
    return () => clearInterval(t);
  }, [to]);
  return <>{val.toLocaleString()}{suffix}</>;
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Landing() {
  const router = useRouter();
  const { addImage } = useImageStore();
  const [isDragging, setIsDragging] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) { e.preventDefault(); fileInputRef.current?.click(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFiles = useCallback((files: File[]) => {
    const imgs = files.filter(f => f.type.startsWith('image/'));
    imgs.forEach(f => addImage(f));
    if (imgs.length > 0) { setUploaded(true); setTimeout(() => router.push('/workspace'), 900); }
  }, [addImage, router]);

  const features = [
    { icon: Zap, title: 'Instant Processing', desc: 'GPU-accelerated pipeline runs at native 60fps on any device.', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { icon: Wand2, title: 'Neural Upscaling', desc: 'Proprietary 4× upscaler trained on 80M+ high-res images.', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    { icon: Grid3x3, title: 'Batch Workflow', desc: 'Queue hundreds of assets and export with one keystroke.', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  ];

  return (
    <main className="min-h-screen w-full bg-mesh flex flex-col items-center selection:bg-indigo-500/30 relative">

      {/* ── Ambient Orbs ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="orb-a absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-indigo-700/20 blur-[120px]" />
        <div className="orb-b absolute top-20 right-[-200px] w-[600px] h-[600px] rounded-full bg-purple-700/15 blur-[120px]" />
        <div className="orb-c absolute bottom-[-100px] left-[30%] w-[500px] h-[500px] rounded-full bg-violet-700/12 blur-[100px]" />
      </div>

      {/* ── Circuit Grid Canvas ── */}
      <CircuitGrid />

      {/* ── Nav ── */}
      <nav className="w-full max-w-7xl px-6 py-8 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-indigo-500/40 blur-md group-hover:blur-lg transition-all" />
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
          <span className="font-bold text-xl tracking-tight">Pixora</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {['Changelog', 'Docs', 'Pricing'].map(label => (
            <span key={label} className="text-sm text-gray-500 hover:text-white cursor-pointer transition-colors">{label}</span>
          ))}
          <MagneticButton className="text-sm px-4 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
            Sign In
          </MagneticButton>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 w-full max-w-5xl">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/25 bg-indigo-500/8 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-400">v2.0 Neural Engine</span>
          </motion.div>

          <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-gradient mb-6">
            Refine every pixel.
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed font-light">
            AI-powered image processing for teams who care about speed and precision.
            Built for the modern web.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-10 mt-10">
            {[
              { val: 14000, suffix: '+', label: 'Images processed' },
              { val: 99, suffix: '%', label: 'Uptime SLA' },
              { val: 4, suffix: '×', label: 'Upscale factor' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-white tabular-nums">
                  <Counter to={s.val} suffix={s.suffix} />
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Upload Zone ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="w-full max-w-2xl group relative">
          <div className="absolute -inset-px bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 rounded-[2rem] opacity-0 group-hover:opacity-20 blur-xl transition duration-700" />

          <AnimatePresence mode="wait">
            {uploaded ? (
              <motion.div key="success"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="relative raycast-card rounded-[2rem] p-16 flex flex-col items-center gap-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                <p className="text-white font-medium">Opening workspace…</p>
              </motion.div>
            ) : (
              <motion.label key="upload"
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(Array.from(e.dataTransfer.files)); }}
                className={`relative block raycast-card rounded-[2rem] p-16 cursor-pointer overflow-hidden transition-all duration-300
                  ${isDragging ? 'border-indigo-500/60 scale-[1.015] bg-indigo-500/5' : ''}`}>

                {/* Inner dot grid texture */}
                <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
                  style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                <div className="flex flex-col items-center text-center relative">
                  <motion.div animate={isDragging ? { y: -6, scale: 1.1 } : { y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}
                    className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-8 shadow-2xl group-hover:border-indigo-500/40 transition-colors">
                    <Upload className={`w-6 h-6 ${isDragging ? 'text-indigo-400' : 'text-gray-400'}`} />
                  </motion.div>

                  <h2 className="text-2xl font-semibold text-white mb-2">Drop your image here</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <span>or press</span>
                    <kbd className="px-2 py-1 rounded-md border border-white/20 bg-white/10 font-sans text-[11px] text-gray-300">SPACE</kbd>
                    <span>to browse files</span>
                  </div>
                  <div className="flex gap-2">
                    {['PNG', 'JPG', 'WEBP', 'AVIF', 'GIF'].map(ext => (
                      <span key={ext} className="px-3 py-1 rounded-lg border border-white/5 bg-white/[0.02] text-[10px] font-medium text-gray-500">{ext}</span>
                    ))}
                  </div>
                </div>

                <input ref={fileInputRef} type="file" multiple accept="image/*"
                  onChange={(e) => handleFiles(Array.from(e.target.files || []))} className="hidden" />
              </motion.label>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Feature Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-20 w-full border-t border-white/5 pt-14">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
              <SpotlightCard>
                <div className={`w-9 h-9 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-4 h-4 ${f.color}`} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-light mb-4">{f.desc}</p>
                <span className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors group/link">
                  Learn more <ArrowUpRight className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                </span>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>

      </div>

      {/* ── Footer ── */}
      <footer className="relative z-10 w-full py-8 flex justify-center opacity-30 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-400">
          <Command className="w-3 h-3" />
          <span>Powered by Pixora Neural Engine</span>
        </div>
      </footer>
    </main>
  );
}