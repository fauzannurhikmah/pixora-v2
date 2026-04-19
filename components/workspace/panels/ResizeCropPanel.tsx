'use client';

import { useState } from 'react';
import { Link2, Link2Off } from 'lucide-react';
import { PanelHeader, PanelSection, ProcessButton, ProgressBar } from '../ui/PanelShared';
import type { PanelProps } from '../ControlPanel';

const PRESETS = [
    { label: '1:1', w: 1080, h: 1080 },
    { label: '16:9', w: 1920, h: 1080 },
    { label: '4:3', w: 1600, h: 1200 },
    { label: '9:16', w: 1080, h: 1920 },
    { label: '2:1', w: 2000, h: 1000 },
    { label: 'Free', w: 0, h: 0 },
];

export default function ResizeCropPanel({ isProcessing, onProcess }: PanelProps) {
    const [width, setWidth] = useState<string>('1920');
    const [height, setHeight] = useState<string>('1080');
    const [locked, setLocked] = useState(true);
    const [activePreset, setActivePreset] = useState('16:9');

    const applyPreset = (p: typeof PRESETS[number]) => {
        setActivePreset(p.label);
        if (p.w > 0) { setWidth(String(p.w)); setHeight(String(p.h)); }
    };

    const handleWidth = (v: string) => {
        setWidth(v);
        if (locked && activePreset !== 'Free') {
            const ratio = Number(height) / Number(width);
            if (!isNaN(ratio)) setHeight(String(Math.round(Number(v) * ratio)));
        }
        setActivePreset('Free');
    };

    const handleHeight = (v: string) => {
        setHeight(v);
        if (locked && activePreset !== 'Free') {
            const ratio = Number(width) / Number(height);
            if (!isNaN(ratio)) setWidth(String(Math.round(Number(v) * ratio)));
        }
        setActivePreset('Free');
    };

    return (
        <div className="flex flex-col h-full">
            <PanelHeader title="Resize & Crop" description="Set exact dimensions or choose a preset ratio." />

            <PanelSection label="Presets">
                <div className="grid grid-cols-3 gap-1.5">
                    {PRESETS.map(p => (
                        <button
                            key={p.label}
                            onClick={() => applyPreset(p)}
                            className={`py-2 rounded-xl text-[11px] font-semibold border transition-all duration-200
                ${activePreset === p.label
                                    ? 'bg-pink-500/15 border-pink-500/35 text-pink-300'
                                    : 'bg-white/[0.02] border-white/[0.05] text-gray-500 hover:text-white hover:border-white/10'}`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </PanelSection>

            <PanelSection label="Dimensions (px)">
                <div className="flex items-center gap-2">
                    {/* Width */}
                    <div className="flex-1">
                        <p className="text-[9px] uppercase tracking-widest text-gray-600 mb-1.5">W</p>
                        <input
                            type="number"
                            value={width}
                            onChange={e => handleWidth(e.target.value)}
                            className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2.5
                text-xs text-white font-medium outline-none focus:border-pink-500/40 focus:bg-white/[0.06]
                transition-all tabular-nums"
                        />
                    </div>

                    {/* Lock toggle */}
                    <button
                        onClick={() => setLocked(l => !l)}
                        className={`mt-5 p-2 rounded-lg border transition-all duration-200
              ${locked
                                ? 'border-pink-500/30 bg-pink-500/10 text-pink-400'
                                : 'border-white/[0.06] bg-white/[0.02] text-gray-600 hover:text-gray-400'}`}
                    >
                        {locked ? <Link2 className="w-3.5 h-3.5" /> : <Link2Off className="w-3.5 h-3.5" />}
                    </button>

                    {/* Height */}
                    <div className="flex-1">
                        <p className="text-[9px] uppercase tracking-widest text-gray-600 mb-1.5">H</p>
                        <input
                            type="number"
                            value={height}
                            onChange={e => handleHeight(e.target.value)}
                            className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2.5
                text-xs text-white font-medium outline-none focus:border-pink-500/40 focus:bg-white/[0.06]
                transition-all tabular-nums"
                        />
                    </div>
                </div>

                <p className="text-[10px] text-gray-700 mt-2 text-center">
                    {locked ? '⚡ Aspect ratio locked' : 'Aspect ratio unlocked'}
                </p>
            </PanelSection>

            <div className="mt-auto pt-4">
                <ProcessButton
                    label="Resize Image"
                    isProcessing={isProcessing}
                    onClick={onProcess}
                    gradient="from-pink-600 to-rose-600"
                />
                <ProgressBar visible={isProcessing} />
            </div>
        </div>
    );
}