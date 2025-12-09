import React, { useMemo } from 'react';
import { VirtuosoGrid } from 'react-virtuoso';
import { Game } from '@/db';
import { GameCard } from './GameCard';

interface VirtualGameGridProps {
    games: Game[];
    onGameClick: (game: Game) => void;
    isLoading: boolean;
    skeletonCount: number;
    viewMode?: "grid" | "list" | "gallery";
}

export function VirtualGameGrid({ games, onGameClick, isLoading, skeletonCount, viewMode = "grid" }: VirtualGameGridProps) {
    const skeletons = useMemo(() => Array(skeletonCount).fill(null), [skeletonCount]);

    // Dynamic grid columns based on view mode
    const gridStyle = useMemo(() => {
        switch (viewMode) {
            case 'list': return 'repeat(auto-fill, minmax(100%, 1fr))';
            case 'gallery': return 'repeat(auto-fill, minmax(300px, 1fr))';
            case 'grid':
            default: return 'repeat(auto-fill, minmax(140px, 1fr))';
        }
    }, [viewMode]);

    const GridComponents = useMemo(() => ({
        List: React.forwardRef<HTMLDivElement, any>(({ style, children, ...props }, ref) => (
            <div
                ref={ref}
                {...props}
                style={{
                    ...style,
                    display: 'grid',
                    gridTemplateColumns: gridStyle,
                    gap: viewMode === 'list' ? '0.5rem' : '1rem',
                    paddingBottom: '100px',
                }}
                className="w-full"
            >
                {children}
            </div>
        )),
        Item: ({ children, ...props }: any) => (
            <div {...props} className="w-full">
                {children}
            </div>
        )
    }), [gridStyle, viewMode]);

    if (isLoading) {
        return (
            <div className={`grid gap-4 pb-24 ${viewMode === 'list' ? 'grid-cols-1' :
                viewMode === 'gallery' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
                    'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                }`}>
                {skeletons.map((_, i) => (
                    <div key={`skeleton-${i}`} className="flex flex-col gap-2">
                        <div className={`rounded-lg skeleton-shimmer relative overflow-hidden ${viewMode === 'list' ? 'h-16 w-full' :
                            viewMode === 'gallery' ? 'aspect-video' :
                                'aspect-[2/3]'
                            }`}>
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                        </div>
                        {viewMode !== 'list' && (
                            <>
                                <div className="h-4 w-3/4 rounded skeleton-shimmer" />
                                <div className="h-3 w-1/2 rounded skeleton-shimmer" />
                            </>
                        )}
                    </div>
                ))}
            </div>
        );
    }

    if (games.length === 0) {
        return null;
    }

    // Eagerly load first 30 images for instant display
    const ItemContent = React.memo(({ index, game }: { index: number; game: Game }) => {
        const shouldEagerLoad = index < 30; // First 30 images load instantly

        return (
            <GameCard
                game={game}
                onClick={() => onGameClick(game)}
                variant={viewMode}
                priority={shouldEagerLoad}
            />
        );
    }, (prev, next) => prev.game.id === next.game.id && prev.game.cover === next.game.cover);

    return (
        <VirtuosoGrid
            style={{ height: 'calc(100vh - 200px)' }}
            totalCount={games.length}
            components={GridComponents}
            itemContent={(index) => <ItemContent index={index} game={games[index]} />}
            overscan={{ main: 500, reverse: 200 }}
            useWindowScroll
        />
    );
}
