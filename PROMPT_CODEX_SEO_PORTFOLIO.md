# CODEX --- SEO TÉCNICO E INDEXAÇÃO DO PORTFÓLIO

## Missão

Trabalhe sobre a versão ATUAL do portfólio em
`https://danilovcardoso.com.br`.

Infraestrutura: GitHub → Coolify → Docker/nginx → VPS.

O design e a experiência cinematográfica estão APROVADOS. Esta tarefa
NÃO é redesign. Não altere direção de arte, cenas, identidade,
animações, tipografia principal, paleta ou estrutura visual, salvo
quando estritamente necessário para indexação, crawlability, semântica,
acessibilidade ou performance.

Objetivo: fazer mecanismos de busca compreenderem corretamente quem é
Danilo V. Cardoso, suas competências reais, projetos e arquitetura das
páginas, sem keyword stuffing e sem inventar fatos.

## 1. Auditoria antes de editar

Leia todo o repositório e audite: title, description, canonical, robots
meta, robots.txt, sitemap.xml, Open Graph/social metadata, favicon,
headings, landmarks, links internos, cases, URLs, PT/EN, imagens/alt,
conteúdo sem JS, Canvas/SVG, JSON-LD, noindex, links quebrados, assets
ausentes, duplicatas, trailing slash, performance, 404 e mixed content.

## 2. Posicionamento

Comunique naturalmente, apenas quando sustentado pelo conteúdo real:
Software Engineering, Full Stack Development, desenvolvimento
web/sistemas, backend, APIs, automação, Linux, Docker, cybersecurity e
demais competências realmente presentes. Preserve a copy editorial.

## 3. Homepage

Audite/otimize `<title>`, description, canonical, robots quando
necessário, `og:title`, `og:description`, `og:url`, `og:type`,
`og:image`, metadata social, idioma, favicon e headings.

Canonical oficial: `https://danilovcardoso.com.br/`.

## 4. Cases

Audite MapCloud, Atlas3D e Azriel. Cada página deve ter title e
description únicos, canonical próprio, OG coerente, H1 correto,
headings, conteúdo textual indexável e links internos. Não invente
métricas, tecnologias ou resultados.

## 5. robots.txt

Crie/corrija `/robots.txt`, permitindo crawling público e assets
necessários e apontando para:
`Sitemap: https://danilovcardoso.com.br/sitemap.xml`

Não bloqueie conteúdo importante.

## 6. sitemap.xml

Crie/corrija sitemap válido com somente URLs públicas, canônicas e
indexáveis: homepage e os três cases, além de outras páginas reais
apropriadas. URLs absolutas HTTPS. Não inclua assets, anchors, 404,
sslip.io, temporárias ou duplicatas. Só use `lastmod` se houver fonte
confiável.

## 7. Structured Data

Implemente JSON-LD somente quando semanticamente correto. Avalie
`WebSite`, `Person`, `WebPage` e tipos apropriados aos cases. Não
adicione schemas por quantidade.

Nunca invente endereço, telefone, empresa, empregador, reviews, ratings,
prêmios, certificações, clientes ou redes sociais. `sameAs` somente para
URLs reais confirmadas no conteúdo. Structured data deve refletir
conteúdo visível.

## 8. PT/EN

Audite a arquitetura de idiomas. Garanta conteúdo indexável, `lang`
coerente e novas strings traduzidas quando necessário. Não crie URLs
alternativas fictícias.

Se PT/EN usa a mesma URL controlada por JS/localStorage, NÃO finja que
são documentos independentes com hreflang incorreto. Documente a
limitação e opções futuras em `SEO_SETUP.md`.

## 9. HTML semântico

Nome, profissão, descrição, projetos, tecnologias e contato relevante
devem existir como HTML legível, não apenas Canvas/imagens/animações.
Canvas decorativo não pode carregar informação essencial.

## 10. Headings

Audite H1--H6 por semântica, não aparência. Estrutura lógica por página;
evite múltiplos H1 sem justificativa e saltos arbitrários. Preserve
aparência via CSS.

## 11. Links internos

Home aponta claramente para cases; cases retornam à home e podem apontar
para outros cases. Use anchor text compreensível. Não crie links
artificiais para SEO.

## 12. Imagens/assets

Audite alt, width/height, lazy loading, formatos, tamanho, preload e
caminhos. Decorativas não precisam descrição artificial. Evite CLS. Não
lazy-load o verdadeiro LCP se isso piorar performance.

