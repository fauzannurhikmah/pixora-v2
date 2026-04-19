'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// ── Panel header ─────────────────────────────────────────────────────────────
export function PanelHeader({ title, description }: { title: string; description: string }) {
    return (
        <div className="mb-5">
            <h2 className="text-sm font-semibold text-white">{title}</h2>
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{description}</p>
        </div>
    );
}

// ── Labeled section ───────────────────────────────────────────────────────────
export function PanelSection({ label, children }: { label?: string; children: React.ReactNode }) {
    return (
        <div className="mb-4">
            {label && (
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-600 mb-2">
                    {label}
                </p>
            )}
            {children}
        </div>
    );
}

// ── Primary action button ─────────────────────────────────��───────────────────
export function ProcessButton({
    label = 'Process',
    isProcessing,
    onClick,
    gradient = 'from-indigo-600 to-purple-600',
}: {
    label?: string;
    isProcessing: boolean;
    onClick: () => void;
    gradient?: string;
}) {
    return (
        <motion.button
            onClick={onClick}
            disabled={isProcessing}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={`w-full py-2.5 rounded-xl bg-gradient-to-r ${gradient} text-white text-xs font-semibold
        flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity`}
        >
            {isProcessing
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Processing…</>
                : label}
        </motion.button>
    );
}

// ── Animated gradient progress bar ───────────────────────────────────────────
export function ProgressBar({ visible }: { visible: boolean }) {
    if (!visible) return null;
    return (
        <div className="mt-2.5 h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"
                style={{ backgroundSize: '200% 100%' }}
                animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
        </div>
    );
}

// ── Info callout box ──────────────────────────────────────────────────────────
export function InfoBox({ children, color = 'indigo' }: { children: React.ReactNode; color?: string }) {
    const map: Record<string, string> = {
        indigo: 'bg-indigo-500/[0.07]  border-indigo-500/20  text-indigo-400/80',
        emerald: 'bg-emerald-500/[0.07] border-emerald-500/20 text-emerald-400/80',
        amber: 'bg-amber-500/[0.07]   border-amber-500/20   text-amber-400/80',
        cyan: 'bg-cyan-500/[0.07]    border-cyan-500/20    text-cyan-400/80',
    };
    return (
        <div className={`px-3 py-2.5 rounded-xl border text-[11px] leading-relaxed ${map[color] ?? map.indigo}`}>
            {children}
        </div>
    );
}