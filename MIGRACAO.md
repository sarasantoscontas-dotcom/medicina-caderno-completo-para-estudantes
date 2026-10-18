# Migração

Origem: https://medicina-caderno-completo.lovable.app/
Captura: 18/10/2026.

Os bundles JavaScript e CSS são os arquivos publicados originais, sem alterações. Eles contêm a página de apresentação, textos, cartões, animações e FAQ. O checkout Cakto foi preservado. Não há área de membros ou banco de dados incluído no endereço público fornecido.

O HTML preserva o visual e o selo do original. Apenas os scripts de telemetria específicos do servidor Lovable foram removidos, porque dependem de endpoints da hospedagem anterior. A imagem social dos metadados permanece no endereço original.

## Hospedar

Execute `npm run build` e publique a pasta `dist`. Não há dependências para instalar. Em hospedagens com roteamento SPA, direcione rotas desconhecidas a `index.html`. Incluídos `_redirects`, `404.html` e `vercel.json`.

Esta é uma cópia da versão compilada publicada; o endereço público não fornece os componentes React/TypeScript originais editáveis.
