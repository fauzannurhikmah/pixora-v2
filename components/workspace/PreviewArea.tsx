'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw, Columns2, Download, ImageIcon } from 'lucide-react';
import BeforeAfterSlider from './BeforeAfterSlider';

interface Props {
    imageUrl: string | null;
    processedUrl: string | null;
    isProcessing: boolean;
}

export default function PreviewArea({ imageUrl, processedUrl, isProcessing }: Props) {
    const [zoom, setZoom] = useState(1);
    const [showComparison, setShowComparison] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    const clamp = (z: number) => Math.min(Math.max(z, 0.25), 4);

    return (
        <main
            className="flex-1 flex flex-col h-screen overflow-hidden relative z-10"
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragOver(false); }}
            onWheel={(e) => { e.preventDefault(); setZoom(z => clamp(z - e.deltaY * 0.001)); }}
        >
            {/* Drag overlay */}
            <AnimatePresence>
                {isDragOver && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-4 z-50 rounded-2xl border-2 border-indigo-500/60 bg-indigo-500/[0.06] backdrop-blur-sm flex items-center justify-center pointer-events-none"
                    >
                        <p className="text-indigo-400 font-medium text-sm animate-pulse">Drop to replace image</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 shrink-0">
                <div className="flex items-center gap-2">
                    {processedUrl && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => setShowComparison(v => !v)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
                ${showComparison
                                    ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400'
                                    : 'border-white/[0.08] bg-white/[0.03] text-gray-400 hover:text-white'}`}
                        >
                            <Columns2 className="w-3.5 h-3.5" />
                            Compare
                        </motion.button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Zoom strip */}
                    <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                        <button onClick={() => setZoom(z => clamp(z - 0.25))}
                            className="p-1 text-gray-500 hover:text-white transition-colors">
                            <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs text-gray-400 w-10 text-center tabular-nums select-none">
                            {Math.round(zoom * 100)}%
                        </span>
                        <button onClick={() => setZoom(z => clamp(z + 0.25))}
                            className="p-1 text-gray-500 hover:text-white transition-colors">
                            <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-px h-3 bg-white/10 mx-0.5" />
                        <button onClick={() => setZoom(1)}
                            className="p-1 text-gray-500 hover:text-white transition-colors">
                            <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {processedUrl && (
                        <motion.a
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            href={processedUrl}
                            download
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-medium hover:opacity-90 transition-opacity"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Download
                        </motion.a>
                    )}
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 flex items-center justify-center overflow-hidden px-6 pb-6">
                <AnimatePresence mode="wait">
                    {isProcessing ? (
                        <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <SkeletonLoader />
                        </motion.div>
                    ) : imageUrl ? (
                        <motion.div
                            key="image"
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ scale: zoom }}
                            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                            className="relative"
                        >
                            {/* Spotlight glow behind image */}
                            <div className="absolute -inset-12 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

                            {showComparison && processedUrl ? (
                                <BeforeAfterSlider beforeUrl={imageUrl} afterUrl={processedUrl} />
                            ) : (
                                <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/60">
                                    {/* Checkerboard transparency pattern */}
                                    <div
                                        className="absolute inset-0 opacity-25 pointer-events-none"
                                        style={{
                                            backgroundImage: 'repeating-conic-gradient(#2a2a2a 0% 25%, #1a1a1a 0% 50%)',
                                            backgroundSize: '16px 16px',
                                        }}
                                    />
                                    <img
                                        src={processedUrl || imageUrl}
                                        alt="Preview"
                                        className="relative block max-w-[680px] max-h-[560px] w-auto h-auto object-contain"
                                    />
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <EmptyState />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}

function SkeletonLoader() {
    return (
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02] w-[520px] h-[420px]">
            {/* Shimmer sweep */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
            />
            {/* Progress bar */}
            <div className="absolute bottom-6 left-6 right-6">
                <p className="text-[11px] text-gray-600 mb-2 text-center">Processing…</p>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"
                        style={{ backgroundSize: '200% 100%' }}
                        animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                </div>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center gap-3 text-gray-600">
            <div className="w-16 h-16 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center">
                <ImageIcon className="w-6 h-6" />
            </div>
            <p className="text-sm text-gray-500">No image loaded</p>
            <p className="text-xs text-gray-700">Go back to landing and upload an image</p>
        </div>
    );
}