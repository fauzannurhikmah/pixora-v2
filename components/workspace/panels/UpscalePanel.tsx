'use client';

import { useState } from 'react';
import { Clock } from 'lucide-react';
import { PanelHeader, PanelSection, ProcessButton, ProgressBar, InfoBox } from '../ui/PanelShared';
import Toggle from '../ui/Toggle';
import type { PanelProps } from '../ControlPanel';

export default function UpscalePanel({ isProcessing, onProcess }: PanelProps) {
    const [scale, setScale] = useState<'2x' | '4x'>('2x');
    const est = scale === '2x' ? '~3s' : '~8s';

    return (
        <div className="flex flex-col h-full gap-0">
            <PanelHeader title="Upscale" description="Enhance resolution using neural super-resolution." />

            <PanelSection label="Scale factor">
                <Toggle
                    options={[{ value: '2x', label: '2× Upscale' }, { value: '4x', label: '4× Upscale' }]}
                    value={scale}
                    onChange={setScale}
                />
            </PanelSection>

            <PanelSection label="Estimate">
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    Processing time: <span className="text-white font-medium ml-auto">{est}</span>
                </div>
            </PanelSection>

            <PanelSection label="Output">
                <InfoBox color="indigo">
                    Output will be a lossless PNG with {scale === '2x' ? '2×' : '4×'} the original resolution.
                </InfoBox>
            </PanelSection>

            <div className="mt-auto pt-4">
                <ProcessButton
                    label="Upscale Image"
                    isProcessing={isProcessing}
                    onClick={() => onProcess({ scale })}
                />
                <ProgressBar visible={isProcessing} />
            </div>
        </div>
    );
}