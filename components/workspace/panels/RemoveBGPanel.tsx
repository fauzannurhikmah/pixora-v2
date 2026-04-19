'use client';

import { motion } from 'framer-motion';
import { Eraser } from 'lucide-react';
import { PanelHeader, ProcessButton, ProgressBar, InfoBox } from '../ui/PanelShared';
import type { PanelProps } from '../ControlPanel';

export default function RemoveBGPanel({ isProcessing, onProcess }: PanelProps) {
    return (
        <div className="flex flex-col h-full">
            <PanelHeader title="Remove Background" description="AI-powered background removal in one click." />

            {/* Visual focal point */}
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-6">
                <motion.div
                    animate={isProcessing ? { scale: [1, 1.06, 1], opacity: [0.8, 1, 0.8] } : { scale: 1 }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    className="w-20 h-20 rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/[0.08] flex items-center justify-center shadow-lg shadow-emerald-500/10"
                >
                    <Eraser className="w-8 h-8 text-emerald-400" />
                </motion.div>
                <div className="text-center">
                    <p className="text-xs font-semibold text-white mb-1">One-click removal</p>
                    <p className="text-[11px] text-gray-600 leading-relaxed max-w-[160px] mx-auto">
                        Works on people, products, objects, and complex scenes
                    </p>
                </div>
            </div>

            <InfoBox color="emerald">
                Output will be a transparent PNG — ready for any background.
            </InfoBox>

            <div className="mt-4">
                <ProcessButton label="Remove Background" isProcessing={isProcessing} onClick={onProcess} gradient="from-emerald-600 to-teal-600" />
                <ProgressBar visible={isProcessing} />
            </div>
        </div>
    );
}