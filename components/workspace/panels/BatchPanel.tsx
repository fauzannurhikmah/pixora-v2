'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Download, CheckCircle2, Loader2, Clock } from 'lucide-react';
import { PanelHeader, ProgressBar } from '../ui/PanelShared';
import type { PanelProps } from '../ControlPanel';

type FileStatus = 'queued' | 'processing' | 'done' | 'error';

interface BatchFile {
    id: string;
    name: string;
    size: string;
    url: string;
    status: FileStatus;
    progress: number;
}

const STATUS_ICON: Record<FileStatus, React.ReactNode> = {
    queued: <Clock className="w-3 h-3 text-gray-500" />,
    processing: <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />,
    done: <CheckCircle2 className="w-3 h-3 text-emerald-400" />,
    error: <X className="w-3 h-3 text-red-400" />,
};

const STATUS_LABEL: Record<FileStatus, string> = {
    queued: 'Queued',
    processing: 'Processing',
    done: 'Done',
    error: 'Error',
};

export default function BatchPanel({ isProcessing, onProcess }: PanelProps) {
    const [files, setFiles] = useState<BatchFile[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const fmtSize = (bytes: number) =>
        bytes < 1024 * 1024
            ? `${(bytes / 1024).toFixed(0)} KB`
            : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

    const addFiles = (incoming: File[]) => {
        const newEntries: BatchFile[] = incoming
            .filter(f => f.type.startsWith('image/'))
            .map(f => ({
                id: Math.random().toString(36).slice(2),
                name: f.name,
                size: fmtSize(f.size),
                url: URL.createObjectURL(f),
                status: 'queued',
                progress: 0,
            }));
        setFiles(prev => [...prev, ...newEntries]);
    };

    const remove = (id: string) =>
        setFiles(prev => prev.filter(f => f.id !== id));

    const runBatch = () => {
        if (!files.length) return;
        // Simulate sequential processing
        files.forEach((file, i) => {
            setTimeout(() => {
                setFiles(prev => prev.map(f =>
                    f.id === file.id ? { ...f, status: 'processing', progress: 0 } : f
                ));
                // Fake progress
                let p = 0;
                const tick = setInterval(() => {
                    p += Math.random() * 18;
                    if (p >= 100) {
                        p = 100;
                        clearInterval(tick);
                        setFiles(prev => prev.map(f =>
                            f.id === file.id ? { ...f, status: 'done', progress: 100 } : f
                        ));
                    } else {
                        setFiles(prev => prev.map(f =>
                            f.id === file.id ? { ...f, progress: Math.round(p) } : f
                        ));
                    }
                }, 180);
            }, i * 1200);
        });
    };

    const doneCount = files.filter(f => f.status === 'done').length;
    const totalCount = files.length;
    const allDone = totalCount > 0 && doneCount === totalCount;
    const anyRunning = files.some(f => f.status === 'processing');

    return (
        <div className="flex flex-col h-full">
            <PanelHeader title="Batch Process" description="Upload multiple images and process them all at once." />

            {/* Drop zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                    e.preventDefault(); setIsDragOver(false);
                    addFiles(Array.from(e.dataTransfer.files));
                }}
                onClick={() => inputRef.current?.click()}
                className={`relative flex flex-col items-center gap-2 py-5 rounded-xl border border-dashed cursor-pointer
          transition-all duration-200 mb-3
          ${isDragOver
                        ? 'border-orange-500/50 bg-orange-500/[0.06] scale-[1.01]'
                        : 'border-white/[0.08] bg-white/[0.015] hover:border-white/[0.14] hover:bg-white/[0.03]'}`}
            >
                <Upload className={`w-5 h-5 ${isDragOver ? 'text-orange-400' : 'text-gray-600'}`} />
                <p className="text-[11px] text-gray-500 text-center">
                    Drop images or <span className="text-white underline underline-offset-2">browse</span>
                </p>
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={e => addFiles(Array.from(e.target.files ?? []))}
                />
            </div>

            {/* File list */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 min-h-0">
                <AnimatePresence initial={false}>
                    {files.map(file => (
                        <motion.div
                            key={file.id}
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.18 }}
                            className="relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl
                bg-white/[0.025] border border-white/[0.05] overflow-hidden group"
                        >
                            {/* Progress fill bg */}
                            {file.status === 'processing' && (
                                <motion.div
                                    className="absolute inset-0 bg-indigo-500/[0.07] origin-left"
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: file.progress / 100 }}
                                    transition={{ ease: 'linear', duration: 0.2 }}
                                />
                            )}

                            {/* Thumbnail */}
                            <img
                                src={file.url}
                                alt={file.name}
                                className="relative w-9 h-9 rounded-lg object-cover border border-white/[0.06] shrink-0"
                            />

                            {/* Info */}
                            <div className="relative flex-1 min-w-0">
                                <p className="text-[11px] font-medium text-white truncate">{file.name}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    {STATUS_ICON[file.status]}
                                    <span className={`text-[9px] font-medium
                    ${file.status === 'done' ? 'text-emerald-400' :
                                            file.status === 'processing' ? 'text-indigo-400' :
                                                file.status === 'error' ? 'text-red-400' :
                                                    'text-gray-600'}`}>
                                        {file.status === 'processing'
                                            ? `${file.progress}%`
                                            : STATUS_LABEL[file.status]}
                                    </span>
                                    <span className="text-[9px] text-gray-700 ml-auto">{file.size}</span>
                                </div>
                            </div>

                            {/* Remove btn */}
                            {file.status !== 'processing' && (
                                <button
                                    onClick={() => remove(file.id)}
                                    className="relative p-1 rounded-md text-gray-700 hover:text-white
                    opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {files.length === 0 && (
                    <p className="text-center text-[11px] text-gray-700 py-4">No files added yet.</p>
                )}
            </div>

            {/* Footer */}
            {files.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/[0.05]">
                    {/* Summary */}
                    <div className="flex items-center justify-between text-[11px] text-gray-500 mb-3">
                        <span>{totalCount} file{totalCount > 1 ? 's' : ''}</span>
                        <span className="text-emerald-400">{doneCount} done</span>
                    </div>

                    {anyRunning && (
                        <ProgressBar visible={true} />
                    )}

                    {allDone ? (
                        <motion.button
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600
                text-white text-xs font-semibold flex items-center justify-center gap-2
                hover:opacity-90 transition-opacity shadow-lg"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Download All
                        </motion.button>
                    ) : (
                        !anyRunning && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={runBatch}
                                className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600
                  text-white text-xs font-semibold flex items-center justify-center gap-2
                  hover:opacity-90 transition-opacity shadow-lg"
                            >
                                Process All ({totalCount})
                            </motion.button>
                        )
                    )}
                </div>
            )}
        </div>
    );
}