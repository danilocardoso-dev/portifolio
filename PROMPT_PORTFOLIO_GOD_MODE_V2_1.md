# GOD MODE V2.1 --- CINEMATIC POLISH + ART DIRECTION PASS

Trabalhe sobre a versão ATUAL do repositório. Não reconstrua cegamente o
site e não reverta as conquistas da V2. A V2 já possui `js/journey.js`,
`css/journey.css`, cenário persistente, morphs MapCloud → Atlas3D →
Azriel, câmera, foreground, vento, Canvas/SVG, PT/EN, reduced motion,
cases e verificadores.

Objetivos desta rodada: **(1) tornar as transições muito mais suaves,
orgânicas e cinematográficas; (2) elevar novamente a direção de arte e o
acabamento visual do site inteiro.** Preserve o que funciona. Refine
agressivamente tudo que ainda denuncia "website", "morph matemático" ou
"demo procedural de desenvolvedor".

## 1. EXECUTE E ASSISTA AO SITE

Não avalie apenas lendo código. Rode o servidor local, abra a home em
navegador e percorra tudo lentamente, rapidamente e no sentido inverso.
Teste desktop, 375--430 px e reduced motion. Observe MapCloud → Atlas3D
→ Azriel. Anote internamente saltos, snaps, acelerações artificiais,
mudanças bruscas de opacidade, transforms mecânicos, sections aparentes
e elementos que surgem/desaparecem cedo demais. Depois das alterações,
repita a inspeção visual. Não finalize baseado apenas em testes
estáticos.

## 2. FOCO TÉCNICO JÁ IDENTIFICADO

Inspecione especialmente `js/journey.js`, `resolve(...)`, `smooth(...)`,
`range(...)`, cálculo de `pose`, anchors `[data-scene]`,
`director.scroll(...)` em `js/main.js`, `.project-chapter` e
`min-height:150svh` em `css/journey.css`. A implementação atual usa
anchors e interpolação suave entre poses. Isso pode ser matematicamente
contínuo e ainda parecer visualmente mecânico. NÃO faça apenas trocar um
easing por outro; reavalie o modelo.

## 3. TARGET PROGRESS ≠ VISUAL PROGRESS

O scroll define um target state. Câmera e mundo devem possuir estado
visual amortecido. Implemente conceito equivalente a
`visual += (target - visual) * damping`, baseado em delta-time e
frame-rate independent. Deve responder bem a scroll rápido e reverso,
convergir sem lag excessivo e sem overshoot desagradável. Snap imediato
apenas em inicialização/resize quando necessário. Reduced motion deve
reduzir/eliminar amortecimento. A sensação: **o usuário move o scroll; a
câmera/mundo acompanha com massa controlada**.

## 4. OVERLAP ENTRE MUNDOS

Prioridade máxima. Evite `A → morph → B`. Quero
`A domina → B nasce dentro de A → coexistência → B domina → vestígios de A somem`.

**MapCloud → Atlas3D:** rotas ganham profundidade antes de sumir; nós se
reposicionam; linhas inclinam; perspectiva nasce enquanto cartografia
ainda é reconhecível. Atlas nasce DO mapa.

**Atlas3D → Azriel:** vértices viram nós; arestas começam a pulsar;
faces perdem presença; sinais surgem nas arestas existentes. Azriel
nasce DO Atlas.

Não use fade como mecanismo principal.

## 5. TRANSIÇÕES ASSIMÉTRICAS

Não governe tudo pela mesma curva. Crie timings independentes para
câmera, environment, mundo anterior, mundo seguinte, tipografia,
foreground, fog, lighting, accent e labels. Névoa pode começar antes;
texto sair depois; geometria nascer no meio; iluminação viajar
lentamente. Ajuste assistindo ao resultado. Evite coreografia
sincronizada demais.

## 6. CONTINUIDADE DE VELOCIDADE E IDENTIDADE

Objetos importantes não podem parar instantaneamente, inverter sem
desacelerar ou mudar escala linearmente. Quando uma rota vira aresta,
preserve trajetória perceptiva. Quando vértice vira nó, deve parecer o
MESMO objeto mudando de função, não dois objetos em crossfade.

## 7. CÂMERA COM MASSA

