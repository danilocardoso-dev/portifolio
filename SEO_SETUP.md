# SEO — configuração e publicação

A implementação é estática e permanece no fluxo **GitHub → Coolify → Docker/nginx → VPS**. Não há build, analytics, conta externa ou nova dependência de runtime. Este guia não significa que as mudanças foram publicadas.

## 1. Auditoria e decisões

A home e os três cases já tinham conteúdo profissional no HTML inicial, um H1, landmarks, skip links, texto PT/EN, imagens decorativas corretamente sem descrição e canonicals oficiais. Não foi necessário reescrever o conteúdo nem alterar headings, tipografia, cenas ou motion.

Lacunas corrigidas no código:

- Ausência de robots.txt, sitemap, JSON-LD e página 404 própria.
- Titles dos cases pouco descritivos e metadata social incompleta.
- Arte social apenas em SVG: mantida a fonte e exportado PNG para compartilhamento.
- Retorno dos cases pelo alias /index.html: agora usa ../, que resolve para /.
- Três CTAs visualmente iguais: agora têm nomes acessíveis específicos por projeto.
- Verificadores sem cobertura de sitemap/robots/schema, metadata duplicada e 404.

Consulta pública somente leitura em **23/09/2026**, anterior ao deploy desta rodada:

| Recurso | Resposta observada |
| --- | --- |
| HTTPS / | 200; nginx; sem X-Robots-Tag bloqueador |
| HTTPS /projects/mapcloud.html | 200 |
| /robots.txt e /sitemap.xml | 404 |
| Caminho inexistente | 404 padrão nginx |
| HTTP / | 307 para HTTPS |
| HTTPS /index.html | 200, alias da home |
| HTTPS www.danilovcardoso.com.br/ | 200, alias da home |

São observações desse momento, não validação pós-deploy. Canonical ajuda a indicar preferência, mas não substitui configurar corretamente os aliases na infraestrutura. Não foram alterados DNS, proxy, nginx ou Coolify.

## 2. URLs, metadata e cases

A URL oficial da home é https://danilovcardoso.com.br/ (sem www). Os cases mantêm seus caminhos .html, sem barra final:

| Página | Title inicial PT |
| --- | --- |
| / | Danilo V. Cardoso — Software Engineer & Full Stack Developer |
| /projects/mapcloud.html | MapCloud — Plataforma offline-first \| Danilo V. Cardoso |
| /projects/atlas3d.html | Atlas3D — Visualização 3D em C# e .NET \| Danilo V. Cardoso |
| /projects/azriel.html | Azriel — IA local e automação \| Danilo V. Cardoso |

As descriptions existentes foram preservadas: são únicas, factuais e descrevem cada projeto. Backend, APIs, Linux, Docker, automação e cybersecurity já têm contexto no conteúdo profissional; não foram adicionadas listas artificiais de palavras-chave.

Cada página tem canonical próprio, og:url correspondente, título/descrição OG e Twitter, locale, nome do site e imagem absoluta. Textos novos usam os hooks PT/EN existentes. Os H1 continuam “Software Engineer.”, “MapCloud”, “Atlas3D” e “Azriel”; o nome do profissional já está no texto inicial. A home liga aos três cases, e o ciclo MapCloud → Atlas3D → Azriel → MapCloud foi mantido.

