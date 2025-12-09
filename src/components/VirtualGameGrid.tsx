
import React, { useMemo } from 'react';
import { VirtuosoGrid } from 'react-virtuoso';
import { Game } from '@/db';
import { GameCard } from './GameCard';

interface VirtualGameGridProps {
    games: Game[];
    onGameClick: (game: Game) => void;
    isLoading: boolean;
    skeletonCount: number;
}

const GridComponents = {
    List: React.forwardRef<HTMLDivElement, any>(({ style, children, ...props }, ref) => (
        <div
            ref={ref}
            {...props}
            style={{
                ...style,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '1rem',
                paddingBottom: '100px',
                willChange: 'transform' // GPU acceleration hint
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
};

export function VirtualGameGrid({ games, onGameClick, isLoading, skeletonCount }: VirtualGameGridProps) {

    // Memoize skeleton list to avoid recalculations
    const skeletons = useMemo(() => Array(skeletonCount).fill(null), [skeletonCount]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 pb-24">
                {skeletons.map((_, i) => (
                    <div
                        key={`skeleton-${i}`}
                        className="flex flex-col gap-2 animate-in fade-in"
                        style={{ animationDelay: `${Math.min(i * 30, 500)}ms` }}
                    >
                        <div className="aspect-[2/3] rounded-lg skeleton-shimmer relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                        </div>
                        <div className="h-4 w-3/4 rounded skeleton-shimmer" />
                        <div className="h-3 w-1/2 rounded skeleton-shimmer" />
                    </div>
                ))}
            </div>
        );
    }

    if (games.length === 0) {
        return null; // Parent handles empty state
    }

    // Ultra-optimized item rendering - NO animations for performance
    const ItemContent = React.memo(({ index, game }: { index: number; game: Game }) => {
        return <GameCard game={game} onClick={() => onGameClick(game)} />;
    }, (prev, next) => prev.game.id === next.game.id);

    return (
        <VirtuosoGrid
            style={{ height: 'calc(100vh - 200px)' }}
            totalCount={games.length}
            components={GridComponents}
            itemContent={(index) => <ItemContent index={index} game={games[index]} />}
            overscan={50} // REDUCED from 200px - only 50px buffer for low-end devices
            useWindowScroll
        />
    );
}
