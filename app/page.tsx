'use client';

import { motion } from 'framer-motion';
import { Command } from 'lucide-react';
import CircuitGrid from '@/components/landing/CircuitGrid';
import MagneticButton from '@/components/landing/MagneticButton';
import Counter from '@/components/landing/Counter';
import UploadZone from '@/components/landing/UploadZone';
import FeatureCards from '@/components/landing/FeatureCards';
import { STATS } from '@/components/landing/constants';
import Image from 'next/image';

export default function Landing() {
  return (
    <main className="min-h-screen w-full bg-mesh flex flex-col items-center selection:bg-indigo-500/30 relative">

      {/* Ambient Orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="orb-a absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-indigo-700/20 blur-[120px]" />
        <div className="orb-b absolute top-20 right-[-200px] w-[600px] h-[600px] rounded-full bg-purple-700/15 blur-[120px]" />
        <div className="orb-c absolute bottom-[-100px] left-[30%] w-[500px] h-[500px] rounded-full bg-violet-700/12 blur-[100px]" />
      </div>

      <CircuitGrid />

      {/* Nav */}
      <nav className="w-full max-w-7xl px-6 py-8 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-indigo-500/40 blur-md group-hover:blur-lg transition-all" />
            <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-lg group-hover:scale-110 transition-transform">
              <Image src="/icon-v3.PNG" alt="Pixora" width={32} height={32} className="w-full h-full object-cover" />
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

      {/* Hero */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 w-full max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">

          {/* Badge */}
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
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-white tabular-nums">
                  <Counter to={s.val} suffix={s.suffix} />
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <UploadZone />
        <FeatureCards />
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full py-8 flex justify-center opacity-30 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-400">
          <Command className="w-3 h-3" />
          <span>Powered by Pixora Neural Engine</span>
        </div>
      </footer>
    </main>
  );
}