'use client';

import { useState, useCallback, useEffect } from 'react';
import { useImageStore } from '@/stores/imageStore';
import Sidebar from '@/components/workspace/Sidebar';
import PreviewArea from '@/components/workspace/PreviewArea';
import ControlPanel from '@/components/workspace/ControlPanel';
import { ToolId } from '@/components/workspace/constants';
import { processImage, type ProcessOptions } from '@/lib/api/imageProcessing';

export default function Workspace() {
    const [activeTool, setActiveTool] = useState<ToolId>('upscale');
    const [isProcessing, setIsProcessing] = useState(false);
    const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

    const { activeImage, afterImage, setAfterImage, addImage } = useImageStore();

    useEffect(() => {
        if (activeTool !== 'compress') {
            setLocalPreviewUrl(null);
        }
    }, [activeTool]);

    const handleProcess = useCallback(async (options?: ProcessOptions) => {
        if (!activeImage) return;

        setIsProcessing(true);
        setLocalPreviewUrl(null);
        setAfterImage('');

        try {
            const resultUrl = await processImage({
                tool: activeTool,
                file: activeImage.file,
                options,
            });

            setAfterImage(resultUrl);
        } catch (error) {
            console.error('Image processing failed:', error);
        } finally {
            setIsProcessing(false);
        }
    }, [activeImage, activeTool, setAfterImage]);

    const handleReplaceImage = useCallback((file: File) => {
        setLocalPreviewUrl(null);
        addImage(file);
    }, [addImage]);

    return (
        <div className="min-h-screen w-full bg-mesh flex overflow-hidden">
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="orb-a absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-700/15 blur-[120px]" />
                <div className="orb-b absolute top-20 -right-48   w-[500px] h-[500px] rounded-full bg-purple-700/10 blur-[120px]" />
            </div>

            <Sidebar activeTool={activeTool} onSelect={setActiveTool} />
            <PreviewArea
                imageUrl={activeImage?.preview ?? null}
                processedUrl={localPreviewUrl ?? (afterImage || null)}
                finalProcessedUrl={afterImage || null}
                isProcessing={isProcessing}
                onReplaceImage={handleReplaceImage}
            />
            <ControlPanel
                activeTool={activeTool}
                isProcessing={isProcessing}
                onProcess={handleProcess}
                onPreviewChange={setLocalPreviewUrl}
            />
        </div>
    );
}