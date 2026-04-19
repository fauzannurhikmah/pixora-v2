'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw, Columns2, Download, ImageIcon, ImagePlus } from 'lucide-react';
import BeforeAfterSlider from './BeforeAfterSlider';

interface Props {
    imageUrl: string | null;
    processedUrl: string | null;
    isProcessing: boolean;
    onReplaceImage: (file: File) => void;
}

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.25;

export default function PreviewArea({ imageUrl, processedUrl, isProcessing, onReplaceImage }: Props) {
    const [zoom, setZoom] = useState(1);
    const [showComparison, setShowComparison] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const clamp = (z: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));

    // ── Wheel zoom — must be non-passive to call preventDefault ──────────────
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            setZoom(z => clamp(z - e.deltaY * 0.001));
        };
        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, []);

    // ── Reset comparison when image changes ─────────────────────────────────
    useEffect(() => { setShowComparison(false); }, [imageUrl]);

    // ── Drag & drop handlers ─────────────────────────────────────────────────
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        // Only trigger if leaving the container entirely
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
            setIsDragOver(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'));
        if (file) {
            onReplaceImage(file);
            setZoom(1);
        }
    }, [onReplaceImage]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onReplaceImage(file);
            setZoom(1);
            // Reset input so same file can be re-selected
            e.target.value = '';
        }
    }, [onReplaceImage]);

    return (
        <main
            ref={containerRef}
            className="flex-1 flex flex-col h-screen overflow-hidden relative z-10"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* ── Drag overlay ─────────────────────────────────────────────────── */}
            <AnimatePresence>
                {isDragOver && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-4 z-50 rounded-2xl border-2 border-indigo-500/60
              bg-indigo-500/[0.06] backdrop-blur-sm flex flex-col items-center justify-center gap-3 pointer-events-none"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.08, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center"
                        >
                            <ImagePlus className="w-6 h-6 text-indigo-400" />
                        </motion.div>
                        <p className="text-indigo-300 font-medium text-sm">Drop to replace image</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Toolbar ───────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-4 shrink-0">
                <div className="flex items-center gap-2">
                    {/* Replace image button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.08]
              bg-white/[0.03] text-gray-400 hover:text-white hover:border-white/[0.15]
              text-xs font-medium transition-all"
                    >
                        <ImagePlus className="w-3.5 h-3.5" />
                        Replace
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileInput}
                    />

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
                        <button
                            onClick={() => setZoom(z => clamp(z - ZOOM_STEP))}
                            disabled={zoom <= ZOOM_MIN}
                            className="p-1 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs text-gray-400 w-10 text-center tabular-nums select-none">
                            {Math.round(zoom * 100)}%
                        </span>
                        <button
                            onClick={() => setZoom(z => clamp(z + ZOOM_STEP))}
                            disabled={zoom >= ZOOM_MAX}
                            className="p-1 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-px h-3 bg-white/10 mx-0.5" />
                        <button
                            onClick={() => setZoom(1)}
                            className="p-1 text-gray-500 hover:text-white transition-colors"
                            title="Reset zoom"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {processedUrl && (
                        <motion.a
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            href={processedUrl}
                            download
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                bg-gradient-to-r from-indigo-600 to-purple-600
                text-white text-xs font-medium hover:opacity-90 transition-opacity"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Download
                        </motion.a>
                    )}
                </div>
            </div>

            {/* ── Canvas ────────────────────────────────────────────────────────── */}
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
                            animate={{ opacity: 1, scale: zoom }}
                            exit={{ opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                            className="relative origin-center"
                        >
                            {/* Spotlight glow */}
                            <div className="absolute -inset-12 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

                            {showComparison && processedUrl ? (
                                <BeforeAfterSlider beforeUrl={imageUrl} afterUrl={processedUrl} />
                            ) : (
                                <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/60">
                                    {/* Checkerboard for transparency */}
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
                                        draggable={false}
                                        className="relative block max-w-[680px] max-h-[560px] w-auto h-auto object-contain select-none"
                                    />
                                </div>
                            )}
                        </motion.div>

                    ) : (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <EmptyState onBrowse={() => fileInputRef.current?.click()} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Zoom hint */}
            {imageUrl && !isProcessing && (
                <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-700 pointer-events-none select-none">
                    Scroll to zoom · Drag image to replace
                </p>
            )}
        </main>
    );
}

// ── Skeleton ────────────────────────────────────────────────────────────────
function SkeletonLoader() {
    return (
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02] w-[520px] h-[420px]">
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
            />
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

// ── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onBrowse }: { onBrowse: () => void }) {
    return (
        <div className="flex flex-col items-center gap-4 text-gray-600">
            <div className="w-16 h-16 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center">
                <ImageIcon className="w-6 h-6" />
            </div>
            <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">No image loaded</p>
                <p className="text-xs text-gray-700 mb-3">Drag & drop or browse to add an image</p>
                <button
                    onClick={onBrowse}
                    className="px-4 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03]
            text-xs text-gray-400 hover:text-white hover:border-white/[0.15] transition-all"
                >
                    Browse files
                </button>
            </div>
        </div>
    );
}