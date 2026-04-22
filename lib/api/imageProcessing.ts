import type { ToolId } from '@/components/workspace/constants';

export interface ProcessOptions {
    scale?: '2x' | '4x';
    quality?: number;
    format?: 'PNG' | 'JPEG' | 'JPG' | 'WEBP' | 'BMP' | 'TIFF' | 'GIF';
    width?: number;
    height?: number;
    maintain_aspect?: boolean;
    strength?: 'low' | 'medium' | 'high';
}

interface ProcessImageInput {
    tool: ToolId;
    file: File;
    options?: ProcessOptions;
}

const API_BASE_URL = (
    process.env.NEXT_PUBLIC_API_BASE_URL
    ?? process.env.NEXT_PUBLIC_API_URL
    ?? 'http://localhost:8000'
).replace(/\/$/, '');

const ENDPOINTS: Record<ToolId, string> = {
    upscale: '/api/upscale',
    compress: '/api/compress',
    'remove-bg': '/api/remove-bg',
    'remove-watermark': '/api/remove-watermark',
    convert: '/api/convert',
    'resize-crop': '/api/resize-crop',
    'auto-enhance': '/api/auto-enhance',
    denoise: '/api/denoise',
    batch: '/api/batch',
};

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

function buildRequestFormData({ tool, file, options }: ProcessImageInput): FormData {
    const formData = new FormData();
    formData.append('file', file);

    switch (tool) {
        case 'upscale': {
            formData.append('scale', options?.scale ?? '2x');
            break;
        }
        case 'compress': {
            const quality = clamp(Math.round(options?.quality ?? 80), 1, 100);
            formData.append('quality', String(quality));
            break;
        }
        case 'convert': {
            formData.append('format', options?.format ?? 'PNG');
            break;
        }
        case 'resize-crop': {
            const width = Math.round(options?.width ?? 0);
            const height = Math.round(options?.height ?? 0);

            if (width <= 0 || height <= 0) {
                throw new Error('Width and height are required for resize-crop.');
            }

            formData.append('width', String(width));
            formData.append('height', String(height));
            formData.append('maintain_aspect', String(Boolean(options?.maintain_aspect)));
            break;
        }
        case 'denoise': {
            formData.append('strength', options?.strength ?? 'medium');
            break;
        }
        case 'auto-enhance':
        case 'remove-bg':
        case 'remove-watermark':
        case 'batch':
        default:
            break;
    }

    return formData;
}

function toAbsoluteUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
        return url;
    }

    if (url.startsWith('/')) {
        return `${API_BASE_URL}${url}`;
    }

    return `${API_BASE_URL}/${url}`;
}

function extractImageFromJson(payload: unknown): string | null {
    if (!payload || typeof payload !== 'object') {
        return null;
    }

    const data = payload as Record<string, unknown>;

    const candidateKeys = [
        'url',
        'image_url',
        'output_url',
        'result_url',
        'processed_url',
        'download_url',
        'file_url',
    ];

    for (const key of candidateKeys) {
        const value = data[key];
        if (typeof value === 'string' && value.length > 0) {
            return toAbsoluteUrl(value);
        }
    }

    const nestedData = data.data;
    if (nestedData && typeof nestedData === 'object') {
        const nested = nestedData as Record<string, unknown>;
        for (const key of candidateKeys) {
            const value = nested[key];
            if (typeof value === 'string' && value.length > 0) {
                return toAbsoluteUrl(value);
            }
        }
    }

    const base64Keys = ['base64', 'image_base64', 'result_base64'];
    for (const key of base64Keys) {
        const value = data[key];
        if (typeof value === 'string' && value.length > 0) {
            return value.startsWith('data:') ? value : `data:image/png;base64,${value}`;
        }
    }

    return null;
}

export async function processImage(input: ProcessImageInput): Promise<string> {
    if (input.tool === 'batch') {
        throw new Error('Batch processing is not supported in single-image flow.');
    }

    const endpoint = ENDPOINTS[input.tool];
    const formData = buildRequestFormData(input);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Request failed with status ${response.status}`);
    }

    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes('image/') || contentType.includes('application/octet-stream')) {
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    }

    if (contentType.includes('application/json')) {
        const json = await response.json();
        const imageUrl = extractImageFromJson(json);
        if (imageUrl) {
            return imageUrl;
        }
    }

    throw new Error('Backend response did not contain an image URL or image binary.');
}