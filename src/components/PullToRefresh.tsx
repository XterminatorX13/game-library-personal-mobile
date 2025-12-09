import { useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const y = useMotionValue(0);
    const opacity = useTransform(y, [0, 100], [0, 1]);
    const rotate = useTransform(y, [0, 100], [0, 360]);

    const handleDragEnd = useCallback(async (_: any, info: any) => {
        if (info.offset.y > 100 && !isRefreshing) {
            setIsRefreshing(true);
            await onRefresh();
            setIsRefreshing(false);
            y.set(0);
        } else {
            y.set(0);
        }
    }, [isRefreshing, onRefresh, y]);

    return (
        <div className="relative overflow-hidden">
            <motion.div
                className="absolute top-0 left-0 right-0 flex items-center justify-center h-16 z-50"
                style={{ opacity }}
            >
                <motion.div style={{ rotate }}>
                    <RefreshCw className={`h-6 w-6 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
                </motion.div>
            </motion.div>

            <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0.5, bottom: 0 }}
                onDragEnd={handleDragEnd}
                style={{ y }}
                className="touch-pan-y"
            >
                {children}
            </motion.div>
        </div>
    );
}
