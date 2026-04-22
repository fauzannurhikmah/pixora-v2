'use client';

import { useEffect, useRef, useState } from 'react';
import { PanelHeader, PanelSection, ProcessButton, ProgressBar } from '../ui/PanelShared';
import Slider from '../ui/Slider';
import type { PanelProps } from '../ControlPanel';
import { useImageStore } from '@/stores/imageStore';

function formatFileSize(bytes: number): string {
    if (bytes <= 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function loadImageFromObjectUrl(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image for preview compression.'));
        img.src = url;
    });
}

function compressPreview(fileUrl: string, quality: number): Promise<string> {
    return new Promise(async (resolve, reject) => {
        try {
            const img = await loadImageFromObjectUrl(fileUrl);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Canvas context unavailable.'));
                return;
            }

            const maxSide = 1920;
            const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
            canvas.width = Math.max(1, Math.round(img.width * scale));
            canvas.height = Math.max(1, Math.round(img.height * scale));

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Failed to create compressed preview blob.'));
                        return;
                    }
                    resolve(URL.createObjectURL(blob));
                },
                'image/jpeg',
                Math.max(0.1, Math.min(1, quality / 100))
            );
        } catch (err) {
            reject(err);
        }
    });
}

export default function CompressPanel({ isProcessing, onProcess, onPreviewChange }: PanelProps) {
    const [quality, setQuality] = useState(80);
    const activeImage = useImageStore((state) => state.activeImage);

    const debounceRef = useRef<number | null>(null);
    const latestPreviewUrlRef = useRef<string | null>(null);

    const originalBytes = activeImage?.file?.size ?? 0;
    const estimatedBytes = Math.round((originalBytes * quality) / 100);
    const originalLabel = originalBytes > 0 ? formatFileSize(originalBytes) : '-';
    const estimatedLabel = originalBytes > 0 ? formatFileSize(estimatedBytes) : '-';
    const saving = Math.round(100 - quality);

    useEffect(() => {
        if (!onPreviewChange) return;
        if (!activeImage?.preview) {
            onPreviewChange(null);
            return;
        }

        if (debounceRef.current) {
            window.clearTimeout(debounceRef.current);
        }

        debounceRef.current = window.setTimeout(async () => {
            try {
                const previewUrl = await compressPreview(activeImage.preview, quality);

                if (latestPreviewUrlRef.current) {
                    URL.revokeObjectURL(latestPreviewUrlRef.current);
                }

                latestPreviewUrlRef.current = previewUrl;
                onPreviewChange(previewUrl);
            } catch (error) {
                console.error('Realtime compress preview failed:', error);
            }
        }, 150);

        return () => {
            if (debounceRef.current) {
                window.clearTimeout(debounceRef.current);
                debounceRef.current = null;
            }
        };
    }, [quality, activeImage?.preview, onPreviewChange]);

    useEffect(() => {
        return () => {
            if (latestPreviewUrlRef.current) {
                URL.revokeObjectURL(latestPreviewUrlRef.current);
                latestPreviewUrlRef.current = null;
            }
            onPreviewChange?.(null);
        };
    }, [onPreviewChange]);

    return (
        <div className="flex flex-col h-full">
            <PanelHeader title="Compress" description="Reduce file size while preserving visual quality." />

            <PanelSection label="Quality">
                <div className="flex items-center justify-between text-xs mb-2.5">
                    <span className="text-gray-600">Lower size</span>
                    <span className="text-white font-semibold tabular-nums">{quality}%</span>
                    <span className="text-gray-600">Higher quality</span>
                </div>
                <Slider value={quality} min={10} max={100} onChange={setQuality} />
            </PanelSection>

            <PanelSection label="Size comparison">
                <div className="grid grid-cols-2 gap-2">
                    <div className="px-3 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
                        <div className="text-[9px] uppercase tracking-wider text-gray-600 mb-1">Original</div>
                        <div className="text-base font-bold text-white">{originalLabel}</div>
                    </div>
                    <div className="px-3 py-3 rounded-xl bg-indigo-500/[0.08] border border-indigo-500/20 text-center">
                        <div className="text-[9px] uppercase tracking-wider text-indigo-500/70 mb-1">Estimated</div>
                        <div className="text-base font-bold text-indigo-300">{estimatedLabel}</div>
                    </div>
                </div>
                {saving > 0 && (
                    <p className="text-center text-[11px] text-emerald-400 mt-2">~{saving}% smaller</p>
                )}
            </PanelSection>

            <div className="mt-auto pt-4">
                <ProcessButton
                    label="Compress Image"
                    isProcessing={isProcessing}
                    onClick={() => onProcess({ quality })}
                    gradient="from-amber-600 to-orange-600"
                />
                <ProgressBar visible={isProcessing} />
            </div>
        </div>
    );
}