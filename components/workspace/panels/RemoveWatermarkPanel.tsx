'use client';

import { useState } from 'react';
import { Brush } from 'lucide-react';
import { PanelHeader, PanelSection, ProcessButton, ProgressBar, InfoBox } from '../ui/PanelShared';
import Slider from '../ui/Slider';
import type { PanelProps } from '../ControlPanel';

export default function RemoveWatermarkPanel({ isProcessing, onProcess }: PanelProps) {
    const [brushSize, setBrushSize] = useState(24);
    const [opacity, setOpacity] = useState(75);

    return (
        <div className="flex flex-col h-full">
            <PanelHeader title="Remove Watermark" description="Paint over watermarks — AI fills the region seamlessly." />

            <PanelSection label="Brush size">
                <div className="flex items-center justify-between mb-2.5">
                    <Brush className="w-3 h-3 text-gray-600" />
                    <span className="text-xs font-semibold text-white tabular-nums">{brushSize}px</span>
                    <Brush className="w-4.5 h-4.5 text-gray-500" />
                </div>
                <Slider value={brushSize} min={4} max={80} onChange={setBrushSize} />
            </PanelSection>

            <PanelSection label="Mask opacity">
                <div className="flex items-center justify-between text-xs mb-2.5">
                    <span className="text-gray-600">Faint</span>
                    <span className="text-white font-semibold">{opacity}%</span>
                    <span className="text-gray-600">Solid</span>
                </div>
                <Slider value={opacity} min={20} max={100} onChange={setOpacity} />
            </PanelSection>

            <InfoBox color="cyan">
                Paint over the watermark on the preview, then press process.
            </InfoBox>

            <div className="mt-auto pt-4">
                <ProcessButton label="Remove Watermark" isProcessing={isProcessing} onClick={onProcess} gradient="from-cyan-600 to-blue-600" />
                <ProgressBar visible={isProcessing} />
            </div>
        </div>
    );
}