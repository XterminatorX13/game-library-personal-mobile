// Cache cleanup utility for PWA
// Run this in browser console to clear old bloated cache

export async function cleanupImageCache() {
    if ('caches' in window) {
        const cacheNames = await caches.keys();

        console.log('🧹 Cleaning up old image caches...');

        // Delete old caches
        const oldCaches = cacheNames.filter(name =>
            name.includes('igdb-images') ||
            name.includes('rawg-images-old') ||
            name.includes('steamgrid-images-old')
        );

        for (const cacheName of oldCaches) {
            await caches.delete(cacheName);
            console.log(`✅ Deleted: ${cacheName}`);
        }

        // Get current cache sizes
        const currentCaches = cacheNames.filter(name =>
            name.includes('weserv') ||
            name.includes('steamgrid') ||
            name.includes('rawg')
        );

        for (const cacheName of currentCaches) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            console.log(`📦 ${cacheName}: ${keys.length} entries`);
        }

        console.log('✨ Cache cleanup complete!');
        return true;
    }

    console.error('❌ Cache API not supported');
    return false;
}

// Auto-run on import (for one-time migration)
if (typeof window !== 'undefined') {
    // Only run once per session
    const cleaned = sessionStorage.getItem('cache-cleaned-v2');
    if (!cleaned) {
        cleanupImageCache().then(() => {
            sessionStorage.setItem('cache-cleaned-v2', 'true');
        });
    }
}
