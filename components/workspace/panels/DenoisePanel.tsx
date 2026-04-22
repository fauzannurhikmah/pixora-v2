'use client';

import { useState } from 'react';
import { Wind } from 'lucide-react';
import { PanelHeader, PanelSection, ProcessButton, ProgressBar, InfoBox } from '../ui/PanelShared';
import Slider from '../ui/Slider';
import Toggle from '../ui/Toggle';
import type { PanelProps } from '../ControlPanel';

type Mode = 'auto' | 'manual';

const PRESETS = [
    { label: 'Light', value: 25, desc: 'Minimal noise reduction — preserves texture.' },
    { label: 'Medium', value: 55, desc: 'Balanced. Ideal for most photos.' },
    { label: 'Strong', value: 85, desc: 'Heavy reduction — best for high-ISO images.' },
];

export default function DenoisePanel({ isProcessing, onProcess }: PanelProps) {
    const [mode, setMode] = useState<Mode>('auto');
    const [intensity, setIntensity] = useState(55);

    const active = PRESETS.find(p => p.value === intensity);

    const resolveStrength = (): 'low' | 'medium' | 'high' => {
        if (mode === 'auto') {
            return 'medium';
        }

        if (intensity <= 33) {
            return 'low';
        }

        if (intensity <= 66) {
            return 'medium';
        }

        return 'high';
    };

    return (
        <div className="flex flex-col h-full">
            <PanelHeader title="Denoise" description="Remove grain and noise while retaining sharp detail." />

            <PanelSection label="Mode">
                <Toggle
                    options={[{ value: 'auto', label: 'Auto' }, { value: 'manual', label: 'Manual' }]}
                    value={mode}
                    onChange={setMode}
                />
            </PanelSection>

            {mode === 'manual' ? (
                <PanelSection label="Intensity">
                    {/* Quick preset chips */}
                    <div className="flex gap-1.5 mb-3">
                        {PRESETS.map(p => (
                            <button
                                key={p.label}
                                onClick={() => setIntensity(p.value)}
                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold border transition-all
                  ${intensity === p.value
                                        ? 'bg-teal-500/15 border-teal-500/35 text-teal-300'
                                        : 'bg-white/[0.02] border-white/[0.05] text-gray-500 hover:text-white'}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600">Gentle</span>
                        <span className="text-xs font-semibold text-white tabular-nums">{intensity}%</span>
                        <span className="text-xs text-gray-600">Aggressive</span>
                    </div>
                    <Slider value={intensity} min={5} max={100} onChange={setIntensity} />

                    {active && (
                        <p className="text-[10px] text-gray-600 mt-2 text-center">{active.desc}</p>
                    )}
                </PanelSection>
            ) : (
                <div className="flex flex-col items-center gap-3 py-6">
                    <div className="w-16 h-16 rounded-[1.25rem] bg-teal-500/[0.08] border border-teal-500/20
            flex items-center justify-center shadow-lg shadow-teal-500/10">
                        <Wind className="w-7 h-7 text-teal-400" />
                    </div>
                    <InfoBox color="cyan">
                        AI will automatically detect noise levels and apply the optimal strength.
                    </InfoBox>
                </div>
            )}

            <div className="mt-auto pt-4">
                <ProcessButton
                    label="Denoise Image"
                    isProcessing={isProcessing}
                    onClick={() => onProcess({ strength: resolveStrength() })}
                    gradient="from-teal-600 to-cyan-600"
                />
                <ProgressBar visible={isProcessing} />
            </div>
        </div>
    );
}