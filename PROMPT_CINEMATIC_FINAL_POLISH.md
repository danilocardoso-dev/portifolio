# CINEMATIC FINAL POLISH --- TRANSITIONS & FRAME PACING

## Missão

Trabalhe sobre a versão ATUAL do portfólio.

A direção artística chegou ao ponto certo. **Não redesenhe o site. Não
substitua a identidade visual. Não crie uma V3.**

Esta rodada é exclusivamente de acabamento cinematográfico e performance
perceptiva.

Preserve especialmente:

-   direção editorial/cinematográfica atual;
-   tipografia;
-   paisagem do hero;
-   sol vermelho;
-   foreground/galhos;
-   alternância entre cenas claras e escuras;
-   MapCloud;
-   Atlas3D;
-   Azriel;
-   PT/EN;
-   cases;
-   reduced motion;
-   arquitetura estática;
-   deploy via GitHub → Coolify → nginx.

O objetivo é fazer a experiência atual parecer **mais fluida, contínua e
cara**, principalmente no início e no final da jornada.

------------------------------------------------------------------------

# 1. PRIMEIRO: ASSISTA, NÃO PRESUMA

Execute o projeto localmente e assista à experiência inteira em
navegador real.

Faça pelo menos estes testes:

1.  scroll lento do início ao fim;
2.  scroll rápido;
3.  scroll reverso;
4.  trackpad/wheel quando disponível;
5.  desktop;
6.  mobile;
7.  reduced motion.

Use DevTools Performance quando possível.

Não conclua que uma transição está suave apenas porque a função
matemática usa easing.

Procure duas categorias diferentes de problema:

### A. Motion/design

-   corte perceptível;
-   mundo desaparecendo cedo demais;
-   falta de overlap;
-   mudança brusca de luz;
-   opacity parecendo crossfade;
-   sensação de "nova section entrou".

### B. Performance

-   frame drops;
-   long tasks;
-   Canvas caro;
-   filtros/blur custosos;
-   layout/reflow durante scroll;
-   excesso de trabalho no primeiro frame de uma cena;
-   criação excessiva de objetos dentro de `requestAnimationFrame`.

Corrija a causa correta.

------------------------------------------------------------------------

# 2. NÃO MEXER NO QUE JÁ FUNCIONA

Esta rodada NÃO autoriza reconstrução geral.

Antes de alterar algo pergunte:

> "Isso resolve uma falha perceptível de transição ou frame pacing?"

Se não, deixe como está.

Evite alterar:

-   copy;
-   estrutura geral;
-   paleta;
-   tipografia principal;
-   ordem dos projetos;
-   identidade das cenas;
-   conteúdo factual.

------------------------------------------------------------------------

# 3. PRIORIDADE 1 --- SAÍDA DO HERO

A transição do hero/paisagem para a primeira região escura ainda parece
terminar cedo demais.

Hoje a percepção é próxima de:

`PAISAGEM → término perceptível → CONTEÚDO ESCURO`

Quero:

`PAISAGEM → conteúdo nasce dentro dela → coexistência → paisagem é absorvida pelo escuro`

Aumente significativamente o overlap.

Elementos do hero devem sobreviver por mais scroll:

-   sol;
-   montanhas;
-   névoa;
-   parte do foreground;
-   grain/luz;
-   algumas partículas.

Não mantenha todos igualmente.

Use saída escalonada.

Exemplo conceitual:

-   texto principal começa a sair;
-   foreground continua;
-   conteúdo seguinte começa a existir;
-   luz diminui;
-   montanha permanece;
-   névoa cresce;
-   sol perde intensidade;
-   foreground cruza câmera;
-   somente então paisagem desaparece.

O visitante não deve identificar o frame/ponto exato onde "acabou o
hero".

------------------------------------------------------------------------

# 4. HERO → DARK: ILUMINAÇÃO, NÃO BACKGROUND SWITCH

Não faça a transição principalmente mudando background-color.

Faça a luz morrer gradualmente.

A região escura deve parecer surgir porque:

-   exposição cai;
-   névoa ganha densidade;
-   foreground fecha parte da composição;
-   contraste da paisagem reduz;
-   elementos distantes desaparecem primeiro.

O preto deve parecer **resultado da cinematografia**, não uma nova
`<section>`.

------------------------------------------------------------------------

# 5. PRIORIDADE 2 --- TRANSIÇÃO FINAL

A transição final observada é o ponto mais brusco.

A passagem do ambiente escuro/rede para a composição clara/cartográfica
parece uma nova página branca entrando.

Refaça ESSA transição cuidadosamente.

Não remova o contraste claro/escuro --- ele é bom.

Melhore o caminho até ele.

------------------------------------------------------------------------

# 6. DARK → LIGHT: CRIE UMA PONTE VISUAL

A mudança deve começar antes.

Sequência conceitual:

`preto + rede` → `rede perdendo contraste` → `linhas sobrevivem` →
`névoa cinza/off-white começa a entrar` → `linhas mudam de função` →
`fundo clareia progressivamente` → `linhas tornam-se cartografia` →
`composição clara domina`