## 13. Open Graph/social card

Confirme que social card existe, tem URL pública correta e
compatibilidade. Se SVG puder causar incompatibilidade em crawlers
sociais, avalie gerar PNG otimizado. Não redesenhe o site.

## 14. Performance/Core Web Vitals

Procure ganhos seguros em LCP, CLS, INP, fontes, scripts, Canvas,
imagens, render blocking e preload. Não remova a experiência
cinematográfica para perseguir score sintético. Corrija desperdícios
reais.

## 15. JavaScript e indexação

Conteúdo principal deve existir no HTML inicial sempre que possível. JS
pode controlar motion/idioma, mas não deve ser requisito para crawler
descobrir H1, profissão, títulos e conteúdo fundamental dos cases.

## 16. 404

Se não existir, crie 404 leve e coerente, funcionando sem JS e com
retorno à home. Não inclua no sitemap. Se nginx/Coolify exigir
configuração manual, documente em `SEO_SETUP.md` em vez de alterar
infraestrutura desnecessariamente.

## 17. Segurança de indexação

Procure explicitamente `noindex`, `nofollow`, bloqueios robots,
canonical errado, localhost, sslip.io, URLs HTTP e metadata de
desenvolvimento. Nenhum artefato temporário deve aparecer em produção.

## 18. Verificador SEO

Aproveite scripts existentes e adicione/estenda verificação simples para
detectar: title/description/canonical ausentes, canonical não HTTPS,
titles/canonicals duplicados, noindex acidental, links internos
quebrados, assets ausentes, sitemap inválido/incompleto, robots sem
sitemap, recursos HTTP e H1 ausente/incorreto. Sem framework pesado.

## 19. SEO_SETUP.md

Crie `SEO_SETUP.md` com ações humanas pós-deploy.

### Google Search Console

Documente: 1. acessar Google Search Console; 2. adicionar
`danilovcardoso.com.br`; 3. preferir propriedade de domínio quando
apropriado; 4. obter registro TXT; 5. adicionar TXT no DNS do
Registro.br; 6. aguardar verificação; 7. enviar
`https://danilovcardoso.com.br/sitemap.xml`; 8. inspecionar homepage; 9.
solicitar indexação; 10. inspecionar cases; 11. acompanhar
Indexing/Pages e Performance.

Nunca invente o TXT de verificação.

Inclua também como verificar robots, sitemap, canonicals, status HTTP,
HTTPS, metadata e structured data após deploy.

## 20. Não fazer

Não redesenhe o portfólio. Não altere narrativa cinematográfica. Não
crie starter template, site comercial ou blog artificial. Não faça
keyword stuffing, backlinks artificiais, localização inventada,
empresa/reviews/clientes/certificações fictícias, analytics ou tracking
sem solicitação, nem Search Console com credenciais inexistentes.

## 21. SEO local

Não transforme automaticamente o portfólio em LocalBusiness. Se não há
endereço comercial/área de atendimento explícita, não invente endereço,
coordenadas ou schema local.

## 22. Preservar motion

Qualquer alteração HTML deve preservar classes, data attributes, IDs,
anchors e hooks usados por `journey.js`, CSS e demais scripts. Rastreie
referências antes de alterar. SEO não pode quebrar motion.

## 23. Testes

Execute verificadores existentes e novos. Teste homepage, MapCloud,
Atlas3D, Azriel, PT/EN, desktop/mobile, reduced motion, navegação,
links, console, sitemap, robots, 404, metadata e structured data.
Confirme experiência visual equivalente ao baseline.

## 24. Critérios de sucesso

Concluído quando: metadata é coerente; canonical correto; robots/sitemap
corretos; cases individualmente compreensíveis; structured data válido e
verdadeiro; conteúdo principal semanticamente acessível; sem bloqueios
acidentais; links íntegros; sem URLs temporárias; Search Console
documentado; verificações passam; visual/motion não degradaram.

## 25. Entrega

Implemente no repositório e reporte: 1. auditoria resumida anterior; 2.
problemas encontrados; 3. arquivos criados/alterados; 4. metadata; 5.
sitemap/robots; 6. structured data; 7. mudanças nos cases; 8.
performance; 9. testes; 10. limitações; 11. passos manuais do Search
Console.

Não apenas recomende. **Implemente tudo que puder ser corretamente
implementado no código e documente somente o que realmente exige ação
humana.**