Separe posição/scale target de posição/scale visual. Componha
`baseScene + scrollTravel + pointerOffset + environmentalDrift`, cada
parcela limitada e amortecida. Pointer e scroll não competem. Evite
sensação de "site seguindo o mouse".

## 8. FOREGROUND E NÉVOA COMO MONTAGEM

Use poucos elementos de foreground para esconder/revelar transformações
complexas: folha, galho, fragmento, névoa ou geometria cruzando
parcialmente a câmera. Trajetória coerente com vento/câmera.

Névoa deve revelar, ocultar, reduzir contraste durante morph, unir
mundos e alterar profundidade. Trabalhe posição, escala, blur e
distribuição --- não apenas opacity.

## 9. REMOVER SENSAÇÃO DE TRIGGER

Revise anchors e `min-height:150svh`. Não é obrigatório removê-los, mas
o visitante não pode perceber "cheguei aqui e começou outra animação".
Considere overlap de anchors, pre-roll/post-roll, progresso contínuo e
cenas coexistentes. Não crie espaço vazio só para acomodar animação.

## 10. SCROLL RÁPIDO E REVERSO

Teste wheel/trackpad rápido, scrollbar, Page Down e reversão no meio do
morph. A composição nunca quebra. Se o usuário atravessar cenas
rapidamente, converja elegantemente para o novo target; não reproduza
uma fila atrasada de animações intermediárias.

## 11. NOVA PASSADA DE DIREÇÃO DE ARTE

Depois de corrigir motion, avalie o site inteiro perguntando: **o que
ainda impede isso de parecer uma experiência digital excepcional?**
Refine composição, hierarquia, escala, espaço negativo, iluminação,
textura, profundidade, tipografia, contraste, proporção, ritmo, CTAs,
foreground, paisagem e motion assets. Não mude por mudar; cada alteração
precisa elevar impacto/coerência/acabamento.

## 12. HERO MAIS ICÔNICO

A primeira dobra deve ser a imagem mais memorável. Avalie ponto focal,
disco/luz, silhueta da paisagem, névoa, foreground, relação
nome/horizonte, escala tipográfica e profundidade. Uma ocorrência
vermelha altamente controlada pode guiar o olho. A composição deve
funcionar perfeitamente em screenshot estático; o motion a torna viva.

## 13. EVITAR PROCEDURAL DEV ART

Procure pontos igualmente distribuídos, linhas uniformes, grids óbvios,
partículas genéricas, wireframes sem composição e pulsos previsíveis.
Introduza assimetria, densidade variável, regiões de silêncio,
hierarquia, imperfeição, focal points, clusters, escala, occlusion e
profundidade.

## 14. MAPCLOUD --- ELEVAR

Deve parecer cartografia cinematográfica, não network visualization.
Refine topografia, rotas principais/secundárias, densidade desigual,
sinais, labels mínimos, profundidade, luz e timing de pulsos. Crie uma
rota/elemento focal. O olho precisa saber onde olhar.

## 15. ATLAS3D --- ELEVAR

Deve ter presença escultórica. Refine perspectiva, escala, line weight
por profundidade, ocultação, rotação, iluminação, clipping e
coordenadas. Evite wireframe screensaver. Crie silêncio ao redor do
objeto.

## 16. AZRIEL --- ELEVAR

Deve parecer sistema vivo, não clichê de neural network. Refine
clusters, caminhos dominantes, respiração, pulsos, regiões inativas e
propagação. Nem todos os nós se comportam igual. Crie hierarquia de
sinais.

## 17. TIPOGRAFIA EDITORIAL E TRANSIÇÕES DE TEXTO

Revise cada headline: escala, espaço vazio, alinhamento, interação com
cenário, tracking/leading e labels. Integre texto à composição. Nas
transições, evite apenas opacity; combine sutilmente translate,
clip/mask, spacing, blur mínimo e depth. O próximo título pode começar
antes do anterior sumir totalmente, mantendo hierarquia.

## 18. ILUMINAÇÃO CONTÍNUA

Crie curva de iluminação ao longo da jornada: Hero natural/horizonte;
MapCloud analítico sem cyberpunk; Atlas escuro e escultórico; Azriel
vivo; Craft/About abrindo novamente; Final atmosférico. Não faça
mudanças bruscas de background. A luz deve viajar.

## 19. VERMELHO COMO EVENTO

