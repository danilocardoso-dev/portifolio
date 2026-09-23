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
- `assets/scenes/`: paisagens, árvore, grain e posters vetoriais originais.
- `assets/motion/leaf-flight.svg`: sprite original de 16 frames, reproduzido pelo relógio central, não uma animação autônoma.
- `scripts/generate-scenes.js`: geração determinística dos SVGs, sem dependências.
- `scripts/generate-motion-v2.js`: regeneração determinística do sprite de voo/dobra da folha.
- `scripts/verify-static.js`: verifica páginas, links, assets, idioma e metadata.
- `scripts/verify-motion.js`: verifica o ciclo de vida do scheduler em um ambiente simulado.
- `scripts/serve.js`: servidor local sem dependências.

## Executar localmente

Sirva a raiz com o servidor local incluído:

```bash
node scripts/serve.js
```

Abra `http://127.0.0.1:4173/`. A porta pode ser informada como argumento (`node scripts/serve.js 8080`). Também é possível abrir `index.html` diretamente; o servidor reproduz melhor a publicação.

Para regenerar os assets e conferir a integridade:

```bash
node scripts/generate-scenes.js
node scripts/generate-motion-v2.js
node scripts/verify-static.js
node scripts/verify-motion.js
node --check js/main.js
node --check js/journey.js
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

## Publicação

O projeto não possui etapa de build. `index.html` deve continuar acessível na raiz publicada pelo fluxo GitHub → Coolify → Docker/nginx → VPS.

Sirva HTML, CSS, JS e SVG com os MIME types usuais. Não existe roteador client-side, API ou build. O script `serve.js` é somente para desenvolvimento local; a publicação continua pelo nginx existente.
