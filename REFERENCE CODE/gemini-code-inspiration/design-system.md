GameVault: Visual Language & Design System

"Mais do que uma biblioteca, uma galeria de arte digital."

1. Filosofia do Design (The Core Concept)

O GameVault afasta-se da estética tradicional "Gamer/RGB" para abraçar o "Cinematic Luxury". A interface não deve parecer um software utilitário, mas sim um objeto de desejo tangível, evocando a sensação de manusear equipamento de áudio topo de gama ou visitar uma galeria de arte exclusiva.

Pilares:

Tangibilidade: A UI reage organicamente (brilhos, zooms, luz).

Minimalismo: A ausência de ruído visual. O conteúdo respira.

Escuridão Profunda: O uso de pretos absolutos para criar contraste infinito com acentos dourados.

Dopamina Visual: Cada interação deve recompensar o utilizador com micro-animações satisfatórias.

2. Paleta de Cores (Obsidian & Gold)

A base é escura e profunda, permitindo que os acentos metálicos brilhem.

Superfícies (Backgrounds)

Void Black: #050505 (Fundo principal - Pureza)

Obsidian Glass: bg-zinc-900/40 com backdrop-blur-xl (Módulos secundários)

Deep Noise: Textura SVG de granulação fina sobreposta a 5% de opacidade para evitar o aspeto "plástico".

Metais & Acentos (Accents)

Royal Amber (Ouro):

Base: amber-500 (Ícones ativos, destaques)

Glow: shadow-[0_0_20px_rgba(245,158,11,0.3)]

Gradiente: bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700

Ethereal Indigo (Luz Ambiente):

Base: indigo-900 (Usado apenas em "blobs" desfocados de fundo para profundidade)

Platinum (Texto):

Primário: zinc-200 a zinc-300

Muted: zinc-500 (Rótulos e metadados)

3. Tipografia (The Editorial Look)

A sofisticação vem do espaçamento, não da fonte em si. Usamos a fonte do sistema (Sans-serif) mas tratada como numa revista de moda.

Rótulos (Labels):

Estilo: text-[10px] font-bold uppercase tracking-widest

Efeito: Cria uma sensação técnica, precisa e elegante.

Números de Destaque:

Estilo: text-6xl font-light tracking-tighter

Efeito: Modernidade e impacto visual imediato.

Títulos:

Estilo: font-light tracking-wide

Efeito: Elegância e clareza.

4. Componentes Principais

O "Lingote" (Botão Primário)

Não é apenas um botão, é um objeto físico.

Shape: rounded-full (Pílula)

Estilo: Fundo branco/platina sobre fundo preto.

Interação: Sombra de luz branca suave ao passar o rato.

Animação: Um brilho (shimmer) que percorre o botão diagonalmente.

O "Monólito" (Card de Jogo - Grid)

Shape: rounded-[2rem] (Bordas muito arredondadas, estilo Apple/Sony).

Comportamento:

Estado Normal: Imagem a 60-80% de opacidade.

Hover: Imagem a 100%, Zoom suave (scale-105), Título flutua para cima, Informações (Rating/Platform) aparecem suavemente (fade-in).

Borda: Uma borda subtil white/5 que brilha na cor do acento ao interagir.

O "Vidro" (Modais e Painéis)

Tecnologia: Glassmorphism.

Borda: border border-white/10 (Uma linha fina de luz a definir o limite).

Sombra: Profunda e difusa.

Sistema de Notificações (Toasts)

Conceito: "Feedback Silencioso".

Estilo: Flutuam no canto inferior direito. Fundo de vidro escuro. Ícone colorido minimalista. Sem sons intrusivos, apenas presença visual.

5. Inteligência Artificial (The Concierge)

A IA não é uma ferramenta de busca, é um Curador de Luxo.

Personalidade: "Art Director" e "Sommelier".

Funções Visuais:

Auto-Fill Mágico: Preenche dados técnicos e texturas.

Seletor de Arte: Oferece 3 opções visuais para o utilizador "editar" a sua coleção.

Ambilight: Detecta as cores da capa e banha a interface com essa luz.

6. Roadmap de Ideias (O "God Tier")

Conceitos aprovados para implementação futura para elevar a experiência:

Ambilight UI (Implementado): Luz de fundo reativa à cor do jogo.

Sound Design Sensorial: Cliques mecânicos subtis, sons de vidro e "hum" de baixa frequência.

Efeito Parallax Holográfico: Capas que se movem em 3D oposto ao rato.

Command Center: Menu de navegação via teclado (Cmd+K) com fundo desfocado.

Modo Cinema: Detalhes do jogo em tela cheia imersiva.

Metais Personalizáveis: Temas Rose Gold, Platinum, Obsidian.

Nota de Degustação: A IA gera uma crítica poética de uma frase baseada nas tags do utilizador.

Modo Screensaver (Quadro Digital): Interface desaparece, exibindo apenas arte em movimento lento (Ken Burns effect) quando ocioso.

Badges de Platina: Ícones discretos (diamante, coroa) para conquistas de coleção.

O Vault Privado: Área oculta acessível por "long press" ou biometria, com animação de cofre pesado.

Este documento serve como a "Estrela do Norte" para o desenvolvimento visual do GameVault.