Audite o vermelho. Se estiver demais, reduza. Escolha momentos: folha,
pulso, selo, número, nó ou linha crítica. O vermelho guia o olho; não é
decoração permanente.

## 20. MICRODETALHES, NAV E FINAL

Refine hover/focus, indicadores, scroll progress, navegação, pointer
response, labels, idioma e CTAs com timing coerente. A navegação deve
pertencer à experiência sem perder usabilidade. O final merece o mesmo
cuidado do hero: desacelere, retorne visualmente à origem/natureza e
crie fechamento; não termine em footer genérico.

## 21. CASES

Faça passada visual nos três cases. Não precisam ter a complexidade da
home, mas devem herdar lighting, typography, motion language, smooth
transitions e identidade individual. Evite "entrei no projeto e voltei
para um site normal".

## 22. PERFORMANCE

Suavidade perceptiva exige FPS. Use requestAnimationFrame + delta-time +
clamp; pause Canvas fora da viewport e em `document.hidden`; limite DPR;
evite allocations excessivas por frame e layout reads/writes
intercalados; evite filtros caros em elementos enormes durante scroll;
adapte qualidade e deixe mobile mais leve. Se uma transição bonita roda
mal, ela não está pronta.

## 23. REDUCED MOTION E MOBILE

Preserve reduced motion: sem inertia longa; transições mínimas;
composição estática forte. Em mobile, não replique damping desktop
cegamente. Touch scroll tem dinâmica diferente. Reduza layers e garanta
que sticky/morph nunca faça a página parecer presa. Teste
320/375/430/768.

## 24. NÃO RECONSTRUIR O QUE FUNCIONA

Esta rodada é POLISH. Antes de reescrever algo, pergunte se o problema é
estrutural ou apenas timing/composição. Prefira corrigir a causa.
Preserve PT/EN, SEO, acessibilidade, canonical e deploy estático GitHub
→ Coolify → nginx → VPS. Não invente clientes, métricas, certificações,
resultados ou tecnologias.

## 25. PROCESSO OBRIGATÓRIO

1.  Baseline visual: execute e assista.
2.  Motion audit: identifique pontos bruscos.
3.  Engine: corrija progress/damping/overlap/timing.
4.  Transitions: MapCloud → Atlas → Azriel.
5.  Art direction: passada estética completa.
6.  Mobile/reduced motion.
7.  Performance.
8.  Visual QA do começo ao fim.
9.  Segunda passada corrigindo tudo que ainda pareça mecânico.

Só então finalize.

## 26. CRITÉRIOS DE SUCESSO

**Transições:** deve ser difícil apontar exatamente onde MapCloud
terminou e Atlas começou. O visitante percebe a mudança, mas não o
mecanismo.

**Estética:** parado em qualquer cena principal, o site deve produzir
composição digna de screenshot. Hero, MapCloud, Atlas e Azriel têm
identidades próprias; em movimento, são capítulos da mesma obra.

## 27. CRITÉRIO DE REJEIÇÃO

Continue trabalhando se: morph parece crossfade; cena parece trigger;
câmera segue scroll diretamente; elementos começam/param abruptamente;
tudo usa mesmo easing; mundo anterior some antes do próximo nascer;
reversão quebra; scroll rápido quebra; mobile engasga; cena parece demo
de Canvas; estética volta a landing page; hero supera muito o resto;
cases parecem outro site; composição só funciona em movimento.

## 28. ENTREGA

Implemente no repositório e informe: problemas encontrados; mudanças no
motor de progress/câmera; damping/inertia; overlaps; timings
desacoplados; melhorias de direção de arte; melhorias específicas em
Hero/MapCloud/Atlas/Azriel; mobile/reduced motion; performance; arquivos
alterados; como testar; pontos que merecem revisão humana.

# MANDATO FINAL

A V2 encontrou a direção. Agora remova o que ainda parece mecânico.

Não quero mais efeitos por quantidade. Quero efeitos melhores.

Não quero mais velocidade. Quero peso.

Não quero crossfade. Quero transformação.

Não quero sections conectadas. Quero continuidade.

Não quero que a matemática da interpolação fique visível. Quero que o
cérebro aceite naturalmente que um mundo se transformou no outro.

**Faça a experiência respirar. Depois faça-a inesquecível.**