Alguns objetos do mundo anterior devem sobreviver dentro do seguinte.

Não use simplesmente:

`opacity old 1→0` + `opacity new 0→1`.

Quero transformação perceptiva.

------------------------------------------------------------------------

# 7. PRESERVE O CHOQUE CLARO/ESCURO

IMPORTANTE:

Não homogenize a paleta para "resolver" a transição.

A alternância entre ambientes escuros e a cena clara do MapCloud cria
ritmo e funciona artisticamente.

O problema é a montagem, não a diferença de cor.

Mantenha o impacto do branco/off-white.

Faça o cérebro chegar nele naturalmente.

------------------------------------------------------------------------

# 8. FOREGROUND COMO WIPE ORGÂNICO

Nas duas transições prioritárias, avalie usar foreground como wipe
parcial:

-   galho;
-   folha;
-   névoa;
-   fragmento;
-   forma abstrata.

Não cubra a tela inteira como transição de PowerPoint.

O objeto apenas ajuda a esconder o momento mais complexo do morph.

A trajetória deve obedecer ao vento/câmera.

------------------------------------------------------------------------

# 9. DAMPING E FRAME PACING

Revise o motor atual.

Scroll continua sendo target; estado visual deve convergir com damping
baseado em delta-time.

Evite fórmulas dependentes diretamente do número de frames.

Prefira comportamento equivalente a exponential smoothing frame-rate
independent.

Conceitualmente:

`alpha = 1 - exp(-lambda * dt)`

`visual += (target - visual) * alpha`

Ajuste `lambda` visualmente.

Não copie valores cegamente.

------------------------------------------------------------------------

# 10. NÃO CRIE "LAG BONITO"

Inércia excessiva também é ruim.

O usuário nunca deve sentir que:

-   site está atrasado;
-   scroll está pesado;
-   conteúdo está tentando alcançar a página.

Damping deve existir na câmera/mundo visual, não na capacidade de
navegação.

Conteúdo continua imediatamente acessível.

------------------------------------------------------------------------

# 11. TRANSIÇÕES ASSIMÉTRICAS

Desacople timelines.

Hero → dark, por exemplo:

-   typography;
-   sun;
-   mountains;
-   fog;
-   foreground;
-   next scene;
-   lighting;

não devem compartilhar a mesma curva.

Dark → light:

-   network;
-   surviving lines;
-   fog;
-   background luminance;
-   cartography;
-   typography;

também precisam de timings próprios.

------------------------------------------------------------------------

# 12. PRE-ROLL / POST-ROLL

Cada transição importante deve ter:

### Pre-roll

A próxima cena começa a nascer antes de entrar formalmente na viewport.

### Core morph

Período de coexistência.

### Post-roll

Vestígios da cena anterior continuam depois da próxima já estar legível.

Isso elimina a sensação de trigger.

------------------------------------------------------------------------

# 13. SCROLL REVERSO

Toda transformação precisa ser igualmente convincente ao voltar.

Não escreva lógica que funciona artisticamente apenas de cima para
baixo.

Teste:

Hero ← dark

MapCloud ← Atlas

Atlas ← Azriel

dark ← light

Objetos precisam recuperar identidade suavemente.

------------------------------------------------------------------------

# 14. FRAME DROPS --- INVESTIGUE

Se o início/final realmente estiver perdendo frames, investigue antes de
mascarar com easing.

Procure:

-   filtros `blur()` grandes;
-   backdrop-filter durante scroll;
-   box-shadow enorme;
-   múltiplos gradients animados;
-   Canvas em DPR alto;
-   muitos `save/restore`;
-   criação de Path2D/arrays/objects por frame;
-   `getBoundingClientRect()` repetido em loops;
-   leituras e escritas de layout misturadas;
-   listeners redundantes;
-   imagens/mídia decodificando no momento da transição;
-   SVG filters caros;
-   elementos gigantes promovidos/despromovidos de layer.

Corrija apenas gargalos reais.

------------------------------------------------------------------------

# 15. WARM-UP

Se uma cena pesada trava apenas na primeira entrada, considere
preparação antecipada:

-   decode/preload de mídia;
-   inicialização do Canvas antes da cena ficar visível;
-   cálculo de geometria fora do frame crítico;
-   cache de valores estáticos;
-   precompute de paths;
-   criação antecipada de buffers.

Não carregue tudo agressivamente no first paint.

Faça warm-up pouco antes da necessidade.

------------------------------------------------------------------------

# 16. CANVAS

Para cada Canvas:

-   limite DPR;
-   reuse arrays/objects;
-   evite alocação por frame;
-   precompute geometria;
-   pause quando invisível;
-   pause em `document.hidden`;
-   reduza densidade mobile;
-   não desenhe partículas invisíveis;
-   evite clear/redraw desnecessário quando cena está estática.

Se possível, meça tempo médio do frame.

