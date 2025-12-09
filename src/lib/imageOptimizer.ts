// Image optimization using images.weserv.nl (Open Source, Free, Unlimited)
// Docs: https://images.weserv.nl/docs/
export function optimizeImageUrl(originalUrl: string, options: {
    width?: number;
    quality?: number;
    output?: 'webp' | 'avif' | 'auto';
} = {}): string {
    if (!originalUrl) return originalUrl;

    const { width = 300, quality = 60, output = 'webp' } = options;

    // Use images.weserv.nl - Free OSS image optimization service
    const params = new URLSearchParams({
        url: originalUrl,
        w: width.toString(),
        q: quality.toString(),
        output: output,
        il: '', // Interlace/progressive loading
        af: '', // Auto-filter (sharpen)
    });

    return `https://images.weserv.nl/?${params.toString()}`;
}

// Aggressive caching for game covers
const imageCache = new Map<string, string>();

export function getCachedOptimizedImage(url: string): string {
    if (imageCache.has(url)) {
        return imageCache.get(url)!;
    }

    const optimized = optimizeImageUrl(url, {
        width: 280,
        quality: 55,
        output: 'webp'
    });

    imageCache.set(url, optimized);
    return optimized;
}
