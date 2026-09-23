# PROMPT --- PORTFÓLIO GOD MODE

# GOD MODE --- DIRETIVA DE ELEVAÇÃO CINEMATOGRÁFICA

## Contexto real inspecionado

Este prompt deve ser aplicado ao repositório real já existente. A versão
atual é um site estático sem build, publicado via GitHub → Coolify →
nginx na VPS. Ela contém `index.html`, `css/styles.css`, `js/main.js`,
os cases `mapcloud.html`, `atlas3d.html` e `azriel.html`, além de três
GIFs técnicos gerados pelo script `scripts/generate-motion-gifs.js`.

A implementação atual já possui aproximadamente 2.100 linhas de CSS e
400 linhas de JavaScript, além de: Canvas de vento no hero, folhas CSS,
névoa, ridges/paisagem abstrata, parallax por pointer,
IntersectionObserver, scroll progress, contador animado, controle para
pausar movimento, suporte a `prefers-reduced-motion`, PT/EN e motion
loops próprios. Portanto, NÃO trate o projeto como vazio e NÃO entregue
apenas pequenas melhorias cosméticas. Leia integralmente os arquivos e
eleve o sistema existente.

## Ambição

Quero uma experiência digital extraordinária, autoral e cinematográfica.
O visitante deve pensar primeiro "que experiência é essa?" e só depois
perceber que está em um portfólio de engenharia.

A referência emocional é Ghost of Tsushima: vento como linguagem visual,
silêncio, natureza, folhas, névoa, luz, composição assimétrica, vermelho
preciso, paisagem, profundidade e contemplação. Não copie personagens,
screenshots, UI, logos, mapas, música ou assets do jogo. Extraia
princípios de direção de arte e produza identidade original para Danilo
V. Cardoso.

O resultado deve combinar dois mundos: **natureza cinematográfica +
engenharia de software**. Não faça "samurai + programação", cyberpunk
genérico, Matrix, dashboard, template SaaS ou fan site.

## Hero como cena viva

Reconstrua o hero como uma cena multicamada, não um banner. Use planos
independentes:

-   background profundo com luz atmosférica e paisagem abstrata;
-   plano intermediário com névoa e partículas;
-   foreground com folhas/fragmentos orgânicos, alguns próximos da
    câmera e levemente desfocados;
-   interface com nome, headline, statement e CTAs.

Cada plano deve se mover em velocidade diferente. Pointer pode deslocar
a "câmera" poucos pixels. Scroll deve alterar profundidade. A cena deve
permanecer excelente parada.

Crie uma abertura curta de 2--4 segundos, sem bloquear navegação: quase
preto → vento → partículas → luz/paisagem → nome → headline revelada por
máscara/tinta. Deve ser pulável, não cansativa, degradar sem JS e
respeitar reduced motion.

## Wind engine

O Canvas atual de vento deve evoluir para um sistema ambiental coerente.
Uma mesma força conceitual deve influenciar partículas, folhas, névoa,
linhas, vegetação abstrata e pequenas transições. Evite confete
aleatório. Use trajetórias curvas, velocidades diferentes, inércia e
assimetria.

Folhas devem existir em três profundidades: distantes pequenas/lentas;
intermediárias com rotação; próximas maiores, rápidas e ocasionalmente
desfocadas. Poucas folhas vermelhas podem funcionar como acento.

## Motion assets --- vá além dos GIFs atuais

Os GIFs existentes de MapCloud, Atlas3D e Azriel são apenas ponto de
partida. Você pode melhorar o gerador, substituir GIF por WebP animado,
vídeo WebM/MP4 otimizado, SVG animado, Canvas ou CSS. Escolha
tecnicamente a melhor ferramenta; não use GIF por obrigação.

MapCloud deve sugerir cartografia viva, rotas, nós, geolocalização e
fluxo de dados. Atlas3D deve transmitir wireframe, geometria,
coordenadas, profundidade e rotação. Azriel deve sugerir sinal,
automação, inteligência, nós, pulsos e propagação. Esses motions devem
parecer parte da direção de arte, não imagens anexadas a cards.

Se criar assets programaticamente, mantenha scripts reproduzíveis no
repositório. Não baixe material protegido.

## Scroll cinematográfico

Transforme a página em capítulos, mantendo scroll nativo. Use mudanças
graduais de luz, densidade de partículas, composição, escala
tipográfica, névoa e profundidade. Não use scroll-jacking.

