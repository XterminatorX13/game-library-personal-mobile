// Image optimization using images.weserv.nl (Open Source, Free, Unlimited)
// Docs: https://images.weserv.nl/docs/
export function optimizeImageUrl(originalUrl: string, options: {
    width?: number;
    quality?: number;
    output?: 'webp' | 'avif' | 'auto';
    blur?: number;
} = {}): string {
    if (!originalUrl) return originalUrl;

    const { width = 300, quality = 100, output = 'webp', blur } = options;

    // Use images.weserv.nl - Free OSS image optimization service
    const params = new URLSearchParams({
        url: originalUrl,
        w: width.toString(),
        q: quality.toString(),
        output: output,
        il: '', // Interlace/progressive loading
        af: '', // Auto-filter (sharpen)
    });

    // Add blur if specified
    if (blur) {
        params.set('blur', blur.toString());
    }

    return `https://images.weserv.nl/?${params.toString()}`;
}

// Aggressive caching for game covers
const imageCache = new Map<string, string>();
const blurCache = new Map<string, string>();

export function getCachedOptimizedImage(url: string): string {
    if (imageCache.has(url)) {
        return imageCache.get(url)!;
    }

    const optimized = optimizeImageUrl(url, {
        width: 400, // Increased for High DPI screens
        quality: 80,
        output: 'webp'
    });

    imageCache.set(url, optimized);
    return optimized;
}

// Ultra-compressed blur placeholder for loading states
export function getBlurPlaceholder(url: string): string {
    if (blurCache.has(url)) {
        return blurCache.get(url)!;
    }

    const blurred = optimizeImageUrl(url, {
        width: 40,        // Tiny resolution
        quality: 20,      // Very low quality (it's blurred anyway)
        output: 'webp',   // WebP for better compression
        blur: 10          // Apply blur server-side
    });

    blurCache.set(url, blurred);
    return blurred;
}
