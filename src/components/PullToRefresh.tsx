import React, { useState, useRef } from 'react';
import { RefreshCw, CheckCircle2 } from 'lucide-react';
import { hapticFeedback } from '../utils/haptics';

interface PullToRefreshProps {
    onRefresh: () => Promise<void> | void;
    children: React.ReactNode;
}

const PULL_THRESHOLD = 70;
const MAX_PULL = 110;

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
    const [pullY, setPullY] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const startYRef = useRef(0);
    const isPullingRef = useRef(false);

    const handleTouchStart = (e: React.TouchEvent) => {
        const container = containerRef.current;
        if (!container || isRefreshing) return;

        if (container.scrollTop <= 0) {
            startYRef.current = e.touches[0].clientY;
            isPullingRef.current = true;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isPullingRef.current || isRefreshing) return;

        const currentY = e.touches[0].clientY;
        const deltaY = currentY - startYRef.current;

        if (deltaY > 0) {
            const dampedY = Math.min(Math.pow(deltaY, 0.85) * 1.8, MAX_PULL);
            setPullY(dampedY);

            if (dampedY >= PULL_THRESHOLD && pullY < PULL_THRESHOLD) {
                hapticFeedback.selection();
            }
        } else {
            setPullY(0);
        }
    };

    const handleTouchEnd = async () => {
        if (!isPullingRef.current || isRefreshing) return;
        isPullingRef.current = false;

        if (pullY >= PULL_THRESHOLD) {
            setIsRefreshing(true);
            setPullY(PULL_THRESHOLD * 0.7);
            hapticFeedback.medium();

            try {
                await onRefresh();
                setIsSuccess(true);
                hapticFeedback.success();
                setTimeout(() => {
                    setIsSuccess(false);
                    setIsRefreshing(false);
                    setPullY(0);
                }, 600);
            } catch (err) {
                hapticFeedback.error();
                setIsRefreshing(false);
                setPullY(0);
            }
        } else {
            setPullY(0);
        }
    };

    const progress = Math.min(pullY / PULL_THRESHOLD, 1);
    const rotation = pullY * 3.5;

    return (
        <div
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative h-full overflow-y-auto custom-scrollbar"
        >
            {/* Visual Pull Indicator */}
            <div
                className="absolute left-0 right-0 top-0 flex items-center justify-center pointer-events-none z-40 transition-all duration-150"
                style={{
                    height: `${pullY}px`,
                    opacity: pullY > 10 ? 1 : 0
                }}
            >
                <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border backdrop-blur-xl transition-all ${
                        isSuccess
                            ? 'bg-emerald-500 text-white border-emerald-400'
                            : 'bg-white/95 dark:bg-slate-900/95 text-[#003366] dark:text-yellow-400 border-slate-200 dark:border-white/10'
                    }`}
                    style={{
                        transform: `scale(${Math.min(0.7 + progress * 0.3, 1)})`,
                    }}
                >
                    {isSuccess ? (
                        <>
                            <CheckCircle2 className="w-4 h-4 text-white animate-bounce" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Updated</span>
                        </>
                    ) : (
                        <>
                            <RefreshCw
                                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                                style={{
                                    transform: isRefreshing ? undefined : `rotate(${rotation}deg)`
                                }}
                            />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {isRefreshing
                                    ? 'Syncing Data...'
                                    : pullY >= PULL_THRESHOLD
                                    ? 'Release to Refresh'
                                    : 'Pull to Refresh'}
                            </span>
                        </>
                    )}
                </div>
            </div>

            <div
                style={{
                    transform: `translateY(${pullY}px)`,
                    transition: isPullingRef.current ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
            >
                {children}
            </div>
        </div>
    );
};

