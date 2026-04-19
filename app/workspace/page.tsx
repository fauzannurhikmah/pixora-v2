'use client';

import { useState, useCallback } from 'react';
import { useImageStore } from '@/stores/imageStore';
import Sidebar from '@/components/workspace/Sidebar';
import PreviewArea from '@/components/workspace/PreviewArea';
import ControlPanel from '@/components/workspace/ControlPanel';
import { ToolId } from '@/components/workspace/constants';

export default function Workspace() {
    const [activeTool, setActiveTool] = useState<ToolId>('upscale');
    const [isProcessing, setIsProcessing] = useState(false);

    const { activeImage, afterImage, setAfterImage, addImage, setActiveImage } = useImageStore();

    const handleProcess = useCallback(() => {
        if (!activeImage) return;
        setIsProcessing(true);
        setAfterImage('');
        setTimeout(() => {
            setIsProcessing(false);
            setAfterImage(activeImage.preview);
        }, 2500);
    }, [activeImage, setAfterImage]);

    const handleReplaceImage = useCallback((file: File) => {
        addImage(file);
    }, [addImage]);

    return (
        <div className="min-h-screen w-full bg-mesh flex overflow-hidden">
            {/* Ambient orbs — consistent with landing */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="orb-a absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-700/15 blur-[120px]" />
                <div className="orb-b absolute top-20 -right-48   w-[500px] h-[500px] rounded-full bg-purple-700/10 blur-[120px]" />
            </div>

            <Sidebar activeTool={activeTool} onSelect={setActiveTool} />
            <PreviewArea
                imageUrl={activeImage?.preview ?? null}
                processedUrl={afterImage || null}
                isProcessing={isProcessing}
                onReplaceImage={handleReplaceImage}
            />
            <ControlPanel activeTool={activeTool} isProcessing={isProcessing} onProcess={handleProcess} />
        </div>
    );
}