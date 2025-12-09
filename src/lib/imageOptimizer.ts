// Image optimization utility using Cloudinary proxy for WebP/AVIF conversion
export function optimizeImageUrl(originalUrl: string, options: {
    width?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'auto';
} = {}): string {
    if (!originalUrl) return originalUrl;

    const { width = 300, quality = 60, format = 'auto' } = options;

    // Use Cloudinary's free fetch API to optimize external images
    const cloudinaryBase = 'https://res.cloudinary.com/demo/image/fetch';
    const transformations = `f_${format},q_${quality},w_${width},c_limit`;

    return `${cloudinaryBase}/${transformations}/${encodeURIComponent(originalUrl)}`;
}

// Aggressive caching for game covers
const imageCache = new Map<string, string>();

export function getCachedOptimizedImage(url: string): string {
    if (imageCache.has(url)) {
        return imageCache.get(url)!;
    }

    const optimized = optimizeImageUrl(url, {
        width: 280, // Smaller for mobile
        quality: 55, // More aggressive compression
        format: 'auto' // Let Cloudinary choose best format
    });

    imageCache.set(url, optimized);
    return optimized;
}