Evite seções como retângulos empilhados. Crie continuidade espacial com
névoa, foreground atravessando limites, máscaras, linhas de tinta,
elementos persistentes e mudanças de paisagem.

Use sticky/pinning apenas onde realmente aumentar a narrativa e sem
prender o usuário.

## Projetos como mundos

Não use três cards iguais.

Cada projeto deve ter identidade e motion próprios:

-   **MapCloud:** mapa, rotas, geolocalização, sincronização, dados,
    operação.
-   **Atlas3D:** geometria, espaço, wireframe, profundidade,
    coordenadas, rotação.
-   **Azriel:** sinal, automação, IA, nós, pulsos, sistemas.

Leia as páginas de case antes de alterar. Não invente fatos, métricas ou
informações confidenciais. Redesenhe também `projects/mapcloud.html`,
`projects/atlas3d.html` e `projects/azriel.html`; a experiência não
termina na home.

## Direção visual

Paleta base: carvão, preto profundo, off-white e cinzas quentes.
Vermelho profundo apenas como acento significativo. Nada de
preto+vermelho gamer.

Trate luz como elemento de design: discos solares abstratos, gradientes
radiais, luz atravessando névoa e iluminação mudando discretamente com
scroll. Sem neon cyberpunk.

Adicione textura sutil com noise procedural, SVG, grain ou
pseudo-elements, evitando imagens gigantes e repaints caros.

Tipografia deve combinar uma voz display/editorial forte, sans limpa e
mono técnica usada com moderação. Explore títulos gigantes, clipping,
máscaras, números editoriais, legendas técnicas e espaço negativo.

## Microinterações e pointer

Em desktop, considere cursor customizado apenas se ficar excelente e sem
lag. Pode reagir a links/projetos e influenciar levemente partículas
próximas. Nunca prejudique touch, teclado ou acessibilidade.

Adicione detalhes de descoberta: vento respondendo a movimento rápido,
coordenadas técnicas discretas, linhas que acompanham scroll,
arquitetura aparecendo em hover/focus, pequenos sinais ambientais
ligados à seção atual. Não transforme o site em jogo.

## Áudio

Áudio é opcional e estritamente opt-in. Nunca autoplay com som. Não use
música ou áudio protegido. Se não houver asset original/licenciado, não
invente nem baixe. O site deve ser completo sem áudio.

## Movimento responsável

Preserve e melhore o controle atual de pausar movimento. Quando pausado,
Canvas, CSS animations e loops decorativos devem parar ou reduzir de
forma coerente. `prefers-reduced-motion` deve ativar uma versão reduzida
automaticamente. A versão estática ainda precisa ser visualmente
extraordinária.

Animação deve usar principalmente `transform` e `opacity`. Evite
animações lineares e sincronizadas demais. Natureza não se move em
uníssono.

## Performance adaptativa

A VPS é pequena, mas o site é estático; o principal custo será no
cliente. Não resolva "nível god" adicionando um bundle enorme.

Prefira HTML/CSS/JS nativo. Não introduza React, Three.js, GSAP ou outra
biblioteca pesada automaticamente. Uma dependência só é aceitável se
trouxer benefício visual substancial impossível ou desproporcionalmente
complexo em código nativo.

Implemente qualidade adaptativa: desktop potente pode receber mais
partículas/parallax; mobile recebe menos layers e blur; reduced motion
recebe composição estática forte.

Pause animações fora da viewport e quando `document.hidden`. Limite DPR
do Canvas, número de partículas e trabalho por frame. Centralize
cálculos de scroll. Evite layout thrashing.

Use lazy loading abaixo da dobra e formatos modernos para mídia. Vídeos
decorativos, se usados, devem ser curtos, comprimidos, `muted`,
`playsinline`, `loop`, ter poster/fallback e não dominar o peso inicial.

## Mobile

Não encolha o desktop. Faça direção artística própria para 320, 375, 430
e 768 px. Reposicione tipografia, reduza partículas, elimine efeitos
caros e preserve impacto visual. Sem overflow horizontal.

## SEO, idioma e acessibilidade

Preserve PT/EN e melhore a troca de idioma. Preserve canonical
`https://danilovcardoso.com.br/`, metadata, Open Graph, headings e
semântica.

Obrigatório: skip link, teclado, foco visível, contraste, labels, alt
text, landmarks, reduced motion e controles acessíveis. Canvas é
decorativo e não pode conter informação essencial.

## Regras de execução

