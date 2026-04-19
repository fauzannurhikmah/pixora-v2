import { create } from 'zustand';

export interface ImageFile {
    id: string;
    file: File;
    preview: string;
    status: 'pending' | 'processing' | 'done' | 'error';
    progress: number;
}

export interface ImageState {
    currentTool: string | null;
    images: ImageFile[];
    activeImage: ImageFile | null;
    beforeImage: string | null;
    afterImage: string | null;
    processingOptions: Record<string, any>;

    setCurrentTool: (tool: string) => void;
    addImage: (file: File) => void;
    removeImage: (id: string) => void;
    setActiveImage: (id: string | null) => void;
    setBeforeImage: (url: string) => void;
    setAfterImage: (url: string) => void;
    updateProcessingOptions: (options: Record<string, any>) => void;
    updateImageStatus: (id: string, status: ImageFile['status'], progress?: number) => void;
    reset: () => void;
}

export const useImageStore = create<ImageState>((set) => ({
    currentTool: null,
    images: [],
    activeImage: null,
    beforeImage: null,
    afterImage: null,
    processingOptions: {},

    setCurrentTool: (tool) =>
        set({ currentTool: tool }),

    addImage: (file) =>
        set((state) => {
            const preview = URL.createObjectURL(file);
            const newImage: ImageFile = {
                id: Date.now().toString(),
                file,
                preview,
                status: 'pending',
                progress: 0,
            };
            return {
                images: [...state.images, newImage],
                activeImage: newImage,
                beforeImage: preview,
                afterImage: null,
            };
        }),

    removeImage: (id) =>
        set((state) => {
            const filtered = state.images.filter((img) => img.id !== id);
            return {
                images: filtered,
                activeImage: state.activeImage?.id === id ? filtered[0] || null : state.activeImage,
            };
        }),

    setActiveImage: (id) =>
        set((state) => {
            const image = state.images.find((img) => img.id === id);
            if (image) {
                return {
                    activeImage: image,
                    beforeImage: image.preview,
                    afterImage: null,
                };
            }
            return state;
        }),

    setBeforeImage: (url) =>
        set({ beforeImage: url }),

    setAfterImage: (url) =>
        set({ afterImage: url }),

    updateProcessingOptions: (options) =>
        set((state) => ({
            processingOptions: { ...state.processingOptions, ...options },
        })),

    updateImageStatus: (id, status, progress = 0) =>
        set((state) => ({
            images: state.images.map((img) =>
                img.id === id ? { ...img, status, progress } : img
            ),
        })),

    reset: () =>
        set({
            currentTool: null,
            images: [],
            activeImage: null,
            beforeImage: null,
            afterImage: null,
            processingOptions: {},
        }),
}));