A arte social é **assets/social-card.png**, 1200 × 630, 94.168 bytes, exportada do SVG original sem redesenho. Foram declarados MIME, dimensões e alt da imagem social conforme as propriedades do [Open Graph](https://ogp.me/). A mesma capa representa o portfólio, não screenshots dos produtos. Títulos e descrições permanecem específicos por página. A aparência final e o cache em cada rede precisam ser conferidos depois do deploy.

Exportação opcional, somente quando a arte fonte mudar; não faz parte do build:

```powershell
npx.cmd --yes --package=@resvg/resvg-js-cli@2.6.2-beta.1 resvg-js assets/social-card.svg assets/social-card.png
```

Usa o conversor [resvg CLI](https://github.com/Zhengqbbb/resvg-js-cli), instalado temporariamente pelo npm, e fontes do sistema. Reinspecione o resultado se exportar em outro sistema. O SVG foi preservado. O PNG só é referenciado em metadata: não virou imagem adicional na composição do site.

## 3. Robots, sitemap e dados estruturados

robots.txt permite rastrear todas as páginas e assets e aponta para https://danilovcardoso.com.br/sitemap.xml. Não se usa robots para esconder a 404: o crawler precisa receber seu status real.

O sitemap contém **somente quatro URLs canônicas**: home e os três cases. Não inclui /index.html, www, fragmentos, imagens, scripts, prompts, 404 ou ambientes temporários. lastmod foi omitido: não há fonte editorial confiável de data de alteração relevante. A seleção de URLs segue a [orientação de sitemaps do Google](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

JSON-LD no HTML inicial:

- Home: Person, WebSite e WebPage ligados por IDs estáveis.
- Person: nome e profissões já visíveis; sameAs restrito aos dois perfis GitHub/LinkedIn presentes na página.
- Cases: WebPage com título, descrição, idioma, autoria e vínculo com o site.
- Não foram adicionados LocalBusiness, endereço, telefone, avaliações, emprego, certificações, datas ou números novos.

WebPage descreve o documento do case; não promete que o software esteja disponível para compra nem inventa dados exigidos por outros tipos. A escolha é deliberadamente simples e compatível com [Schema.org WebPage](https://schema.org/WebPage). Não há promessa de rich result.

## 4. Limite do PT/EN atual

O documento inicial é PT-BR, incluindo title, description e JSON-LD. A troca de idioma usa a mesma URL e localStorage, sem documento inglês independente. O JavaScript sincroniza lang, title, OG/Twitter e WebPage (name, description, inLanguage) com o idioma exibido. Canonical e sitemap não mudam.

Não foi criado hreflang fictício. Crawlers sociais normalmente leem a resposta inicial; a preferência salva no navegador não é uma URL compartilhável. Também não é garantido que o Google descubra a variação inglesa dessa interface.

Se SEO em inglês se tornar prioridade, uma rodada futura pode publicar /en/ e /en/projects/… com HTML inglês completo, canonicals próprios e hreflang recíproco entre documentos realmente existentes. Isso exige decisão de URLs e conteúdo, não apenas tags extras. Veja a [orientação do Google para sites multilíngues](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites).

## 5. Performance e preservação visual

- Textos e links essenciais continuam no HTML. Sem JS, a home e os cases mantêm conteúdo, navegação e posters.
- CSS cinematográfico, journey.js, bridge.js, geometrias, timing, cores e fontes não foram alterados nesta rodada.
- A única alteração em main.js sincroniza dados estruturados ao trocar idioma; não cria outro scheduler nem trabalho por frame.
- Imagens visuais são SVGs locais decorativos, com alt vazio; Canvas é decorativo. Os contêineres e CSS já definem tamanho/posicionamento absoluto. Não se atribuiu CLS a ausência de width/height HTML isoladamente.
- Heroes não usam lazy; os posters abaixo da dobra continuam lazy. fetchpriority alto existente foi mantido. Não foram adicionados preloads especulativos.
- Não há fontes externas nem bibliotecas de terceiros no carregamento da página. Scripts continuam no final do body. Não houve troca de mídias ou remoção de movimento para buscar score.
- A 404 usa CSS isolado e um script pequeno só de idioma; não carrega os motores Canvas.
- Sem Lighthouse/CrUX ou medição de usuários reais nesta rodada: **não há alegação de ganho em LCP, CLS, INP ou FPS**. Para CWV, meça produção em dispositivo/rede representativos antes de otimizar.

## 6. Publicação e nginx/Coolify — ação humana

Publique index.html, projects/*.html, 404.html, robots.txt, sitemap.xml, css/, js/ e assets/. Não exponha .git, prompts, scripts de geração/verificação, fixtures temporárias ou documentação de trabalho. Revise o contexto de cópia da imagem Docker e o document root existentes; não foi criado Dockerfile substituto.

No nginx responsável pelos arquivos estáticos, adapte as regras abaixo ao server/root atual. São trechos de referência, **não uma configuração completa**:

```nginx
# Dentro do server existente, preservando root/TLS/proxy e demais regras:
error_page 404 /404.html;

location / {
    try_files $uri $uri/ =404;
}

location = /404.html {
    internal;
}

# $request_uri permanece / no índice interno, evitando loop da home.
if ($request_uri ~ "^/index[.]html(?:[?].*)?$") {
    return 308 https://danilovcardoso.com.br/$is_args$args;
}
```

A regra de erro mantém status 404; não use =200 nem fallback SPA para index.html. A 404 usa paths absolutos de assets/home e funciona também em caminhos profundos. A sintaxe e o comportamento de error_page/try_files estão na [documentação nginx](https://nginx.org/en/docs/http/ngx_http_core_module.html).

Revisar também:

- HTTP → HTTPS e www → sem www com 301/308, preservando caminho/query. O TLS de www precisa ser válido antes de redirecionar uma visita HTTPS. Se o proxy do Coolify encerra TLS, configurar no nível correto, sem criar loop com o nginx interno.
- Arquivos .html com barra final devem retornar 404 ou redirecionar permanentemente ao caminho exato; não criar outro documento 200.
- Host temporário sslip.io: remover exposição ou redirecionar ao domínio oficial no proxy. Não adicionar essas URLs ao conteúdo/sitemap.
- MIME: HTML text/html; CSS text/css; JS text/javascript ou application/javascript; SVG image/svg+xml; PNG image/png; XML application/xml; robots text/plain.
- Sem X-Robots-Tag: noindex global nas páginas públicas; sem autenticação, bloqueio de assets ou página de manutenção para crawlers.
- Compressão de HTML/CSS/JS/SVG/XML pode ser ativada na infraestrutura existente após medir. Assets não têm hashes: não aplicar cache immutable de um ano sem uma estratégia de versionamento.
- autoindex desativado; documents de trabalho fora do document root. robots não é mecanismo de privacidade.
- Salvar cópia da configuração antes de alterar, executar nginx -t no container correto e recarregar pelo fluxo existente. Se houver erro/loop/soft-404, restaurar somente a configuração modificada e revalidar. Não recriar a infraestrutura por este guia.

O servidor Node incluído é **apenas local**. Agora reproduz /index.html → / com 308, MIME TXT/XML/PNG e a página 404 com status real. Ele não valida as regras do nginx/proxy.

## 7. Verificações locais e pós-deploy

Node 18+; nenhuma instalação necessária:

```powershell
node scripts/verify-static.js
node scripts/verify-motion.js
node scripts/verify-seo.js --self-test
node scripts/serve.js
```

Em outro terminal:

```powershell
node scripts/verify-seo.js --base-url http://127.0.0.1:4173
```

O verificador SEO chama também o estático. Confere títulos/descrições/canonicals, duplicações, HTTPS, bots/noindex, H1 não vazio, HTML inicial, schemas/referências, sameAs com link no body, PNG (assinatura/dimensões), robots e as quatro URLs do sitemap. O teste estático cobre assets/fragmentos/ARIA/PTEN e sintaxe JS, incluindo 404. O XML é validado contra o formato restrito deste projeto, não por um parser XML genérico. JSON.parse e invariantes não substituem uma validação completa Schema.org.

--self-test injeta falhas somente em memória (sem alterar arquivos): metadados duplicados/vazios, canonical HTTP/duplicado, bot bloqueado, H1 vazio, JSON inválido, perfil existente apenas em comentário, sitemap incompleto/duplicado/malformado, robots bloqueador e imagem inválida.

Após publicar e ajustar a infraestrutura:

```powershell
node scripts/verify-seo.js --base-url https://danilovcardoso.com.br
curl.exe -I http://danilovcardoso.com.br/
curl.exe -I https://www.danilovcardoso.com.br/
curl.exe -I https://danilovcardoso.com.br/index.html
curl.exe -I https://danilovcardoso.com.br/projects/mapcloud.html/
curl.exe -I https://danilovcardoso.com.br/seo-check-missing-page/deep
```

O modo HTTP verifica resposta inicial das quatro páginas, robots, sitemap e PNG: status/MIME, canonical/meta/schema, X-Robots-Tag, redirect permanente do índice e 404 real. Usa GET com timeout, sem enviar dados nem alterar o site. Não acompanha redirecionamentos das URLs canônicas: essas devem responder 200 diretamente. A rede pública só é consultada quando --base-url é passado. O domínio informado deve estar sob seu controle.

Depois:

- Abrir o código-fonte (não apenas DOM pós-JS) e confirmar conteúdo/metadata PT.
- Validar JSON-LD no [Schema Markup Validator](https://validator.schema.org/) e, para elegibilidade quando aplicável, no [Rich Results Test](https://search.google.com/test/rich-results). Ausência de rich result suportado não significa que WebPage seja inválido.
- Conferir OG/Twitter e imagem em previews reais; considerar cache da plataforma.
- Conferir home e os três cases em desktop/mobile, PT/EN, teclado, navegação, menu, pausa e reduced motion, sem erros novos de console.
- Testar JS desativado e um caminho inexistente profundo: texto/links devem continuar acessíveis.
- Medir CWV após haver dados; não confundir a verificação local com aprovação em dispositivos reais.

## 8. Google Search Console — após o deploy

Você precisa acessar sua conta Google e administrar o DNS do domínio. Nenhuma conta foi acessada por esta implementação.

1. Abra o [Google Search Console](https://search.google.com/search-console/).
2. Em adicionar propriedade, prefira **Domínio** e informe danilovcardoso.com.br, sem protocolo ou caminho. Essa propriedade reúne protocolos/subdomínios; precisa de verificação DNS. [Tipos de propriedade](https://support.google.com/webmasters/answer/34592?hl=pt-BR).
3. Copie o **valor TXT exato fornecido pelo Search Console**. Não existe token pré-definido neste repositório.
4. Entre no Registro.br, selecione o domínio e a área DNS/edição da zona. Acrescente um registro TXT no domínio raiz com o valor copiado. Não remova nem substitua registros A, AAAA, MX, SPF, DKIM ou outros TXT existentes. Os rótulos do painel podem variar.
5. Se o domínio delega o DNS a outro provedor, crie o TXT no provedor autoritativo, não em uma zona inativa do Registro.br. Não mude os nameservers apenas para verificar propriedade.
6. Aguarde a propagação, volte ao Search Console e clique em Verificar. Se não encontrar, confira nome/valor e DNS autoritativo. Mantenha o TXT após validar. [Verificação por DNS](https://support.google.com/webmasters/answer/9008080?hl=pt-BR).
7. Em Sitemaps, envie https://danilovcardoso.com.br/sitemap.xml e acompanhe o status de leitura. O sitemap precisa estar publicamente acessível e correto. [Enviar sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
8. Use Inspeção de URL para https://danilovcardoso.com.br/. Confira acesso, canonical escolhido, status de indexação e teste ao vivo.
9. Se a página está acessível/indexável e ainda não aparece, solicite indexação. Isso não garante inclusão imediata nem posição.
10. Inspecione também os três cases com suas URLs .html exatas. [Inspeção de URL](https://support.google.com/webmasters/answer/9012289?hl=pt-BR).
11. Acompanhe **Indexação → Páginas** (Indexing/Pages) para exclusões/erros/canonicals e **Desempenho** (Performance) para impressões, cliques e consultas. Mudanças podem levar tempo; evite repetir pedidos de indexação continuamente.

## 9. Resultado desta rodada

Arquivos alterados: index.html; projects/mapcloud.html, projects/atlas3d.html e projects/azriel.html; js/main.js; scripts/serve.js; scripts/verify-static.js; README.md.

Arquivos criados: robots.txt; sitemap.xml; 404.html; css/404.css; js/404.js; assets/social-card.png; scripts/verify-seo.js; este SEO_SETUP.md. O briefing recebido não foi alterado.

Validações realizadas em 23/09/2026:

- Estático: 5 páginas, 107 referências, 37 fragmentos, 229 pares PT/EN, 4 CSS e 4 JS.
- Motion: suites de scheduler, V2, V2.1 e acabamento cinematográfico passaram, incluindo reduced, pause/scroll, lifecycle e fallbacks simulados.
- SEO: checagens locais, 15 fixtures negativas em memória e modo HTTP local passaram. Sitemap também foi aberto pelo parser XML nativo do PowerShell (quatro URLs).
- Chrome: home e três cases em 1366 × 900 e 390 × 900, PT e EN (16 combinações), sem overflow horizontal; title, OG e WebPage sincronizados com o idioma, canonicals estáveis.
- Navegação: home → MapCloud → Atlas3D → Azriel → MapCloud; retorno aos projetos; menu mobile → contato; pausa/retomada.
- Fallbacks: quatro páginas, desktop/mobile, sem scripts externos e com reduced motion simulado por fixture local (16 combinações). Nenhum texto principal escondido. Não foi alterada a preferência do sistema operacional.
- 404: PT/EN, caminho profundo, retorno à home, sem JS, largura 320 px e skip link acionado por Tab/Enter; status HTTP 404 confirmado. PNG inspecionado visualmente e servido com image/png.
- Sem erros capturados de console na sessão. CSS/cenas/timing originais preservados; inspeção visual local não substitui medição de CWV, trackpad/touch físico, Safari/Android ou comparação pixel a pixel de animações.
- A fixture temporária foi removida; nenhum arquivo de QA temporário faz parte da entrega.

Não houve commit, push, deploy, alteração DNS ou submissão ao Search Console. Validadores externos de rich results/Schema.org e previews em redes não foram executados contra esta versão ainda não publicada. Ações dos capítulos 6 e 8 continuam sob responsabilidade de publicação/administração.