1.  Leia TODOS os arquivos relevantes antes de editar.
2.  Não fique apenas planejando: implemente.
3.  Pode reescrever radicalmente o layout atual.
4.  Preserve somente fatos verdadeiros e conteúdo profissional
    relevante.
5.  Remova CSS/JS morto após a reconstrução.
6.  Não introduza credenciais.
7.  Não altere o modelo de deploy estático sem necessidade real.
8.  `index.html` deve continuar publicável na raiz pelo Coolify/nginx.
9.  Não deixe TODOs no lugar de trabalho final.
10. Não use placeholders genéricos onde já existe conteúdo real.

## Critério "extraordinário"

Antes de encerrar, faça uma segunda passagem exclusivamente de direção
de arte. Pergunte, seção por seção:

-   existe profundidade real ou apenas animação?
-   o movimento tem motivo?
-   existe um momento de silêncio visual?
-   a composição parece autoral?
-   o vermelho está sendo usado com intenção?
-   o site continua bonito com movimento pausado?
-   cada projeto tem personalidade própria?
-   existe algo visualmente memorável na primeira dobra?
-   mobile parece dirigido ou apenas adaptado?
-   algum efeito parece template? Se sim, remova/refaça.
-   alguma animação chama mais atenção que o conteúdo? Se sim, reduza.
-   existe oportunidade de elevar acabamento em transições, tipografia,
    spacing ou timing?

Faça essa segunda passagem e implemente as melhorias encontradas.

## Verificação final obrigatória

Teste/inspecione:

-   console sem erros;
-   links;
-   PT/EN;
-   home e três cases;
-   320/375/430/768/desktop;
-   teclado;
-   reduced motion;
-   controle de motion;
-   assets ausentes;
-   overflow;
-   caminhos relativos;
-   HTTPS-safe resources;
-   carregamento sem JS;
-   comportamento quando aba fica oculta;
-   performance de Canvas;
-   publicação estática.

Ao finalizar, entregue resumo objetivo de arquivos alterados, sistema de
motion criado, assets gerados, decisões de performance, acessibilidade,
como testar localmente e qualquer revisão manual recomendada.

## Mandato final

Não entregue "um portfólio bonito".

Entregue uma **experiência digital cinematográfica de engenharia**.

Quero vento que pareça vento. Quero profundidade que pareça espaço.
Quero movimento com peso e intenção. Quero silêncio onde silêncio
melhora a composição. Quero projetos apresentados como mundos. Quero que
a primeira dobra seja memorável. Quero que o resultado pareça feito sob
medida para Danilo V. Cardoso.

Se uma ideia segura produzir apenas "bom", procure outra.

Busque o extraordinário --- sem sacrificar engenharia.

------------------------------------------------------------------------

# BASELINE FUNCIONAL E REQUISITOS ANTERIORES

# Redesign do Portfólio --- Direção Cinematográfica inspirada em Ghost of Tsushima

## Missão

Redesenhe e implemente uma nova versão deste portfólio pessoal.

Antes de alterar qualquer arquivo, inspecione completamente o
repositório atual para entender:

-   estrutura de arquivos;
-   HTML, CSS e JavaScript existentes;
-   conteúdo e projetos apresentados;
-   responsividade;
-   navegação;
-   recursos visuais existentes;
-   links e informações de contato;
-   suporte a idiomas, se houver;
-   forma atual de deploy.

Não descarte conteúdo útil sem motivo. Preserve as informações
profissionais importantes, mas tenha liberdade para reconstruir
completamente a apresentação, layout, CSS e interações.

O objetivo não é apenas "modernizar" o site. Quero transformar o
portfólio em uma experiência visual memorável, cinematográfica e
tecnicamente refinada.

------------------------------------------------------------------------

# 1. Conceito visual

A principal referência estética é **Ghost of Tsushima**, especialmente
sua direção de arte e sua maneira de usar:

-   paisagens;
-   vento;
-   folhas e partículas;
-   silêncio visual;
-   espaço negativo;
-   contraste;
-   natureza;
-   movimento ambiental;
-   composição cinematográfica;
-   preto, branco e vermelho;
-   tipografia forte;
-   transições elegantes;
-   profundidade entre planos.

IMPORTANTE:

Não copie assets, personagens, logotipos, interfaces, ilustrações,
screenshots ou propriedade intelectual do jogo.

A inspiração deve vir da **linguagem visual e dos princípios de direção
de arte**, criando uma identidade original para um engenheiro de
software e profissional de cybersecurity.

O resultado deve lembrar a sensação de contemplação, precisão e
movimento de uma obra cinematográfica japonesa, sem parecer um fan site
de Ghost of Tsushima.

