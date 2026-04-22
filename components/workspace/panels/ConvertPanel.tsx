'use client';

import { useState } from 'react';
import { PanelHeader, PanelSection, ProcessButton, ProgressBar } from '../ui/PanelShared';
import type { PanelProps } from '../ControlPanel';

type Format = 'JPG' | 'PNG' | 'WebP' | 'AVIF';

const FORMATS: { value: Format; desc: string }[] = [
    { value: 'JPG', desc: 'Universal. Best for photos.' },
    { value: 'PNG', desc: 'Lossless. Supports transparency.' },
    { value: 'WebP', desc: 'Modern. Best size + quality balance.' },
    { value: 'AVIF', desc: 'Next-gen. Smallest file size.' },
];

export default function ConvertPanel({ isProcessing, onProcess }: PanelProps) {
    const [format, setFormat] = useState<Format>('WebP');
    const desc = FORMATS.find(f => f.value === format)?.desc ?? '';

    return (
        <div className="flex flex-col h-full">
            <PanelHeader title="Convert" description="Convert your image to any modern format." />

            <PanelSection label="Target format">
                <div className="grid grid-cols-2 gap-2">
                    {FORMATS.map(f => (
                        <button
                            key={f.value}
                            onClick={() => setFormat(f.value)}
                            className={`py-3 rounded-xl text-sm font-semibold border transition-all duration-200
                ${format === f.value
                                    ? 'bg-violet-500/15 border-violet-500/35 text-violet-300'
                                    : 'bg-white/[0.02] border-white/[0.06] text-gray-500 hover:text-white hover:border-white/10'}`}
                        >
                            .{f.value.toLowerCase()}
                        </button>
                    ))}
                </div>
            </PanelSection>

            <PanelSection label="Format info">
                <div className="px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-xs text-gray-400 leading-relaxed">
                    {desc}
                </div>
            </PanelSection>

            <div className="mt-auto pt-4">
                <ProcessButton
                    label={`Convert to .${format.toLowerCase()}`}
                    isProcessing={isProcessing}
                    onClick={() => onProcess({ format })}
                    gradient="from-violet-600 to-purple-600"
                />
                <ProgressBar visible={isProcessing} />
            </div>
        </div>
    );
}