/* Conteúdo complementar editável. Mantém a página original e seus links. */
(() => {
  'use strict';
  const script = document.currentScript;
  const contentUrl = new URL('expansion-content.json', script.src);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const sectionFor = title => Array.from(document.querySelectorAll('main h2')).find(h => h.textContent.includes(title))?.closest('section');
  const el = html => { const template = document.createElement('template'); template.innerHTML = html; return template.content; };
  const heading = (kicker, title, intro) => `<header class="more-heading"><span class="more-kicker">${esc(kicker)}</span><h2>${esc(title)}</h2><p>${esc(intro)}</p></header>`;
  const blocks = items => items.map(b => `<div class="reading-block"><h4>${esc(b.title)}</h4>${b.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}</div>`).join('');
  const section = (kicker, title, intro, body, extra='') => `<section class="med-expansion ${extra}">${heading(kicker,title,intro)}${body}</section>`;
  const mark = (name, html) => `<div class="screen-top"><span class="screen-dots" aria-hidden="true"><i></i><i></i><i></i></span><span>Caderno de Medicina · ${esc(name)}</span></div>${html}`;
  function expand(data) {
    if (document.documentElement.dataset.medicineExpanded) return;
    document.documentElement.dataset.medicineExpanded = 'true';
    const flashSection = sectionFor('Veja os flashcards');
    if (!flashSection) return;
    const originalGrid = flashSection.querySelector('.grid');
    const originalCards = Array.from(originalGrid.children);
    originalGrid.classList.add('original-flash-grid');
    flashSection.classList.add('expanded-flash-section');
    const cats = [...new Set(data.cards.map(c=>c.cat))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
    const controls = el(`<div class="flash-toolbar"><div><strong>${data.totalCount} flashcards para explorar</strong><p>Explore por disciplina. No celular, toque no cartão para abrir a resposta completa.</p></div><div class="flash-fields"><label>Buscar assunto<input type="search" id="med-card-search" placeholder="Ex.: coração, transporte, imunidade"></label><label>Disciplina<select id="med-card-category"><option value="">Todas as disciplinas</option>${cats.map(c=>`<option>${esc(c)}</option>`).join('')}</select></label></div><p id="med-card-count" role="status" aria-live="polite">${data.totalCount} cartões visíveis</p></div>`);
    originalGrid.before(controls);
    const cardGrid = document.createElement('div'); cardGrid.className='more-flash-grid';
    cardGrid.innerHTML = data.cards.map((c,i)=>`<article class="more-flashcard tone-${i%6}" data-category="${esc(c.cat)}"><div class="flash-meta"><span>${esc(c.cat)}</span><small>${String(i+data.originalCount+1).padStart(3,'0')}</small></div><span class="flash-kind">${esc(c.kind)}</span><h3>${esc(c.q)}</h3><div class="flash-answer"><span>Resposta</span><p>${esc(c.a)}</p></div></article>`).join('');
    originalGrid.after(cardGrid);
    const newCards=Array.from(cardGrid.children);
    // Native disclosures keep the complete text in the document and keyboard accessible.
    [...originalCards,...newCards].forEach((outer,index)=>{
      const card=index<originalCards.length?outer.querySelector('article'):outer;
      const question=index<originalCards.length?card.querySelector('p'):card.querySelector('h3');
      const answer=index<originalCards.length?card.querySelectorAll('p')[1]:card.querySelector('.flash-answer');
      if(!question||!answer)return;
      const reveal=document.createElement('details');reveal.className='compact-disclosure card-reveal';if(index<20){reveal.dataset.mobileOpen='true';card.classList.add('preview-open-card');}
      const summary=document.createElement('summary');
      const prompt=document.createElement('span');prompt.className='compact-question';prompt.textContent=question.textContent;
      const hint=document.createElement('span');hint.className='reveal-hint';hint.textContent='Ver resposta';
      summary.append(prompt,hint);reveal.append(summary,answer);question.replaceWith(reveal);
      if(index<originalCards.length){card.classList.add('original-compact-card');Array.from(card.children).filter(e=>e.tagName==='SPAN'&&e.classList.contains('h-px')).forEach(e=>e.remove());}
    });
    const bulk=document.createElement('button');bulk.type='button';bulk.className='mobile-answer-toggle';bulk.textContent='Abrir todas as respostas';bulk.setAttribute('aria-pressed','false');
    document.querySelector('.flash-toolbar').append(bulk);
    bulk.addEventListener('click',()=>{const open=bulk.getAttribute('aria-pressed')!=='true';flashSection.querySelectorAll('.card-reveal').forEach(d=>d.open=open);bulk.setAttribute('aria-pressed',String(open));bulk.textContent=open?'Recolher as respostas':'Abrir todas as respostas';});
    const filter=()=>{
      const q=normalize(document.querySelector('#med-card-search').value.trim());
      const cat=document.querySelector('#med-card-category').value;
      let shown=0;
      newCards.forEach((card,i)=>{const match=(!cat||data.cards[i].cat===cat)&&(!q||normalize(card.textContent).includes(q));card.hidden=!match;if(match)shown++;});
      originalCards.forEach(card=>{const match=!cat&&(!q||normalize(card.textContent).includes(q));card.hidden=!match;if(match)shown++;});
      document.querySelector('#med-card-count').textContent=shown?`${shown} cartões visíveis`:'Nenhum cartão encontrado. Tente outro assunto.';
    };
    document.querySelector('#med-card-search').addEventListener('input',filter);
    document.querySelector('#med-card-category').addEventListener('change',filter);

    // Enrich the fourteen retained examples rather than replacing their contents.
    const sheetSection=sectionFor('Veja como chega');
    if(sheetSection){
      const sheetTitles=Array.from(sheetSection.querySelectorAll('h3')).slice(0,14);
      sheetTitles.forEach((h,i)=>{
        const frame=h.closest('.max-w-3xl')||h.closest('article')||h.parentElement.parentElement;
        const item=data.enrich[i];if(!item)return;
        const block=el(`<div class="sheet-reading"><span class="more-kicker">Leitura complementar</span><h3>${esc(item.title)}</h3><p>${esc(item.lead)}</p>${blocks(item.blocks)}</div>`);
        frame.append(block);
      });
      const body=`<div class="sheet-library">${data.sheets.map((s,i)=>`<article class="study-sheet tone-${i%6}"><header><span class="sheet-number">FICHA ${String(i+15).padStart(2,'0')}</span><span>${esc(s.discipline)}</span><h3>${esc(s.title)}</h3></header><div class="sheet-body"><p class="sheet-lead">${esc(s.lead)}</p><div class="sheet-tags">${s.keywords.map(k=>`<span>${esc(k)}</span>`).join('')}</div>${blocks(s.blocks)}<footer>Do conceito à revisão · Caderno de Medicina</footer></div></article>`).join('')}</div>`;
      sheetSection.after(el(section('Mais fichas, mais leitura','Abra o assunto. Entenda as relações.','Uma seleção ampliada de fichas com conceitos, mecanismos e relações entre disciplinas. Os textos ficam abertos para leitura, sem precisar avançar por um carrossel.',body)));
    }

    const benefitSection=sectionFor('Benefícios práticos');
    if(benefitSection){
      const grid=benefitSection.querySelector('.grid');
      grid.insertAdjacentHTML('beforeend',data.benefits.map((b,i)=>`<article class="benefit-extra tone-${i%6}"><span class="more-kicker">Na rotina da faculdade</span><h3>${esc(b.title)}</h3><p>${esc(b.text)}</p><span class="benefit-footer">Planejar · acompanhar · revisar</span></article>`).join(''));
    }
    const periods=[
      ['1º','Aprender a linguagem do corpo','Anatomia · Histologia · Embriologia','Planos, tecidos e desenvolvimento formam o vocabulário inicial para descrever o corpo e compreender as aulas práticas.','Conecte a estrutura observada no atlas com cortes, lâminas e termos de relação.','Use fichas por assunto, palavras-chave e revisão de terminologia.'],
      ['2º','Entender como os sistemas funcionam','Fisiologia · Bioquímica · Biologia Celular','O foco passa da estrutura aos mecanismos: membranas, enzimas, metabolismo e controle das funções corporais.','Compare estado alimentado e jejum; relacione ciclo cardíaco, pressão e perfusão.','Organize resumos por mecanismo e flashcards sobre relações de causa e efeito.'],
      ['3º','Conectar defesa, agentes e doença','Imunologia · Microbiologia · Genética','A resposta do hospedeiro, as características dos microrganismos e a variação genética se conectam ao estudo dos mecanismos de doença.','Monte comparações entre imunidade inata e adaptativa e entre diferentes agentes.','Retome as bases celulares antes de estudar mecanismos de lesão.'],
      ['4º','Integrar lesão e ação dos fármacos','Patologia · Farmacologia · Fisiopatologia','Inflamação, adaptação, morte celular, receptores e farmacocinética ajudam a integrar os ciclos básico e clínico.','Separe mecanismo da doença, mecanismo do fármaco e efeito esperado.','Revise com quadros comparativos e registre as confusões que aparecem nas questões.'],
      ['5º','Aprender a observar e ouvir','Semiologia · Comunicação · Exame Físico','A entrevista clínica, os sinais vitais e a organização do exame físico aproximam os conteúdos da avaliação de pessoas.','Use roteiros para organizar história, achados e hipóteses, com supervisão das atividades práticas.','Relacione o sinal observado com a anatomia e a fisiologia correspondentes.'],
      ['6º','Construir raciocínio clínico','Clínica Médica · Cardiologia · Pneumologia','Os conteúdos são conectados a apresentações clínicas, hipóteses diferenciais e interpretação de exames.','Compare mecanismos, manifestações e achados de diferentes condições.','Separe o que você observou, o que interpretou e o que precisa estudar novamente.'],
      ['7º','Integrar cuidado e procedimentos','Cirurgia · Pediatria · Habilidades','Casos, atividades práticas e estudo das grandes áreas ampliam a integração dos conhecimentos.','Prepare os temas antes da prática e registre depois as principais dúvidas para discussão.','Organize relatórios e revisões por área, sem misturar prazos e materiais.'],
      ['8º','Ampliar o olhar para o cuidado','Ginecologia e Obstetrícia · Família · Saúde Coletiva','O estudo articula ciclos de vida, prevenção, cuidado longitudinal e organização dos serviços.','Conecte discussões de casos aos conteúdos de clínica, epidemiologia e ética.','Mantenha listas de revisão por grande área e acompanhe as avaliações do semestre.'],
      ['9º','Começar a organizar os rodízios','Internato · Objetivos de Aprendizagem','O planejamento por rotação ajuda a manter juntos escalas, temas de estudo, atividades e feedbacks.','Defina o que pretende aprender em cada cenário e registre suas experiências acadêmicas.','Retome resumos e flashcards ligados às dúvidas que surgirem durante o rodízio.'],
      ['10º','Acompanhar prática e pesquisa','Internato · TCC · Discussão de Casos','O percurso combina responsabilidades práticas, leitura de literatura e organização do trabalho acadêmico.','Distribua tempo entre rodízios, etapas da pesquisa e revisão das grandes áreas.','Use cronograma, fichamentos e controle de entregas para acompanhar o TCC.'],
      ['11º','Revisar com intenção','Grandes Áreas · Questões · Currículo','A revisão acumulada se beneficia da análise dos próprios erros e da organização dos conteúdos por prioridade.','Agrupe lacunas por assunto e faça novas revisões depois de resolver questões.','Mantenha certificados, atividades complementares e documentos do currículo organizados.'],
      ['12º','Fechar o percurso e planejar os próximos passos','Conclusão · Residência · Vida Profissional','O último período reúne consolidação de conhecimentos, fechamento de entregas e planejamento de continuidade da formação.','Organize pendências, apresentação do TCC, documentação e plano de revisão.','Retome os conteúdos essenciais e planeje a transição para a etapa seguinte.']
    ];
    const grade=sectionFor('Grade do curso');
    if(grade){grade.append(el(`<div class="period-expansion"><div class="more-heading"><span class="more-kicker">Um olhar para cada etapa</span><h3>Do primeiro contato à conclusão do curso.</h3><p>Exemplo de percurso de estudos por período. A organização das disciplinas acompanha a matriz curricular da sua faculdade.</p></div><div class="period-grid">${periods.map((p,i)=>`<article class="period-card tone-${i%6}"><span class="period-label">${p[0]} período</span><h4>${p[1]}</h4><p class="period-topics">${p[2]}</p><p>${p[3]}</p><div><strong>Na prática do estudo</strong><p>${p[4]}</p></div><div><strong>Dentro do caderno</strong><p>${p[5]}</p></div></article>`).join('')}</div></div>`));}

    const previews=sectionFor('Páginas do caderno');
    if(previews){
      const libraries=data.library.slice(0,4).map(a=>`<div class="library-area"><span>${esc(a.area)}</span>${a.disciplines.slice(0,3).map(d=>`<div><strong>${esc(d.title)}</strong><small>${d.topics.map(esc).join(' · ')}</small></div>`).join('')}</div>`).join('');
      const screens=[
        ['Resumos','Uma biblioteca que faz sentido para estudar','Grandes áreas, disciplinas e assuntos criam um caminho de leitura. Você encontra o tema, abre o resumo e conecta o conteúdo à bibliografia.',`<div class="screen-workspace"><aside><strong>Meu caderno</strong><span class="selected">Resumos</span><span>Flashcards</span><span>Referências</span><span>Planner</span><span>Internato</span></aside><div class="screen-content"><small>BIBLIOTECA ACADÊMICA</small><h4>Resumos organizados</h4>${libraries}</div></div>`],
        ['Leitura','Um resumo por dentro, além do título','As páginas combinam explicações, quadros e aplicações. O estudo acompanha a lógica do tema e ajuda a relacionar estrutura e função.',`<div class="screen-reading"><small>ANATOMIA / TÓRAX</small><h4>Coração, pulmões e mediastino</h4><p>${esc(data.sheets[1].lead)}</p><div class="screen-callout"><strong>Mapa do assunto</strong><p>Parede torácica · Cavidades pleurais · Mediastino · Relações neurovasculares</p></div><h5>${esc(data.sheets[1].blocks[0].title)}</h5><p>${esc(data.sheets[1].blocks[0].paragraphs[0])}</p><div class="screen-bottom"><span>Leitura</span><span>Conexão clínica</span><span>Referências</span></div></div>`],
        ['Flashcards','Pergunta, resposta e revisão ativa','No sistema de acesso, os baralhos são organizados por disciplina. É possível revelar a resposta, classificar a dificuldade e acompanhar o progresso.',`<div class="screen-review"><span class="screen-chip">Fisiologia Cardiovascular</span><small>RECUPERAÇÃO ATIVA</small><h4>Como se calcula o débito cardíaco?</h4><div class="screen-callout"><strong>Frequência cardíaca × volume sistólico.</strong><p>Relacione a frequência dos batimentos ao volume ejetado em cada contração.</p></div><div class="review-ratings"><span>Rever</span><span>Em treino</span><span>Consolidado</span></div><p class="screen-note">Exemplo de cartão com resposta revelada</p></div>`],
        ['Planejamento','A semana deixa de ser uma lista solta','Planejamento acadêmico e cronograma de estudos ajudam a distribuir conteúdo novo, revisões, avaliações e atividades práticas.',`<div class="screen-content"><small>PLANEJAMENTO SEMANAL</small><h4>Uma semana de estudos</h4><div class="week-grid">${[['SEG','Semiologia','Revisar anamnese'],['TER','Patologia','Inflamação e reparo'],['QUA','Farmacologia','Comparar mecanismos'],['QUI','Prática','Preparar roteiro'],['SEX','Revisão','Retomar os erros']].map((r,i)=>`<div class="tone-${i}"><strong>${r[0]}</strong><b>${r[1]}</b><span>${r[2]}</span></div>`).join('')}</div><div class="screen-callout"><strong>Fechamento da semana</strong><p>Conteúdos estudados, dúvidas para retomar e prioridades da próxima semana.</p></div></div>`],
        ['Trabalhos e PDFs','Cada entrega com contexto, prazo e formato','O controle de trabalhos registra disciplina, formato, prazo, critérios e situação. PDFs e versões editáveis podem ser organizados como parte desse percurso.',`<div class="screen-content"><small>TRABALHOS ACADÊMICOS</small><h4>Controle de entregas e arquivos</h4><div class="file-list">${[['PDF','Relatório prático','Histologia · em revisão'],['PDF','Mapa mental de imunologia','Imunologia · planejado'],['SLIDES','Seminário de inflamação','Patologia · em produção'],['TEXTO','Resumo crítico de artigo','Metodologia · entregue']].map(r=>`<div><span class="file-type">${r[0]}</span><span><strong>${r[1]}</strong><small>${r[2]}</small></span></div>`).join('')}</div><div class="screen-callout"><strong>Antes de entregar</strong><p>Conferir requisitos, revisar referências e manter a versão final identificada.</p></div></div>`],
        ['Internato e pesquisa','Da experiência prática à organização acadêmica','Rotações, objetivos, feedbacks e pesquisa têm espaços próprios. As experiências de cada etapa podem orientar a próxima sessão de estudo.',`<div class="screen-content"><small>INTERNATO / TCC & PESQUISA</small><h4>Acompanhar o percurso</h4><div class="screen-duo"><div><span class="screen-chip">Internato</span><h5>Rodízio e aprendizagem</h5><p>Objetivos da rotação</p><p>Experiências acadêmicas</p><p>Feedback da supervisão</p><p>Temas para revisar</p></div><div><span class="screen-chip">Pesquisa</span><h5>Da pergunta à escrita</h5><p>Planejamento e método</p><p>Literatura e fichamentos</p><p>Análise e redação</p><p>Defesa e divulgação</p></div></div></div>`]
      ];
      previews.after(el(section('Uma visão mais próxima','Veja o estudo ganhar forma na tela.','Prévias ilustrativas baseadas na organização e nas funcionalidades do Caderno de Medicina. Aqui, as telas apresentam exemplos de uso para você conhecer cada área.',`<div class="screens-grid">${screens.map((s,i)=>`<article class="preview-explained"><div class="screen-frame tone-${i%6}">${mark(s[0],s[3])}</div><span class="more-kicker">${s[0]}</span><h3>${s[1]}</h3><p>${s[2]}</p></article>`).join('')}</div>`,'screen-section')));
    }
    const lineList=rows=>`<div class="plan-lines">${rows.map(([label,title,description])=>`<div class="plan-line"><span>${esc(label)}</span><div><strong>${esc(title)}</strong><p>${esc(description)}</p></div></div>`).join('')}</div>`;
    const miniCard=(question,answer)=>`<aside class="plan-explainer"><span>Flashcard explicativo</span><h4>${esc(question)}</h4><p>${esc(answer)}</p></aside>`;
    const samples=[
      ['Plano semestral · 5º período','Um semestre inteiro, em linhas de estudo','Exemplo de 16 semanas integrando Semiologia, Patologia e Farmacologia. As semanas mostram como distribuir conteúdo novo, prática e revisão; você adapta a sequência às aulas e às avaliações da sua faculdade.',[
        ['01–02','Organizar o ponto de partida','Separar as ementas e datas de prova; retomar bases de fisiologia e preparar os primeiros roteiros de anamnese.'],
        ['03–04','Conectar os mecanismos','Estudar lesão e inflamação; relacionar os conceitos aos temas de semiologia e aos princípios de ação dos fármacos.'],
        ['05–06','Treinar observação e comunicação','Preparar o exame físico estudado na disciplina; discutir os achados das atividades supervisionadas e anotar dúvidas.'],
        ['07–08','Fazer a primeira revisão integrada','Retomar flashcards, resolver questões e separar erros de conceito, interpretação e esquecimento antes da avaliação.'],
        ['09–10','Aprofundar os temas do semestre','Organizar resumos por assunto e comparar mecanismos, manifestações e relações com farmacologia nas discussões de casos.'],
        ['11–12','Levar as dúvidas para a prática','Relacionar os temas das aulas às atividades de laboratório e ambulatório; registrar o aprendizado e os pontos de revisão.'],
        ['13–14','Revisar com base nos erros','Priorizar os assuntos ainda frágeis, retomar questões e organizar os trabalhos com antecedência em relação aos prazos.'],
        ['15–16','Consolidar e fechar o semestre','Fazer revisão acumulada, conferir entregas e frequência, registrar o que ficou bem aprendido e as bases para o período seguinte.']
      ],['Como o plano semestral ajuda no estudo?','Ele dá uma visão do período inteiro. O cronograma semanal transforma essa visão em blocos de leitura, prática e revisão, enquanto a análise de erros ajuda a ajustar as prioridades.']],
      ['Atividades acompanhadas · 10º período','Um exemplo de semana no internato','O diário reúne o contexto acadêmico da atividade, o objetivo de aprendizagem, os assuntos discutidos e o retorno da supervisão. O exemplo abaixo mostra como a prática pode orientar a revisão.',[
        ['SEG','Clínica Médica · discussão de enfermaria','Preparar o tema, acompanhar a discussão e registrar quais conceitos precisam ser retomados no resumo.'],
        ['TER','Cirurgia · preparação e discussão','Organizar o objetivo da atividade supervisionada, anotar o aprendizado e reunir dúvidas para a devolutiva.'],
        ['QUA','Pediatria · consulta acompanhada','Relacionar os temas de crescimento, desenvolvimento e prevenção ao conteúdo trabalhado na disciplina.'],
        ['QUI','Atenção Primária · continuidade do cuidado','Observar como o acompanhamento ao longo do tempo se conecta à história, ao contexto familiar e ao plano discutido.'],
        ['SEX','Feedback e fechamento da semana','Revisar os objetivos do rodízio, registrar pontos fortes e dificuldades e escolher os temas da próxima sessão de estudo.']
      ],['O que escrever depois de uma atividade acompanhada?','Registre cenário e tema, objetivo, atividade observada ou realizada sob supervisão, aprendizados, dúvidas e feedback. Use registros acadêmicos sem dados que identifiquem pacientes.']],
      ['Plano de estudos para residência','Da leitura do edital à revisão final','Exemplo de organização em 12 semanas. A distribuição por grande área segue os pesos e o conteúdo do edital escolhido e pode ser ajustada a cada ciclo de questões.',[
        ['01–02','Mapear o edital e o ponto de partida','Separar etapas, prazos e conteúdo programático; fazer um bloco inicial de questões para identificar os assuntos mais frágeis.'],
        ['03–04','Clínica Médica e revisão acumulada','Alternar estudo dos temas priorizados com questões e retomada dos erros, sem deixar os conteúdos anteriores desaparecerem da rotina.'],
        ['05–06','Cirurgia e raciocínio por casos','Revisar os temas previstos no edital, comparar hipóteses nos casos de estudo e separar os pontos que geram confusão nas questões.'],
        ['07–08','Pediatria e Ginecologia–Obstetrícia','Distribuir os assuntos entre as duas áreas, analisar o desempenho e voltar aos resumos quando um erro revelar uma lacuna de base.'],
        ['09–10','Preventiva, Saúde Coletiva e integração','Organizar os eixos do edital, revisar conceitos de epidemiologia e intercalar questões das grandes áreas já estudadas.'],
        ['11–12','Simulados, currículo e revisão final','Resolver simulados com tempo marcado, revisar erros recorrentes e conferir documentos e etapas de análise curricular quando previstos.']
      ],['Como usar o caderno de erros na preparação para residência?','Anote o assunto, a razão do erro, a explicação correta e o ponto a revisar. Depois, volte ao tema com questões e flashcards: o objetivo é acompanhar o entendimento, não apenas contar acertos.']],
      ['Resumos por disciplina','Uma leitura com começo, conexão e revisão','O resumo é organizado por assunto para que o estudante compreenda o conceito e consiga retomá-lo depois.',[
        ['01','Entender o conceito','Começar pela explicação central e identificar o vocabulário que precisa estar claro.'],
        ['02','Conectar as disciplinas','Relacionar estrutura, funcionamento e mecanismos de doença ao tema estudado.'],
        ['03','Aplicar à discussão','Usar os quadros e exemplos para explicar o assunto em uma questão ou caso de estudo.'],
        ['04','Revisar o que ficou frágil','Transformar as dúvidas em perguntas e retomar os flashcards correspondentes.']
      ],['O que torna um resumo útil para a prova?','A organização por conceitos e relações ajuda a explicar o assunto com suas palavras. Quadros, questões e revisão ativa permitem conferir se a leitura virou compreensão.']],
      ['Flashcards · revisão espaçada','Uma rotina curta para revisar melhor','Os cartões conectam o conteúdo já estudado à recuperação ativa: tentar lembrar, comparar com a resposta e retomar as dúvidas.',[
        ['01','Escolher a disciplina','Começar pelos assuntos estudados recentemente e pelas dificuldades identificadas nas questões.'],
        ['02','Tentar responder primeiro','Ler a pergunta e formular uma resposta antes de consultar o verso.'],
        ['03','Comparar e compreender','Conferir a explicação e voltar ao resumo quando faltar uma relação importante.'],
        ['04','Acompanhar a dificuldade','No caderno, classificar o desempenho ajuda a organizar as próximas revisões.']
      ],['Por que alternar resumos e flashcards?','O resumo explica o contexto e as relações; o flashcard ajuda a recuperar uma ideia sem reler tudo. Os dois formatos se complementam na rotina de estudo.']],
      ['TCC em Medicina','Uma pesquisa dividida em etapas','O acompanhamento reúne planejamento, leitura, método, escrita e preparação da apresentação.',[
        ['TEMA','Delimitar a pergunta','Organizar o assunto, o problema e os objetivos com a orientação docente.'],
        ['LEITURA','Construir a base teórica','Separar referências e fichamentos por tema e registrar as ideias que sustentam o projeto.'],
        ['MÉTODO','Planejar a execução','Organizar desenho, etapas, variáveis e cuidados éticos conforme a proposta do estudo.'],
        ['ESCRITA','Acompanhar versões e entregas','Distribuir a redação por etapas, revisar com a orientação e preparar a defesa.']
      ],['Como evitar acumular o TCC para o final?','Divida o trabalho em entregas menores, com prazo e critério de conclusão: pergunta, revisão, projeto, análise, texto e apresentação. O cronograma precisa refletir as etapas reais da sua pesquisa.']]
    ];
    const sampleSection=sectionFor('Amostra do caderno');
    if(sampleSection)samples.forEach(([title,subtitle,intro,rows,card])=>{
      const headingNode=Array.from(sampleSection.querySelectorAll('h3')).find(h=>h.textContent.trim()===title);
      if(!headingNode)return;
      headingNode.parentElement.append(el(`<div class="plan-example"><span class="more-kicker">Por dentro da rotina</span><h4>${esc(subtitle)}</h4><p class="plan-intro">${esc(intro)}</p>${lineList(rows)}${miniCard(...card)}</div>`));
    });

    const agendaAnchor=sectionFor('Amostra do caderno');
    if(agendaAnchor){
      const events=[
        ['seg','09','Segunda','08h–10h','Semiologia cardiovascular','Aula e preparação do roteiro de exame físico.','aula','Aula'],
        ['seg','09','Segunda','14h–15h','Resumo + revisão ativa','Revisar ciclo cardíaco e responder aos flashcards ligados à aula.','revisao','Revisão'],
        ['seg','09','Segunda','17h–17h30','Começar o relatório de prática','Separar objetivo, observações e referências antes da entrega de quinta-feira.','trabalho','Trabalho'],
        ['ter','10','Terça','07h–12h','Atividade supervisionada na UBS','Levar o roteiro de aprendizagem e anotar os temas para discutir na preceptoria.','estagio','Estágio'],
        ['ter','10','Terça','15h–16h','Patologia · inflamação','Estudar mecanismos e organizar o quadro comparativo da disciplina.','aula','Estudo'],
        ['ter','10','Terça','18h–18h30','Retomar dúvidas do estágio','Relacionar as dúvidas da atividade aos resumos de Semiologia.','revisao','Revisão'],
        ['qua','11','Quarta','08h–09h','Farmacologia · receptores','Rever agonistas, antagonistas e relações entre dose e resposta.','aula','Estudo'],
        ['qua','11','Quarta','10h–11h','Seminário de Patologia','Apresentação em grupo: mecanismo, exemplos e discussão com a turma.','prova','Avaliação'],
        ['qua','11','Quarta','16h–17h','Relatório · versão para revisão','Conferir a estrutura, organizar as referências e revisar o texto.','trabalho','Entrega em preparação'],
        ['qui','12','Quinta','08h–10h','Prática de Semiologia','Preparar materiais e registrar o aprendizado depois da atividade.','estagio','Prática'],
        ['qui','12','Quinta','Até 18h','Entregar relatório de prática','Histologia · PDF final, identificação da disciplina e referências conferidas.','trabalho','Prazo de entrega'],
        ['qui','12','Quinta','19h–19h40','Revisão para a prova','Retomar questões erradas e os conceitos de Patologia ainda frágeis.','revisao','Pré-prova'],
        ['sex','13','Sexta','09h–10h30','Prova de Patologia','Inflamação, lesão celular e reparo · revisão concluída na véspera.','prova','Prova'],
        ['sex','13','Sexta','14h–15h','Feedback do estágio','Rever objetivos de aprendizagem e registrar pontos para o próximo encontro.','estagio','Acompanhamento'],
        ['sex','13','Sexta','17h–17h30','Fechar a semana','Conferir entregas, registrar dúvidas e distribuir as prioridades seguintes.','revisao','Planejamento']
      ];
      const days=[['todos','Semana inteira'],['seg','Seg · 09'],['ter','Ter · 10'],['qua','Qua · 11'],['qui','Qui · 12'],['sex','Sex · 13']];
      const agendaMarkup=`<section class="agenda-lab" aria-labelledby="agenda-title">
        <header class="agenda-intro"><div><span class="agenda-script">Entre uma aula e outra, a sua semana faz sentido.</span><span class="agenda-kicker">Agenda & planejamento acadêmico</span><h2 id="agenda-title">Aulas, provas e entregas no mesmo plano.</h2><p>A agenda conecta o que você precisa estudar, quando vai ser avaliado, o que tem para entregar e os compromissos da prática. Um lugar para transformar o semestre em uma rotina que dá para acompanhar.</p></div><aside class="agenda-note"><span>meu plano da semana</span><p>Revisar Patologia.<br>Entregar o relatório.<br>Levar as dúvidas para a preceptoria.</p><small>Uma prioridade de cada vez.</small></aside></header>
        <div class="agenda-dashboard"><div class="agenda-dashboard-head"><div><span class="agenda-kicker">Exemplo de rotina · 5º período</span><h3>09 a 13 de novembro</h3><p>Semana ilustrativa preenchida para mostrar como os compromissos se conectam.</p></div><span class="agenda-semester">Semestre em andamento</span></div>
        <div class="agenda-counters"><div><strong>05</strong><span>dias organizados</span></div><div><strong>02</strong><span>avaliações na semana</span></div><div><strong>01</strong><span>relatório para entregar</span></div><div><strong>04</strong><span>blocos de revisão</span></div></div>
        <nav class="agenda-day-nav" aria-label="Escolher dia da agenda">${days.map(([id,label],i)=>`<button type="button" data-agenda-day="${id}" aria-pressed="${i===0}">${label}</button>`).join('')}</nav>
        <p class="agenda-day-status" role="status" aria-live="polite">15 compromissos · semana inteira</p>
        <div class="agenda-events">${events.map(([day,date,label,time,title,desc,tone,tag])=>`<article class="agenda-event agenda-${tone}" data-day="${day}"><div class="agenda-event-top"><span>${label} · ${date}/11</span><small>${tag}</small></div><time>${time}</time><h4>${title}</h4><p>${desc}</p></article>`).join('')}</div></div>
        <div class="agenda-panels"><article class="agenda-panel agenda-exams"><span class="agenda-panel-label">Provas & avaliações</span><h3>Você sabe o que vem pela frente.</h3><p>Data, assunto, formato e preparação ficam próximos. Assim, a prova entra no planejamento antes de virar a única prioridade da semana.</p><div class="agenda-record"><div><span>11 NOV</span><strong>Seminário de Patologia</strong></div><p>Em grupo · inflamação e mecanismos de lesão.</p><ul><li>Reunir o conteúdo do grupo</li><li>Revisar slides e referências</li><li>Ensaiar a apresentação</li></ul><span class="agenda-pill">Preparação distribuída na semana</span></div><div class="agenda-record"><div><span>13 NOV</span><strong>Prova de Patologia</strong></div><p>Prova teórica · inflamação, lesão celular e reparo.</p><ul><li>Retomar os resumos por assunto</li><li>Resolver questões e registrar erros</li><li>Revisar os conceitos ainda frágeis</li></ul><span class="agenda-pill">Revisão final na quinta-feira</span></div></article>
        <article class="agenda-panel agenda-revisions"><span class="agenda-panel-label">Revisões & continuidade</span><h3>O conteúdo de hoje volta ao seu plano.</h3><p>O estudo novo não fica isolado. Você separa momentos para recuperar ideias, conferir dúvidas e voltar aos assuntos que ainda precisam de atenção.</p><ol class="agenda-review-path"><li><b>Segunda</b><strong>Ciclo cardíaco</strong><p>Conectar o resumo de Fisiologia à aula de Semiologia e tentar responder aos cartões.</p></li><li><b>Terça</b><strong>Dúvidas da UBS</strong><p>Retomar os pontos da atividade supervisionada e organizar perguntas para a preceptoria.</p></li><li><b>Quinta</b><strong>Patologia pré-prova</strong><p>Usar os erros das questões para escolher o que vale rever antes da avaliação.</p></li><li><b>Sexta</b><strong>Fechamento da semana</strong><p>Registrar o que ficou claro e o que precisa voltar ao cronograma seguinte.</p></li></ol></article>
        <article class="agenda-panel agenda-deliveries"><span class="agenda-panel-label">Trabalhos & prazos</span><h3>Uma entrega dividida em passos.</h3><p>Não é só lembrar a data final: é separar o que precisa acontecer antes dela, considerando o estágio, as aulas e os períodos disponíveis.</p><div class="agenda-deadline"><span>QUINTA · 12/11 · ATÉ 18H</span><h4>Relatório de prática de Histologia</h4><p>Formato PDF · texto revisado e referências organizadas.</p></div><div class="agenda-task-list">${[['Seg · 09','Separar objetivo e observações','done'],['Qua · 11','Revisar o texto e as referências','current'],['Qui · 12','Conferir o arquivo e entregar','next']].map(([date,title,status])=>`<div class="agenda-task ${status}"><i aria-hidden="true">${status==='done'?'✓':status==='current'?'2':'3'}</i><span><small>${date}</small><strong>${title}</strong></span></div>`).join('')}</div><p class="agenda-small-note">O bloco de escrita fica fora do horário de estágio: o plano respeita os compromissos já assumidos.</p></article></div>
        <article class="agenda-stage-bridge"><div><span class="agenda-kicker">Estágio, prática e preceptoria</span><h3>A prática também organiza o que você vai estudar.</h3><p>Antes da atividade, você prepara o objetivo e o roteiro. Depois, registra aprendizados e dúvidas. O retorno da supervisão ajuda a definir o próximo bloco de estudo.</p></div><div class="agenda-stage-steps"><div><span>ANTES</span><strong>Preparar</strong><p>Objetivo da atividade, materiais e conteúdo para retomar.</p></div><div><span>DEPOIS</span><strong>Registrar</strong><p>Aprendizados, dúvidas e pontos discutidos com a equipe.</p></div><div><span>PRÓXIMO PASSO</span><strong>Revisar</strong><p>Resumo correspondente, flashcards e nova discussão.</p></div></div></article>
        <footer class="agenda-takeaway"><span>Do semestre para a semana. Da semana para o que fazer hoje.</span><p>Planejar aulas, acompanhar provas, dividir trabalhos em etapas, retomar revisões e reservar tempo para a prática — com cada compromisso no seu contexto.</p></footer>
      </section>`;
      agendaAnchor.after(el(agendaMarkup));
      const agenda=document.querySelector('.agenda-lab');
      agenda.querySelectorAll('[data-agenda-day]').forEach(button=>button.addEventListener('click',()=>{
        const day=button.dataset.agendaDay;let visible=0;
        agenda.querySelectorAll('[data-agenda-day]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
        agenda.querySelectorAll('.agenda-event').forEach(card=>{card.hidden=day!=='todos'&&card.dataset.day!==day;if(!card.hidden)visible++;});
        agenda.querySelector('.agenda-day-status').textContent=`${visible} compromissos · ${day==='todos'?'semana inteira':button.textContent}`;
      }));
    }

    // Encapsulate reading sheets while preserving every original node and paragraph.
    function encapsulate(card,titleNode,bodyNodes){
      if(!titleNode||!bodyNodes.length)return;
      const details=document.createElement('details');details.className='compact-disclosure reading-reveal';
      const summary=document.createElement('summary');
      summary.append(titleNode);const hint=document.createElement('span');hint.className='reading-hint';hint.textContent='Abrir ficha completa';summary.append(hint);
      details.append(summary);bodyNodes.forEach(node=>details.append(node));card.append(details);
    }
    if(sheetSection)Array.from(sheetSection.querySelectorAll('.max-w-3xl')).forEach(card=>{
      const title=Array.from(card.children).find(n=>n.querySelector('h3'));
      if(title)encapsulate(card,title,Array.from(card.children).filter(n=>n!==card.firstElementChild&&n!==title));
    });
    document.querySelectorAll('.study-sheet').forEach(card=>encapsulate(card,card.querySelector('header'),[card.querySelector('.sheet-body')]));
    if(sheetSection)Array.from(sheetSection.querySelectorAll('.reading-reveal')).slice(0,10).forEach(d=>d.dataset.mobileOpen='true');
    Array.from(document.querySelectorAll('.study-sheet .reading-reveal')).slice(0,3).forEach(d=>d.dataset.mobileOpen='true');
    const mobile=window.matchMedia('(max-width: 700px)');
    const applyDensity=()=>{
      document.querySelectorAll('.compact-disclosure').forEach(details=>details.open=!mobile.matches||details.dataset.mobileOpen==='true');
      bulk.setAttribute('aria-pressed',String(!mobile.matches));bulk.textContent=mobile.matches?'Abrir todas as respostas':'Recolher as respostas';
    };
    applyDensity();mobile.addEventListener('change',applyDensity);
  }
  fetch(contentUrl).then(r=>{if(!r.ok)throw Error('Conteúdo complementar indisponível');return r.json();}).then(data=>{
    if(sectionFor('Veja os flashcards'))expand(data);
    else{const obs=new MutationObserver(()=>{if(sectionFor('Veja os flashcards')){obs.disconnect();expand(data);}});obs.observe(document.getElementById('root'),{childList:true,subtree:true});}
  }).catch(error=>console.error('Caderno de Medicina:',error));
})();
