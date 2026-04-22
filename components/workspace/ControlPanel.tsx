'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { ToolId } from './constants';
import UpscalePanel from './panels/UpscalePanel';
import CompressPanel from './panels/CompressPanel';
import RemoveBGPanel from './panels/RemoveBGPanel';
import RemoveWatermarkPanel from './panels/RemoveWatermarkPanel';
import ConvertPanel from './panels/ConvertPanel';
import ResizeCropPanel from './panels/ResizeCropPanel';
import AutoEnhancePanel from './panels/AutoEnhancePanel';
import DenoisePanel from './panels/DenoisePanel';
import BatchPanel from './panels/BatchPanel';
import type { ProcessOptions } from '@/lib/api/imageProcessing';

export interface PanelProps {
    isProcessing: boolean;
    onProcess: (options?: ProcessOptions) => void | Promise<void>;
}

const PANELS: Record<ToolId, React.ComponentType<PanelProps>> = {
    'upscale': UpscalePanel,
    'compress': CompressPanel,
    'remove-bg': RemoveBGPanel,
    'remove-watermark': RemoveWatermarkPanel,
    'convert': ConvertPanel,
    'resize-crop': ResizeCropPanel,
    'auto-enhance': AutoEnhancePanel,
    'denoise': DenoisePanel,
    'batch': BatchPanel,
};

interface Props {
    activeTool: ToolId;
    isProcessing: boolean;
    onProcess: (options?: ProcessOptions) => void | Promise<void>;
}

export default function ControlPanel({ activeTool, isProcessing, onProcess }: Props) {
    const Panel = PANELS[activeTool];

    return (
        <aside className="relative flex flex-col h-screen w-[272px] shrink-0 p-2 z-20">
            {/* Floating glass panel */}
            <div className="absolute inset-2 rounded-[1.5rem] border border-white/[0.06] bg-white/[0.025] backdrop-blur-xl shadow-2xl pointer-events-none" />

            <div className="relative flex-1 overflow-y-auto overflow-x-hidden px-3 pt-4 pb-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTool}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.18 }}
                        className="h-full"
                    >
                        <Panel isProcessing={isProcessing} onProcess={onProcess} />
                    </motion.div>
                </AnimatePresence>
            </div>
        </aside>
    );
}