------------------------------------------------------------------------

# 2. Identidade

O portfólio pertence a:

**Danilo V. Cardoso**

Posicionamento principal:

**Software Engineer / Full Stack Developer**

Áreas relevantes que já aparecem no projeto devem ser preservadas quando
fizer sentido:

-   Software Engineering
-   Full Stack Development
-   Backend
-   Mobile
-   Cybersecurity
-   Linux
-   APIs
-   Automação
-   IA
-   IoT
-   Arquitetura de sistemas

A personalidade visual deve transmitir:

-   domínio técnico;
-   precisão;
-   independência;
-   serenidade;
-   profundidade;
-   sofisticação;
-   confiança.

Evite estética genérica de "site de programador".

Não quero:

-   fundo cheio de código;
-   Matrix;
-   neon cyberpunk genérico;
-   excesso de gradientes;
-   cards SaaS genéricos;
-   visual de template;
-   dezenas de badges coloridos;
-   animações chamativas sem propósito.

------------------------------------------------------------------------

# 3. Paleta

Use uma paleta contida e cinematográfica.

Base:

-   preto carvão;
-   preto profundo;
-   branco quente / off-white;
-   cinzas naturais.

Acentos:

-   vermelho japonês profundo;
-   ocasionalmente tons naturais muito discretos;
-   verde apenas quando fizer sentido visual.

O vermelho deve ser usado com intenção, não espalhado por toda a
interface.

Imagine:

**tinta preta + papel + névoa + folhas vermelhas + luz natural.**

------------------------------------------------------------------------

# 4. Hero --- primeira impressão

A primeira dobra é a parte mais importante do site.

Ela deve ocupar aproximadamente a viewport inteira e parecer uma
composição cinematográfica.

Elementos:

### Nome

`Danilo V. Cardoso`

### Headline

Algo próximo de:

`Software Engineer` `Full Stack Developer`

Não é obrigatório manter exatamente a quebra ou composição atual.
Escolha a solução tipográfica mais forte.

### Texto secundário

Uma frase curta explicando que projeto e construo sistemas completos, do
backend à experiência final.

Evite parágrafos grandes no hero.

### CTA

Dois caminhos claros:

-   Ver projetos
-   Entrar em contato

Mas os botões não devem parecer botões SaaS tradicionais. Integre-os à
linguagem visual.

------------------------------------------------------------------------

# 5. Movimento ambiental

O site deve parecer vivo mesmo quando o usuário não está interagindo.

Crie movimento sutil inspirado por vento e natureza.

Possibilidades:

-   folhas abstratas atravessando lentamente a tela;
-   partículas leves;
-   névoa;
-   grãos;
-   linhas ou vegetação abstrata reagindo ao vento;
-   pequenos deslocamentos de camadas;
-   elementos reagindo suavemente ao cursor;
-   parallax moderado;
-   movimento lento de background.

As partículas devem ser originais e abstratas.

Não use assets protegidos do jogo.

O movimento precisa permanecer elegante.

Regra:

> se uma animação chama mais atenção que o conteúdo, provavelmente está
> exagerada.

------------------------------------------------------------------------

# 6. Sensação de profundidade

Crie diferentes planos visuais.

Exemplo conceitual:

foreground ↓ folhas / elementos ambientais

middle ground ↓ conteúdo

background ↓ paisagem abstrata / textura / luz / névoa

O scroll deve produzir uma sensação leve de câmera atravessando esses
planos.

Evite parallax agressivo ou que prejudique leitura.

------------------------------------------------------------------------

# 7. Scroll cinematográfico

O scroll deve fazer parte da narrativa.

Utilize quando apropriado:

-   reveal de texto;
-   fade;
-   máscaras;
-   deslocamento;
-   mudanças graduais de contraste;
-   parallax;
-   elementos entrando de direções diferentes;
-   linhas sendo desenhadas;
-   números aparecendo;
-   imagens ou painéis sendo revelados.

Não transforme tudo em animação.

O usuário deve conseguir rolar rapidamente sem esperar animações
terminarem.

------------------------------------------------------------------------

# 8. Projetos

Os projetos são a principal prova técnica do portfólio.

Não apresente todos simplesmente como uma grade de cards iguais.

Quero uma apresentação mais editorial/cinematográfica.

Cada projeto importante pode funcionar como um pequeno capítulo.

Use:

-   número do projeto;
-   título grande;
-   categoria;
-   descrição curta;
-   tecnologias;
-   contribuição;
-   desafio;
-   resultado;
-   link para detalhes quando existente.

