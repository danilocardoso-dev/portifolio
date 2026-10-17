# Danilo V. Cardoso — cinematic portfolio

Portfólio estático de Danilo V. Cardoso: Software Engineering, Full Stack Development e Cybersecurity. A V2.1 refina a narrativa contínua de natureza → cartografia → geometria → sinal → natureza, acompanhando o scroll nativo com câmera amortecida.

## Estrutura

- `index.html`: página principal bilíngue.
- `projects/`: cases MapCloud, Atlas3D e Azriel.
- `css/styles.css`: base compartilhada, composição estática e controles acessíveis.
- `css/journey.css`: direção da narrativa contínua, mobile e abertura V2.
- `css/cases.css`: direção artística e leitura dos três cases.
- `js/main.js`: idioma, navegação, abertura e scheduler único de movimento.
- `js/journey.js`: palco persistente, projeção 3D, transformação dos mesmos vértices entre mundos e foreground.
- `js/bridge.js`: ponte reversível rede → cartografia no fechamento do case Azriel, dirigida pelo mesmo scheduler.
- `assets/scenes/`: paisagens, árvore, grain e posters vetoriais originais.
- `assets/motion/leaf-flight.svg`: sprite original de 16 frames, reproduzido pelo relógio central, não uma animação autônoma.
- `scripts/generate-scenes.js`: geração determinística dos SVGs, sem dependências.
- `scripts/generate-motion-v2.js`: regeneração determinística do sprite de voo/dobra da folha.
- `scripts/verify-static.js`: verifica páginas, links, assets, idioma e metadata.
- `scripts/verify-motion.js`: verifica o ciclo de vida do scheduler em um ambiente simulado.
- `scripts/verify-seo.js`: metadata, schemas, sitemap/robots e verificação HTTP opcional.
- `404.html`, `robots.txt`, `sitemap.xml`: erro real e descoberta das quatro URLs públicas.
- `SEO_SETUP.md`: auditoria, publicação nginx/Coolify e passos manuais do Search Console.
- `scripts/serve.js`: servidor local sem dependências.

## Executar localmente

Sirva a raiz com o servidor local incluído:

```bash
node scripts/serve.js
```

Abra `http://127.0.0.1:4173/`. A porta pode ser informada como argumento (`node scripts/serve.js 8080`). Use HTTP local para testar navegação canônica, assets da 404 e status de publicação; abrir HTML diretamente pelo sistema de arquivos não reproduz esses comportamentos.

Para regenerar os assets e conferir a integridade:

```bash
node scripts/generate-scenes.js
node scripts/generate-motion-v2.js
node scripts/verify-static.js
node scripts/verify-motion.js
node scripts/verify-seo.js --self-test
node --check js/main.js
node --check js/journey.js
node --check js/bridge.js
```

## Movimento e performance

O palco da home permanece fixo enquanto o conteúdo semântico percorre o espaço. As posições dos capítulos são medidas após resize, fontes e troca de idioma; não há scroll-jacking, wheel handler ou duração obrigatória por cena. Os mesmos IDs de vértices e arestas se transformam de terreno/cartografia em superfície 3D e constelação de sinal. As transições não são uma troca de Canvas por fade. A direção de câmera varia com a cena e é recomposta em telas menores.

Na V2.1, `resolve` usa focos de conteúdo com interpolação cúbica monotônica, sem os antigos patamares que comprimiam cada morph em 60vh. Scroll atualiza somente `targetPose`. Mundo, câmera e iluminação possuem estado e velocidade próprios, integrados por solução exata de mola criticamente amortecida, com delta limitado a 50 ms. Taxas desktop: 16/13/10 s⁻¹; mobile: 22/20/17 s⁻¹. Não há fila de transições. Pausar preserva o último frame; um novo scroll pausado recompõe a cena sem avançar o tempo. Reduced motion elimina a inércia. Inicialização e resize podem alinhar os estados imediatamente.

Dobras e dispersão recebem pequenos offsets estáveis por vértice. A perspectiva nasce antes da geometria se fechar; os sinais começam nas arestas antes da dispersão. Rotas, anéis, labels, pele escultórica, luz, vinheta e névoa têm envelopes distintos. A cartografia possui uma elevação assimétrica, curvas de densidade variável e uma rota focal; o Atlas usa pele escura e peso de linha por profundidade; Azriel possui três regiões desiguais, nós hierárquicos e zonas de baixa atividade. A névoa desloca e altera escala com texturas de 128 × 128 reutilizadas. Buffers de projeção e grupos de arestas também são reutilizados.