------------------------------------------------------------------------

# 17. CSS COMPOSITING

Prefira:

-   transform;
-   opacity.

Use blur/filter em elementos grandes com muito cuidado.

`will-change` somente em elementos que realmente precisam e apenas
quando útil; não aplique globalmente.

Evite centenas de layers promovidas.

------------------------------------------------------------------------

# 18. TIPOGRAFIA DURANTE TRANSIÇÕES

Texto não deve "piscar" entre cenas.

Use saída/entrada suave com:

-   translate pequeno;
-   opacity;
-   clip/mask quando barato;
-   depth sutil.

Não exagere blur em texto.

Preserve legibilidade durante scroll intermediário.

------------------------------------------------------------------------

# 19. NAVEGAÇÃO

Garanta que mudanças de contraste da navegação acompanhem a iluminação
gradualmente.

Evite navbar mudando de tema num frame específico.

------------------------------------------------------------------------

# 20. FINAL COMO FECHAMENTO

O último trecho deve desacelerar.

Não termine a experiência abruptamente depois do último grande visual.

Reduza:

-   vento;
-   sinais;
-   partículas;
-   velocidade aparente.

Aumente:

-   espaço;
-   silêncio;
-   estabilidade.

A sensação deve ser de créditos finais, não fim de landing page.

------------------------------------------------------------------------

# 21. MICRO-POLISH ESTÉTICO AUTORIZADO

Depois das transições estarem corretas, faça uma passada curta de
estética.

Você PODE melhorar:

-   spacing;
-   alinhamento;
-   iluminação;
-   foreground;
-   grain;
-   line weight;
-   pequenas escalas tipográficas;
-   detalhes dos mundos;
-   microinterações.

Você NÃO deve reconstruir a direção.

Só faça alterações que sejam claramente superiores ao estado atual.

------------------------------------------------------------------------

# 22. NÃO ADICIONE EFEITOS SÓ PORQUE PODE

Nenhum novo efeito é obrigatório.

Se a solução for remover três animações e melhorar duas, faça isso.

Objetivo:

**qualidade perceptiva \> quantidade de motion.**

------------------------------------------------------------------------

# 23. MOBILE

Teste especialmente a entrada e a saída.

No mobile:

-   reduza damping;
-   reduza foreground;
-   reduza blur;
-   reduza partículas;
-   preserve contraste;
-   mantenha transformação compreensível.

Touch scrolling deve continuar natural.

------------------------------------------------------------------------

# 24. REDUCED MOTION

Preserve experiência estática excelente.

Não introduza inertia contínua.

Transições podem usar fades simples/instantâneos quando necessário.

------------------------------------------------------------------------

# 25. TESTE VISUAL FINAL

Antes de finalizar, grave mentalmente/observe o percurso inteiro como
espectador.

Faça pelo menos três passes:

### Pass A --- lento

Procure cortes e morphs.

### Pass B --- rápido

Procure lag, quebra e frame drops.

### Pass C --- reverso

Procure lógica unidirecional.

Se algum problema aparecer, corrija antes de encerrar.

------------------------------------------------------------------------

# 26. CRITÉRIOS OBJETIVOS DE REJEIÇÃO

Não finalize se:

-   é possível apontar claramente onde o hero "desliga";
-   a cena escura parece simplesmente substituir a paisagem;
-   o final claro parece uma página branca entrando;
-   existe crossfade óbvio onde deveria haver morph;
-   scroll rápido deixa animação atrasada;
-   reversão quebra continuidade;
-   navbar troca de contraste abruptamente;
-   primeira entrada de uma cena causa hitch;
-   FPS cai perceptivelmente;
-   mobile parece pesado;
-   correções alteraram negativamente a estética atual.

------------------------------------------------------------------------

# 27. PRESERVAR

Não invente fatos.

Preserve:

-   PT/EN;
-   SEO;
-   canonical;
-   acessibilidade;
-   cases;
-   conteúdo;
-   deploy estático;
-   GitHub → Coolify → nginx;
-   `index.html` na raiz;
-   reduced motion;
-   controle manual de movimento.

Não introduza credenciais.

------------------------------------------------------------------------

# 28. ENTREGA

Implemente as correções no repositório.

Ao terminar, relate objetivamente:

1.  causa visual da transição inicial;
2.  causa visual da transição final;
3.  se havia frame drops reais e onde;
4.  alterações no damping/frame pacing;
5.  overlaps adicionados;
6.  elementos usados como pontes visuais;
7.  otimizações realizadas;
8.  micro-polish estético;
9.  comportamento mobile;
10. comportamento reduced motion;
11. arquivos alterados;
12. como reproduzir/testar.

Não entregue apenas recomendações.

**Implemente.**

------------------------------------------------------------------------

# MANDATO FINAL

A estética atual está aprovada.

Não reinvente.

Agora faça a montagem desaparecer.

O visitante não deve perceber "uma transição".

Ele deve simplesmente perceber que:

**o mundo mudou.**