Os projetos já existentes no repositório devem ser analisados antes de
qualquer alteração.

Preserve o conteúdo relevante.

Dê destaque especial aos projetos tecnicamente mais fortes.

------------------------------------------------------------------------

# 9. Transição entre projetos

Considere uma composição alternada:

Projeto 01 texto à esquerda / visual à direita

Projeto 02 visual à esquerda / texto à direita

Projeto 03 composição diferente

Não faça uma repetição mecânica.

Cada seção pode ter identidade própria, mantendo o sistema visual geral.

------------------------------------------------------------------------

# 10. Tipografia

A tipografia é fundamental.

Combine, se tecnicamente adequado:

-   uma fonte display/editorial para grandes títulos;
-   uma sans-serif limpa para interface;
-   uma monoespaçada usada com moderação para detalhes técnicos.

Não transforme todo o site em terminal.

Monospace deve aparecer como detalhe técnico, não como identidade
inteira.

Headlines podem ser grandes e ocupar bastante espaço.

------------------------------------------------------------------------

# 11. Elementos japoneses abstratos

Podem existir referências muito sutis à estética japonesa:

-   linhas verticais;
-   selos abstratos;
-   composição assimétrica;
-   grandes áreas vazias;
-   círculos;
-   pinceladas abstratas feitas em CSS/SVG;
-   divisórias inspiradas em papel/tinta;
-   ritmo editorial.

Não use símbolos japoneses aleatórios apenas como decoração.

Não escreva kanji sem significado.

------------------------------------------------------------------------

# 12. Navegação

A navegação deve ser simples.

Exemplo:

-   Projetos
-   Tecnologias
-   Sobre
-   Contato

Pode permanecer sticky/fixa se funcionar visualmente.

Ao rolar, considere alterar discretamente:

-   opacidade;
-   background;
-   blur;
-   tamanho.

No mobile, crie navegação apropriada e acessível.

------------------------------------------------------------------------

# 13. Seção Sobre

Não faça um currículo gigante.

Construa uma narrativa curta sobre:

-   criação de sistemas;
-   arquitetura;
-   desenvolvimento full stack;
-   resolução de problemas;
-   segurança;
-   curiosidade técnica.

Preserve informações reais existentes no projeto.

Não invente experiência, empresas, números, clientes, certificações ou
resultados.

------------------------------------------------------------------------

# 14. Tecnologias

Evite uma parede de logos.

Organize tecnologias de maneira editorial.

Possíveis grupos:

### Languages

JavaScript TypeScript Python Java C#

### Frontend / Mobile

React React Native

### Backend

Node.js APIs SQL

### Infrastructure

Linux Docker

### Security

Cybersecurity

Use apenas tecnologias realmente presentes no portfólio/repositório ou
claramente declaradas no conteúdo existente.

------------------------------------------------------------------------

# 15. Contato

A seção final deve ser forte visualmente.

Headline possível:

`Vamos construir algo que importe.`

ou outra frase curta e original coerente com o restante do site.

Apresente os meios de contato já existentes no projeto.

Não invente telefone, e-mail ou redes sociais.

------------------------------------------------------------------------

# 16. Microinterações

Adicionar microinterações cuidadosas:

-   links;
-   navegação;
-   CTAs;
-   cards/projetos;
-   cursor, apenas se não prejudicar UX;
-   indicadores de scroll;
-   hover em tecnologias;
-   transições de idioma, se houver.

Todas devem ser rápidas e discretas.

------------------------------------------------------------------------

# 17. Performance

Este requisito é obrigatório.

O site será hospedado em uma VPS relativamente pequena.

Priorize:

-   HTML/CSS/JS enxuto;
-   animações usando `transform` e `opacity`;
-   evitar bibliotecas enormes;
-   evitar dependências desnecessárias;
-   lazy loading;
-   imagens otimizadas;
-   SVG/CSS para efeitos simples;
-   evitar vídeos pesados como background;
-   evitar WebGL se não houver benefício substancial.

Se uma experiência semelhante puder ser feita em CSS/JS puro, prefira
isso.

------------------------------------------------------------------------

# 18. Progressive enhancement

O site precisa continuar utilizável se:

-   JavaScript demorar;
-   animações forem desabilitadas;
-   dispositivo for lento;
-   usuário ativar `prefers-reduced-motion`.

Implemente:

``` css
@media (prefers-reduced-motion: reduce)
```

