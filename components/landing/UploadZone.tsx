'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle2 } from 'lucide-react';
import { useImageStore } from '@/stores/imageStore';
import { useRouter } from 'next/navigation';
import { FORMATS } from './constants';

export default function UploadZone() {
    const router = useRouter();
    const { addImage } = useImageStore();
    const [isDragging, setIsDragging] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = useCallback((files: File[]) => {
        const imgs = files.filter(f => f.type.startsWith('image/'));
        imgs.forEach(f => addImage(f));
        if (imgs.length > 0) {
            setUploaded(true);
            setTimeout(() => router.push('/workspace'), 900);
        }
    }, [addImage, router]);

    // Expose SPACE shortcut — lifted to parent via ref if needed,
    // but keeping it self-contained here is fine too
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.code === 'Space' && e.target === document.body) {
                e.preventDefault();
                fileInputRef.current?.click();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full max-w-2xl group relative"
        >
            {/* Glow ring */}
            <div className="absolute -inset-px bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500
        rounded-[2rem] opacity-0 group-hover:opacity-20 blur-xl transition duration-700" />

            <AnimatePresence mode="wait">
                {uploaded ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative raycast-card rounded-[2rem] p-16 flex flex-col items-center gap-4"
                    >
                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                        <p className="text-white font-medium">Opening workspace…</p>
                    </motion.div>
                ) : (
                    <motion.label
                        key="upload"
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(Array.from(e.dataTransfer.files)); }}
                        className={`relative block raycast-card rounded-[2rem] p-16 cursor-pointer overflow-hidden transition-all duration-300
              ${isDragging ? 'border-indigo-500/60 scale-[1.015] bg-indigo-500/5' : ''}`}
                    >
                        {/* Dot-grid texture */}
                        <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
                            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                        <div className="flex flex-col items-center text-center relative">
                            <motion.div
                                animate={isDragging ? { y: -6, scale: 1.1 } : { y: 0, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                                className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-8 shadow-2xl group-hover:border-indigo-500/40 transition-colors"
                            >
                                <Upload className={`w-6 h-6 ${isDragging ? 'text-indigo-400' : 'text-gray-400'}`} />
                            </motion.div>

                            <h2 className="text-2xl font-semibold text-white mb-2">Drop your image here</h2>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                                <span>or press</span>
                                <kbd className="px-2 py-1 rounded-md border border-white/20 bg-white/10 font-sans text-[11px] text-gray-300">SPACE</kbd>
                                <span>to browse files</span>
                            </div>

                            <div className="flex gap-2">
                                {FORMATS.map(ext => (
                                    <span key={ext} className="px-3 py-1 rounded-lg border border-white/5 bg-white/[0.02] text-[10px] font-medium text-gray-500">
                                        {ext}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handleFiles(Array.from(e.target.files || []))}
                            className="hidden"
                        />
                    </motion.label>
                )}
            </AnimatePresence>
        </motion.div>
    );
}