O hero combina luz, três terrenos, névoa e árvore. Um estado de vento compartilhado inclui direção, intensidade por cena e rajadas do pointer. Ele conduz vegetação, névoa, partículas e o sprite de uma folha próxima à câmera. O movimento desse sprite é controlado: pausa, aba oculta e reduced motion não deixam uma mídia animada independente rodando. Seu carregamento só começa no primeiro desenho. Posters abaixo da dobra usam lazy loading; as geometrias são locais, sem downloads de modelos.

Um único `requestAnimationFrame` coordena as superfícies visíveis. Canvas dos cases param fora da viewport. O palco persistente da home só mantém frames nas cenas com movimento: Craft e About entram em repouso real. Todos param com aba oculta, pausa manual ou movimento reduzido. DPR máximo: 1,25 no mobile e 1,5 no desktop. A malha usa 384 vértices no mobile e 704 no desktop; sob carga, o render reduz amostragem. Pausar congela o tempo, mas navegar por scroll ainda recompõe a cena correta em um único desenho. Reduced motion usa mundos estáticos, câmera neutra e nenhuma abertura. Sem JavaScript/Canvas, paisagem, posters, conteúdo e navegação continuam disponíveis.

A abertura dura aproximadamente 2,8 segundos, aparece uma vez por sessão e pode ser pulada. Scroll, navegação, foco de teclado e CTAs continuam disponíveis e encerram a abertura. Idioma e escolha de movimento são persistidos localmente quando o navegador permite. Métricas profissionais são exibidas diretamente, sem contagens intermediárias fictícias.

Não há bibliotecas, fontes remotas, áudio ou vídeo. O motion asset é um sprite de aproximadamente 27 KB, evitando download e decodificação contínua de vídeo para um efeito que responde ao vento e ao scroll. Os três GIFs antigos, não referenciados pelas páginas, foram removidos (cerca de 775 KB). O gerador histórico `scripts/generate-motion-gifs.js` foi preservado e permite recriá-los se necessário; não faz parte do fluxo atual.

## Revisão visual

Conferir home e três cases em 320, 375, 430, 768 px e desktop, nos dois idiomas. Navegar com Tab/Enter/Escape, testar o menu mobile, pausar movimento e alterar `prefers-reduced-motion`. Sem JavaScript, conteúdo, posters e navegação devem continuar visíveis. Em DevTools, verificar ausência de erros/404 e confirmar que a animação para ao mudar de aba.

`verify-motion.js` usa um ambiente simulado, não um navegador: verifica RAF único, lifecycle, pausa + scroll, mundos estáticos, continuidade/reversibilidade da malha, DPR/densidade mobile, idioma e falha de Canvas. `verify-static.js` complementa isso com caminhos, sprite, fragments, PT/EN e metadata; não substitui renderização, teste de contraste ou Safari/Android reais.

A suíte V2.1 acrescenta equivalência em 30/60/120 Hz, separação target/visual, salto monotônico, reversão durante aproximação, salto Hero → Contact sem backlog, congelamento ao pausar, retomada com delta limitado, resize e resposta mobile mais curta. Craft/About só suspendem o RAF depois de a composição convergir.

Para avaliar o peso da câmera, percorra MapCloud → Atlas → Azriel lentamente; inverta no meio da dobra; repita com wheel rápido, Page Down e arrastando a barra de rolagem. Confira também a pausa durante o movimento e a volta ao contato. Os cases compartilham a direção visual, mas mantêm cenas locais mais leves e leitura convencional. As proporções e o conforto da inércia merecem revisão humana em trackpad e aparelho físico.

## Acabamento cinematográfico — transições e frame pacing

Esta rodada preserva a identidade V2.1, conteúdo, PT/EN, SEO e publicação estática. Não altera a ordem nem reconstrói os projetos.

