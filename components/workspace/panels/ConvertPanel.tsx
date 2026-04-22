'use client';

import { useEffect, useMemo, useState } from 'react';
import { PanelHeader, PanelSection, ProcessButton, ProgressBar } from '../ui/PanelShared';
import type { PanelProps } from '../ControlPanel';
import { useImageStore } from '@/stores/imageStore';

type Format = 'PNG' | 'JPEG' | 'JPG' | 'WEBP' | 'BMP' | 'TIFF' | 'GIF';

const FORMATS: { value: Format; desc: string }[] = [
    { value: 'PNG', desc: 'Lossless. Supports transparency.' },
    { value: 'JPEG', desc: 'Universal photo format with solid compression.' },
    { value: 'JPG', desc: 'Alias of JPEG for compatibility with older tools.' },
    { value: 'WEBP', desc: 'Modern web format with good quality/size balance.' },
    { value: 'BMP', desc: 'Bitmap format with broad system-level support.' },
    { value: 'TIFF', desc: 'High-quality format often used in print workflows.' },
    { value: 'GIF', desc: 'Palette-based format for simple graphics and animations.' },
];

const MIME_TO_FORMAT: Record<string, Format> = {
    'image/png': 'PNG',
    'image/jpeg': 'JPEG',
    'image/webp': 'WEBP',
    'image/bmp': 'BMP',
    'image/tiff': 'TIFF',
    'image/gif': 'GIF',
};

function getExtension(fileName: string): string {
    const parts = fileName.toLowerCase().split('.');
    return parts.length > 1 ? parts[parts.length - 1] : '';
}

function normalizeFamily(format: Format): 'PNG' | 'JPEG' | 'WEBP' | 'BMP' | 'TIFF' | 'GIF' {
    if (format === 'JPG' || format === 'JPEG') {
        return 'JPEG';
    }

    return format;
}

function detectSourceFormat(file: File | null | undefined): Format | null {
    if (!file) {
        return null;
    }

    const fromMime = MIME_TO_FORMAT[file.type.toLowerCase()];
    if (fromMime) {
        return fromMime;
    }

    const ext = getExtension(file.name);
    if (ext === 'png') return 'PNG';
    if (ext === 'jpeg' || ext === 'jpg') return 'JPEG';
    if (ext === 'webp') return 'WEBP';
    if (ext === 'bmp') return 'BMP';
    if (ext === 'tif' || ext === 'tiff') return 'TIFF';
    if (ext === 'gif') return 'GIF';

    return null;
}

export default function ConvertPanel({ isProcessing, onProcess }: PanelProps) {
    const activeImage = useImageStore((state) => state.activeImage);
    const sourceFormat = detectSourceFormat(activeImage?.file);

    const availableFormats = useMemo(() => {
        if (!sourceFormat) {
            return FORMATS;
        }

        const sourceFamily = normalizeFamily(sourceFormat);
        return FORMATS.filter((f) => normalizeFamily(f.value) !== sourceFamily);
    }, [sourceFormat]);

    const [format, setFormat] = useState<Format>(availableFormats[0]?.value ?? 'PNG');

    useEffect(() => {
        if (!availableFormats.some((f) => f.value === format)) {
            setFormat(availableFormats[0]?.value ?? 'PNG');
        }
    }, [availableFormats, format]);

    const desc = FORMATS.find(f => f.value === format)?.desc ?? '';
    const sourceText = sourceFormat ? `Detected source: ${sourceFormat}` : 'Source format not detected';

    return (
        <div className="flex flex-col h-full">
            <PanelHeader title="Convert" description="Convert your image to any modern format." />

            <PanelSection label="Source format">
                <div className="px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-xs text-gray-400 leading-relaxed">
                    {sourceText}
                </div>
            </PanelSection>

            <PanelSection label="Target format">
                <div className="grid grid-cols-2 gap-2">
                    {availableFormats.map(f => (
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