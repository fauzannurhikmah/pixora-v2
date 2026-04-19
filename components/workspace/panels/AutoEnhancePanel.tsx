'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { PanelHeader, PanelSection, ProcessButton, ProgressBar } from '../ui/PanelShared';
import Slider from '../ui/Slider';
import type { PanelProps } from '../ControlPanel';

interface Sliders {
    brightness: number;
    contrast: number;
    sharpness: number;
    saturation: number;
    highlights: number;
    shadows: number;
}

const DEFAULTS: Sliders = {
    brightness: 50,
    contrast: 50,
    sharpness: 50,
    saturation: 50,
    highlights: 50,
    shadows: 50,
};

const SLIDER_CONFIG: { key: keyof Sliders; label: string }[] = [
    { key: 'brightness', label: 'Brightness' },
    { key: 'contrast', label: 'Contrast' },
    { key: 'sharpness', label: 'Sharpness' },
    { key: 'saturation', label: 'Saturation' },
    { key: 'highlights', label: 'Highlights' },
    { key: 'shadows', label: 'Shadows' },
];

export default function AutoEnhancePanel({ isProcessing, onProcess }: PanelProps) {
    const [values, setValues] = useState<Sliders>(DEFAULTS);

    const set = (key: keyof Sliders) => (v: number) =>
        setValues(prev => ({ ...prev, [key]: v }));

    const isDirty = Object.entries(values).some(([k, v]) => v !== DEFAULTS[k as keyof Sliders]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-1">
                <PanelHeader title="Auto Enhance" description="Fine-tune exposure, tone, and detail." />
                {isDirty && (
                    <button
                        onClick={() => setValues(DEFAULTS)}
                        className="shrink-0 -mt-3 p-1.5 rounded-lg text-gray-600 hover:text-white border border-white/[0.05]
              hover:border-white/10 bg-white/[0.02] transition-all"
                    >
                        <RotateCcw className="w-3 h-3" />
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-4 flex-1 overflow-y-auto pb-2">
                {SLIDER_CONFIG.map(({ key, label }) => (
                    <PanelSection key={key}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-medium text-gray-400">{label}</span>
                            <span className={`text-[11px] font-semibold tabular-nums transition-colors
                ${values[key] !== 50 ? 'text-yellow-400' : 'text-gray-600'}`}>
                                {values[key] > 50 ? `+${values[key] - 50}` : values[key] - 50}
                            </span>
                        </div>
                        <Slider value={values[key]} min={0} max={100} onChange={set(key)} />
                    </PanelSection>
                ))}
            </div>

            <div className="mt-auto pt-4">
                <ProcessButton
                    label="Apply Enhancements"
                    isProcessing={isProcessing}
                    onClick={onProcess}
                    gradient="from-yellow-600 to-amber-600"
                />
                <ProgressBar visible={isProcessing} />
            </div>
        </div>
    );
}