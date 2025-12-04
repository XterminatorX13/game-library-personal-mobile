
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Gamepad2 } from "lucide-react";
import { useState } from "react";
  },
];

const Platform = () => {
    const { name } = useParams();
    const decodedName = decodeURIComponent(name || "");

    const platformGames = MOCK_GAMES.filter(
        (g) => g.platform.toLowerCase() === decodedName.toLowerCase()
    );

    const totalHours = platformGames.reduce((acc, curr) => acc + curr.hoursPlayed, 0);

    return (
        <div className="min-h-screen bg-background text-foreground animate-fade-in">
            <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
                <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para Biblioteca
                </Link>

                <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <Gamepad2 className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold uppercase tracking-tight md:text-4xl">
                                    {decodedName}
                                </h1>
                                <p className="text-muted-foreground">
                                    Coleção do Console
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 text-sm text-muted-foreground">
                        <div className="rounded-xl border bg-card px-4 py-2">
                            <span className="block text-xl font-bold text-foreground">{platformGames.length}</span>
                            <span className="text-xs uppercase tracking-wider">Jogos</span>
                        </div>
                        <div className="rounded-xl border bg-card px-4 py-2">
                            <span className="block text-xl font-bold text-foreground">{totalHours}h</span>
                            <span className="text-xs uppercase tracking-wider">Jogadas</span>
                        </div>
                    </div>
                </header>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {platformGames.map((game) => (
                        <article
                            key={game.id}
                            className="group relative overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg hover:border-primary/50"
                        >
                            <div className="aspect-video w-full overflow-hidden bg-muted">
                                <img
                                    src={game.cover} // In real app, use real cover
                                    alt={game.title}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold leading-none tracking-tight">{game.title}</h3>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {game.tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                                    ))}
                                </div>
                            </div>
                        </article>
                    ))}

                    {platformGames.length === 0 && (
                        <div className="col-span-full py-12 text-center text-muted-foreground">
                            <p>Nenhum jogo encontrado para {decodedName}.</p>
                            <Button variant="link" className="mt-2 text-primary">
                                Adicionar jogo para {decodedName}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Platform;