- **Causa inicial:** a opacidade comum da paisagem era multiplicada por duas saídas curtas, encerrando todas as camadas perto do foco do MapCloud. Agora luz, sol, montanhas, galhos e névoa têm envelopes próprios. A exposição cai primeiro; silhuetas próximas sobrevivem durante o mapa. O plano comum só termina entre os estados 1,08 e 1,78, depois do foco cartográfico (1).
- **Causa final:** no case Azriel, a rede terminava com o corpo do case e entrava um SVG independente sobre um gradiente que já atingia papel em 36% da seção. Agora uma camada decorativa se estende 300 px antes do CTA (180 px no mobile); as mesmas polilinhas se abrem em contornos e rotas. O papel permanece no rodapé, sem outro corte para preto. O poster original continua sendo o fallback sem Canvas.
- **Damping:** mantidas as taxas independentes da home. A ponte usa `1 - exp(-lambda * dt)`, com taxas geometria/luz 18/15 s⁻¹ no desktop e 24/21 no mobile. O texto e o scroll não esperam a animação. Pausa preserva a aproximação; scroll pausado recompõe uma vez; reduced elimina inércia e usa cartografia estática.
- **Pontes visuais:** silhuetas, névoa e matéria do hero; nós e linhas persistentes na saída do Azriel. Não há troca entre dois posters animados. Geometria, tinta, exposição e pulsos têm tempos diferentes. O contato reduz o relógio ambiental a 18%, a presença da folha próxima e a quantidade aparente de matéria.
- **Custo:** pontos, texturas e buffers da ponte são preparados somente perto da viewport, reutilizados e suspensos fora da tela, em aba oculta e no encerramento estabilizado. A home reutiliza referências de rotas/triângulos e chaves numéricas de traço, removendo alocações e cálculos repetidos no trecho medido. Sem novos filtros grandes, dependências ou mídia externa; DPR continua limitado.
- **Micro-polish:** contraste atrás dos links do contato, contraste/folga do rodapé claro e recorte horizontal dos quadros decorativos. Paleta e tipografia mantidas.

### Validação e limites

`node scripts/verify-static.js` verifica quatro páginas, 196 pares PT/EN e três módulos JS. `node scripts/verify-motion.js` também cobre a ponte: pre-roll, preparação tardia, linhas reversíveis, pausa + scroll, repouso final, reduced, falha de Canvas, mobile e equivalência 30/60/120 Hz. Esses testes são determinísticos; não medem FPS real.

Inspeção em Chrome local: percurso lento, saltos rápidos e retorno na home; ida/volta do fechamento do Azriel; menu mobile, PT/EN, pausa e fallback de Canvas. Foram inspecionadas larguras 320, 375, 390, 430, 768 e 1366 px. Reduced foi exercitado por fixture local com media query/CSS equivalentes, sem mudar a preferência do sistema.

A instrumentação temporária mediu callbacks JS e desenhos, não FPS/GPU. Em uma amostra da saída do hero (1366 × 900, 83 callbacks), média de 5,34 ms, p95 de 11,2 ms e máximo de 19,7 ms; render médio de 4,00 ms. Na ponte, uma janela de 180 callbacks teve média de 2,03 ms, p95 de 8 ms e render médio de 0,85 ms. Não são benchmarks A/B comparáveis.

Houve picos isolados de tarefas e intervalos longos durante a sessão automatizada. A investigação de long animation frames também encontrou esperas de aproximadamente 1 s com `blockingDuration: 0` e sem scripts caros, portanto esses intervalos não permitem atribuir queda de FPS ao Canvas. Uma repetição da transição inicial não registrou long tasks; isso não garante ausência em outros dispositivos. Não foi obtido trace GPU do DevTools. Conforto em trackpad físico, touch real, Safari/Android e FPS sustentado continuam como validação manual, não como aprovação inferida.

Para repetir: execute o servidor e os dois verificadores; percorra home → MapCloud → Atlas → Azriel → contato com wheel lento/rápido, Page Down e reversão. Abra `projects/azriel.html#expansion`, atravesse o CTA MapCloud e volte. Pause no meio, role pausado, retome e ative reduced motion no sistema. Confira também Canvas indisponível, links do rodapé e ausência de barra horizontal. A publicação continua separada desta validação local.

## Publicação

O projeto não possui etapa de build. A raiz é a fonte oficial e `index.html` deve continuar acessível diretamente no fluxo GitHub → Coolify → Docker/nginx → VPS.

Sirva HTML, CSS, JS, SVG, PNG, XML e TXT com os MIME types usuais. Não existe roteador client-side, API ou build. O script `serve.js` é somente para desenvolvimento local; a publicação continua pelo nginx existente.

A pasta `dist/` é um espelho compatível com o OpenAI Sites e não deve ser editada diretamente. Depois de alterar a raiz, execute `node scripts/sync-sites-dist.js` para atualizar o espelho. Valide as duas saídas com `node scripts/verify-static.js` e `node scripts/verify-sites.js` antes do commit.

Consulte [SEO_SETUP.md](SEO_SETUP.md) antes de publicar: configurar a 404 com status HTTP correto, redirects canônicos, MIME, arquivos públicos e Search Console. A presença dos arquivos no checkout não altera automaticamente o proxy/nginx nem registra o domínio no Google.
