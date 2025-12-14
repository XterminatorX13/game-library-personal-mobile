export const translations = {
    pt: {
        collections: {
            title: "Minhas",
            titleHighlight: "Coleções",
            newCollection: "Nova Coleção",
            searchPlaceholder: "Buscar coleções...",
            sortByName: "Nome",
            sortByDate: "Data",
            sortByGames: "Jogos",
            noCollectionsFound: "Nenhuma coleção encontrada",
            tryDifferentSearch: "Tente um termo diferente",
            noCollectionsYet: "Nenhuma coleção ainda",
            createFirstCollection: "Crie sua primeira coleção para organizar seus jogos",
            createCollection: "Criar Coleção",
            open: "Abrir",

            // Create Dialog
            createTitle: "Criar Nova Coleção",
            createDescription: "Organize seus jogos em coleções personalizadas",
            nameLabel: "Nome",
            namePlaceholder: "ex: RPGs Favoritos",
            descriptionLabel: "Descrição",
            descriptionPlaceholder: "Adicione uma descrição para esta coleção...",
            cancel: "Cancelar",
            create: "Criar Coleção",

            // Edit Dialog
            editTitle: "Editar Coleção",
            saveChanges: "Salvar Alterações",

            // Delete Dialog
            deleteTitle: "Excluir Coleção",
            deleteDescription: "Tem certeza que deseja excluir",
            deleteWarning: "Esta ação não pode ser desfeita.",
            delete: "Excluir",

            // Stats
            game: "Jogo",
            games: "Jogos",
            hoursPlayed: "h jogadas",
            platform: "Plataforma",
            platforms: "Plataformas",

            // Toast messages
            errorEnterName: "Por favor, insira um nome para a coleção",
            successCreated: "Coleção criada!",
            errorCreate: "Falha ao criar coleção",
            successUpdated: "Coleção atualizada!",
            errorUpdate: "Falha ao atualizar coleção",
            successDeleted: "Coleção excluída",
            errorDelete: "Falha ao excluir coleção",
        },
        gameDetails: {
            dialogTitle: "Detalhes do Jogo",
            status: "Status",
            rating: "Avaliação",
            hoursPlayed: "Horas Jogadas",
            personalNotes: "Notas Pessoais",
            notesPlaceholder: "Escreva suas impressões, review ou memórias sobre este jogo...",
            collections: "Coleções",
            newCollection: "Nova...",
            noCollections: "Nenhuma coleção criada.",
            save: "Salvar",
            delete: "Deletar",
            confirmDelete: "Tem certeza?",
            confirmYes: "Sim, Deletar",
            // Status options
            statusBacklog: "📅 Backlog",
            statusPlaying: "🕹️ Jogando",
            statusFinished: "🏆 Finalizado",
            statusDropped: "🗑️ Abandonado",
            // HLTB Section
            hltbTitle: "HowLongToBeat",
            hltbMainStory: "História Principal",
            hltbMainExtra: "Principal + Extras",
            hltbCompletionist: "Completionist",
            // RAWG Section
            metacritic: "Metacritic",
            avgPlaytime: "Tempo Médio",
            description: "Descrição",
            noDescription: "Sem descrição disponível.",
        }
    },
    en: {
        collections: {
            title: "My",
            titleHighlight: "Collections",
            newCollection: "New Collection",
            searchPlaceholder: "Search collections...",
            sortByName: "Name",
            sortByDate: "Date",
            sortByGames: "Games",
            noCollectionsFound: "No collections found",
            tryDifferentSearch: "Try a different search term",
            noCollectionsYet: "No collections yet",
            createFirstCollection: "Create your first collection to organize your games",
            createCollection: "Create Collection",
            open: "Open",

            // Create Dialog
            createTitle: "Create New Collection",
            createDescription: "Organize your games into custom collections",
            nameLabel: "Name",
            namePlaceholder: "e.g. RPG Favorites",
            descriptionLabel: "Description",
            descriptionPlaceholder: "Add a description for this collection...",
            cancel: "Cancel",
            create: "Create Collection",

            // Edit Dialog
            editTitle: "Edit Collection",
            saveChanges: "Save Changes",

            // Delete Dialog
            deleteTitle: "Delete Collection",
            deleteDescription: "Are you sure you want to delete",
            deleteWarning: "This action cannot be undone.",
            delete: "Delete",

            // Stats
            game: "Game",
            games: "Games",
            hoursPlayed: "h played",
            platform: "Platform",
            platforms: "Platforms",

            // Toast messages
            errorEnterName: "Please enter a collection name",
            successCreated: "Collection created!",
            errorCreate: "Failed to create collection",
            successUpdated: "Collection updated!",
            errorUpdate: "Failed to update collection",
            successDeleted: "Collection deleted",
            errorDelete: "Failed to delete collection",
        },
        gameDetails: {
            dialogTitle: "Game Details",
            status: "Status",
            rating: "Rating",
            hoursPlayed: "Hours Played",
            personalNotes: "Personal Notes",
            notesPlaceholder: "Write your thoughts, review, or memories about this game...",
            collections: "Collections",
            newCollection: "New...",
            noCollections: "No collections yet.",
            save: "Save",
            delete: "Delete",
            confirmDelete: "Are you sure?",
            confirmYes: "Yes, Delete",
            // Status options
            statusBacklog: "📅 Backlog",
            statusPlaying: "🕹️ Playing",
            statusFinished: "🏆 Finished",
            statusDropped: "🗑️ Dropped",
            // HLTB Section
            hltbTitle: "HowLongToBeat",
            hltbMainStory: "Main Story",
            hltbMainExtra: "Main + Extras",
            hltbCompletionist: "Completionist",
            // RAWG Section
            metacritic: "Metacritic",
            avgPlaytime: "Avg Playtime",
            description: "Description",
            noDescription: "No description available.",
        }
    }
};

export type Language = keyof typeof translations;

// Simple hook for translations
export const useTranslation = (lang: Language = 'pt') => {
    return {
        t: (key: string) => {
            const keys = key.split('.');
            let value: any = translations[lang];
            for (const k of keys) {
                value = value?.[k];
            }
            return value || key;
        }
    };
};
