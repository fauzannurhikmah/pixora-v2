'use client';

import { useState } from 'react';
import { PanelHeader, PanelSection, ProcessButton, ProgressBar } from '../ui/PanelShared';
import Slider from '../ui/Slider';
import type { PanelProps } from '../ControlPanel';
import { useImageStore } from '@/stores/imageStore';

function formatFileSize(bytes: number): string {
    if (bytes <= 0) {
        return '0 B';
    }

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CompressPanel({ isProcessing, onProcess }: PanelProps) {
    const [quality, setQuality] = useState(80);
    const activeImage = useImageStore((state) => state.activeImage);

    const originalBytes = activeImage?.file?.size ?? 0;
    const estimatedBytes = Math.round((originalBytes * quality) / 100);
    const originalLabel = originalBytes > 0 ? formatFileSize(originalBytes) : '-';
    const estimatedLabel = originalBytes > 0 ? formatFileSize(estimatedBytes) : '-';
    const saving = Math.round(100 - quality);

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
                    <p className="text-center text-[11px] text-emerald-400 mt-2">
                        ~{saving}% smaller
                    </p>
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