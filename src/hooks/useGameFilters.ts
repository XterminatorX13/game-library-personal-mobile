import { useState, useMemo, useCallback } from 'react';
import { Game } from '@/db';

type Platform = string;
type StatusFilter = "Todos" | "Backlog" | "Jogando" | "Zerado" | "Dropado";
type SortOrder = "newest" | "name" | "rating";

const statusFilterToDbStatus: Record<StatusFilter, Game['status'] | null> = {
    Todos: null,
    Backlog: 'backlog',
    Jogando: 'playing',
    Zerado: 'finished',
    Dropado: 'dropped',
};

interface UseGameFiltersOptions {
    defaultPlatform?: Platform;
    defaultStatus?: StatusFilter;
    defaultSort?: SortOrder;
}

/**
 * Custom hook for filtering and sorting games
 * Centralizes filter logic and provides memoized results
 */
export function useGameFilters(games: Game[], options: UseGameFiltersOptions = {}) {
    const [search, setSearch] = useState("");
    const [platformFilter, setPlatformFilter] = useState<Platform>(options.defaultPlatform || "Todos");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>(options.defaultStatus || "Todos");
    const [sortOrder, setSortOrder] = useState<SortOrder>(options.defaultSort || "newest");

    // Extract unique platforms from games
    const platforms = useMemo(() => {
        return Array.from(new Set(games.map(g => g.platform))).filter(Boolean).sort();
    }, [games]);

    // Memoized filtered and sorted games
    const filteredGames = useMemo(() => {
        let result = [...games];

        // Search filter
        if (search.trim()) {
            const searchLower = search.toLowerCase();
            result = result.filter(game =>
                game.title.toLowerCase().includes(searchLower) ||
                game.platform.toLowerCase().includes(searchLower) ||
                game.tags?.some(tag => tag.toLowerCase().includes(searchLower))
            );
        }

        // Platform filter
        if (platformFilter !== "Todos") {
            result = result.filter(game => game.platform === platformFilter);
        }

        // Status filter
        const dbStatus = statusFilterToDbStatus[statusFilter];
        if (dbStatus) {
            result = result.filter(game => game.status === dbStatus);
        }

        // Sorting
        switch (sortOrder) {
            case 'name':
                result.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'rating':
                result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'newest':
            default:
                result.sort((a, b) => b.addedAt - a.addedAt);
                break;
        }

        return result;
    }, [games, search, platformFilter, statusFilter, sortOrder]);

    // Memoized setters to prevent unnecessary re-renders
    const handleSearch = useCallback((value: string) => {
        setSearch(value);
    }, []);

    const handlePlatformFilter = useCallback((value: Platform) => {
        setPlatformFilter(value);
    }, []);

    const handleStatusFilter = useCallback((value: StatusFilter) => {
        setStatusFilter(value);
    }, []);

    const handleSortOrder = useCallback((value: SortOrder) => {
        setSortOrder(value);
    }, []);

    // Reset all filters
    const resetFilters = useCallback(() => {
        setSearch("");
        setPlatformFilter("Todos");
        setStatusFilter("Todos");
        setSortOrder("newest");
    }, []);

    // Check if any filter is active
    const hasActiveFilters = useMemo(() => {
        return search.trim() !== "" ||
            platformFilter !== "Todos" ||
            statusFilter !== "Todos";
    }, [search, platformFilter, statusFilter]);

    return {
        // State
        search,
        platformFilter,
        statusFilter,
        sortOrder,
        platforms,
        filteredGames,
        hasActiveFilters,

        // Setters
        setSearch: handleSearch,
        setPlatformFilter: handlePlatformFilter,
        setStatusFilter: handleStatusFilter,
        setSortOrder: handleSortOrder,
        resetFilters,
    };
}

export type { Platform, StatusFilter, SortOrder };
