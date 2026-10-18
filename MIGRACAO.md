# Site de apresentação do Caderno de Medicina

A página mantém o bundle original de apresentação, textos e links de compra. A camada complementar está em `assets/expansion.js`, `assets/expansion.css` e `assets/expansion-content.json`, para permitir manutenção sem alterar o arquivo compilado original.

Ampliação: 820 flashcards no total (82 originais + 738 adicionais, com perguntas únicas), 24 novas fichas extensas, aprofundamento das 14 fichas originais, 12 cartões por período, 12 benefícios complementares e seis prévias ilustrativas. As prévias são representações da organização do caderno, não capturas de tela do sistema.

O repositório `caderno-acesso-medicina` foi consultado somente para leitura. Nenhuma alteração foi feita nele. Os exemplos usam conteúdo e organização desse caderno. Os dados privados de usuários não foram utilizados.

O selo de edição e favicon Lovable foram removidos. O cabeçalho próprio do Caderno de Medicina foi preservado.

## Publicar

`npm run build` gera `dist/`, sem dependências externas. A configuração da Vercel define o comando e a pasta de saída. `_redirects` e `404.html` oferecem compatibilidade com hospedagem estática.

A origem forneceu arquivos compilados, não os componentes React/TypeScript originais. O conteúdo novo fica separado e editável.

## Apresentação no celular

Até 700px, os flashcards aparecem em duas colunas com resposta expansível. As fichas usam abertura individual; todas as perguntas, respostas e seções continuam no documento. Há controle para abrir ou recolher todas as respostas. Acima desse tamanho, o conteúdo começa aberto. O layout respeita a preferência por movimento reduzido.

## Identidade do caderno

A camada `assets/notebook-theme.css` aplica papel pautado, paleta pastel e as fontes DM Sans, Libre Baskerville e Caveat. Os componentes e textos anteriores permanecem; a referência é o próprio caderno e a imagem enviada em 18/10/2026.

## Exemplos já abertos

No celular, as dez primeiras fichas originais, as três primeiras fichas complementares (15 a 17) e os vinte primeiros flashcards começam abertos. Foram acrescentados exemplos explicativos de plano semestral, internato, residência, resumos, revisão e TCC dentro das amostras existentes.

## Agenda acadêmica explicativa

Seção dedicada com semana ilustrativa de 9 a 13/11/2026, 15 compromissos e filtros por dia. Inclui provas, seminário, revisões, entrega de relatório e integração com atividades supervisionadas. Não cria ou altera compromissos reais.

## Semana inteira sem filtros

A seção de agenda agora exibe os cinco dias integralmente, sem filtros ou conteúdo dependente de clique. O guia acrescenta seis cartões de método, cinco explicações diárias, quatro conexões entre estudo e prática e três perguntas de fechamento, todas abertas.