Reduza ou remova animações não essenciais.

------------------------------------------------------------------------

# 19. Responsividade

Desktop é importante, mas mobile não pode ser uma versão quebrada.

Teste mentalmente e implemente layouts para:

-   320px;
-   375px;
-   768px;
-   notebook;
-   desktop grande.

Headlines gigantes precisam se adaptar corretamente.

Evite overflow horizontal.

------------------------------------------------------------------------

# 20. Acessibilidade

Preserve:

-   HTML semântico;
-   navegação por teclado;
-   foco visível;
-   contraste suficiente;
-   `aria-label` quando necessário;
-   textos alternativos;
-   estrutura correta de headings.

Movimento não pode prejudicar acessibilidade.

------------------------------------------------------------------------

# 21. SEO e metadata

Revise:

-   `<title>`;
-   meta description;
-   canonical;
-   Open Graph;
-   favicon;
-   idioma;
-   headings;
-   metadata social.

O domínio de produção é:

`https://danilovcardoso.com.br`

Não invente conteúdo pessoal para metadata.

------------------------------------------------------------------------

# 22. Deploy

O projeto é publicado através de:

GitHub → Coolify → Docker/nginx → VPS → `https://danilovcardoso.com.br`

O site atual funciona como site estático.

Evite transformar o projeto em uma aplicação pesada sem necessidade.

Se a arquitetura atual permitir alcançar o resultado com
HTML/CSS/JavaScript puro, mantenha essa simplicidade.

------------------------------------------------------------------------

# 23. Processo obrigatório

Antes de programar:

1.  Leia todos os arquivos relevantes.
2.  Entenda a implementação atual.
3.  Identifique conteúdo que precisa ser preservado.
4.  Identifique problemas de UX e responsividade.
5.  Crie mentalmente um sistema visual consistente.
6.  Só então altere os arquivos.

Durante a implementação:

1.  Trabalhe diretamente sobre o projeto existente.
2.  Prefira mudanças coesas a patches isolados.
3.  Remova CSS/JS morto quando seguro.
4.  Não deixe componentes ou estilos antigos conflitantes.
5.  Não deixe TODOs como substituto de implementação.
6.  Não quebre links existentes sem necessidade.
7.  Não introduza segredos ou credenciais.
8.  Não altere infraestrutura/deploy sem necessidade.

------------------------------------------------------------------------

# 24. Verificação obrigatória

Ao terminar:

-   valide HTML;
-   verifique erros JavaScript;
-   verifique console;
-   teste navegação;
-   teste links;
-   teste responsividade;
-   teste reduced motion;
-   confira overflow;
-   confira contraste;
-   confira assets ausentes;
-   confira caminhos relativos;
-   confirme que `index.html` continua acessível na raiz publicada;
-   confirme que o projeto pode continuar sendo servido como site
    estático.

Se houver ferramentas de teste disponíveis no ambiente, utilize-as.

------------------------------------------------------------------------

# 25. Liberdade criativa

Você tem liberdade para redesenhar substancialmente o portfólio.

Não trate o layout atual como algo que precisa ser preservado.

Preserve **conteúdo verdadeiro e identidade profissional**, não
necessariamente a interface atual.

Se durante a inspeção encontrar uma solução visual melhor do que a
sugerida neste documento, implemente-a desde que respeite os princípios:

**cinematográfico** **minimalista** **orgânico** **profissional**
**memorável** **rápido** **original**

------------------------------------------------------------------------

# Resultado esperado

Quando alguém abrir `danilovcardoso.com.br`, não quero que a reação
seja:

> "É um portfólio de desenvolvedor."

Quero que primeiro exista impacto visual e curiosidade, e só então fique
evidente a profundidade técnica.

A experiência deve comunicar que existe alguém que se importa tanto com
engenharia quanto com apresentação.

A referência emocional é a sensação de vento, silêncio, paisagem e
precisão cinematográfica associada a Ghost of Tsushima.

A execução, porém, deve ser completamente original e apropriada a um
portfólio profissional.

------------------------------------------------------------------------

## Entrega

Implemente o redesign no próprio repositório.

Ao finalizar, apresente um resumo objetivo contendo:

1.  arquivos alterados;
2.  decisões principais de design;
3.  animações/interações implementadas;
4.  otimizações de performance;
5.  melhorias de acessibilidade;
6.  como testar localmente;
7.  qualquer ponto que ainda mereça revisão manual.

Não pare apenas em uma proposta ou mockup.

**Implemente a versão funcional completa.**
