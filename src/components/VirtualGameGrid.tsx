
import React, { useMemo } from 'react';
import { VirtuosoGrid } from 'react-virtuoso';
import { Game } from '@/db';
import { GameCard } from './GameCard';
import { motion, AnimatePresence } from 'framer-motion';

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
            style={{ ...style, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem', paddingBottom: '100px' }}
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
                    <motion.div
                        key={`skeleton-${i}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: Math.min(i * 0.05, 0.5),
                            duration: 0.5,
                            ease: "easeOut"
                        }}
                        className="flex flex-col gap-2"
                    >
                        <div className="aspect-[2/3] rounded-lg skeleton-shimmer relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                        </div>
                        <div className="h-4 w-3/4 rounded skeleton-shimmer" />
                        <div className="h-3 w-1/2 rounded skeleton-shimmer" />
                    </motion.div>
                ))}
            </div>
        );
    }

    if (games.length === 0) {
        return null; // Parent handles empty state
    }

    // Optimize item rendering with React.memo
    const ItemContent = React.memo(({ index, game }: { index: number; game: Game }) => {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <GameCard game={game} onClick={() => onGameClick(game)} />
            </motion.div>
        )
    }, (prev, next) => prev.game.id === next.game.id);

    return (
        <VirtuosoGrid
            style={{ height: 'calc(100vh - 200px)' }} // Adjust based on header height
            totalCount={games.length}
            components={GridComponents}
            itemContent={(index) => <ItemContent index={index} game={games[index]} />}
            overscan={200} // Pre-render 200px outside viewport for smooth scrolling
            useWindowScroll // Use window scroll instead of container scroll
        />
    );
}
