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
    const controls = el(`<div class="flash-toolbar"><div><strong>${data.totalCount} flashcards para explorar</strong><p>Perguntas e respostas abertas, organizadas por disciplina.</p></div><div class="flash-fields"><label>Buscar assunto<input type="search" id="med-card-search" placeholder="Ex.: coração, transporte, imunidade"></label><label>Disciplina<select id="med-card-category"><option value="">Todas as disciplinas</option>${cats.map(c=>`<option>${esc(c)}</option>`).join('')}</select></label></div><p id="med-card-count" role="status" aria-live="polite">${data.totalCount} cartões visíveis</p></div>`);
    originalGrid.before(controls);
    const cardGrid = document.createElement('div'); cardGrid.className='more-flash-grid';
    cardGrid.innerHTML = data.cards.map((c,i)=>`<article class="more-flashcard tone-${i%6}" data-category="${esc(c.cat)}"><div class="flash-meta"><span>${esc(c.cat)}</span><small>${String(i+data.originalCount+1).padStart(3,'0')}</small></div><span class="flash-kind">${esc(c.kind)}</span><h3>${esc(c.q)}</h3><div class="flash-answer"><span>Resposta</span><p>${esc(c.a)}</p></div></article>`).join('');
    originalGrid.after(cardGrid);
    const newCards=Array.from(cardGrid.children);
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
  }
  fetch(contentUrl).then(r=>{if(!r.ok)throw Error('Conteúdo complementar indisponível');return r.json();}).then(data=>{
    if(sectionFor('Veja os flashcards'))expand(data);
    else{const obs=new MutationObserver(()=>{if(sectionFor('Veja os flashcards')){obs.disconnect();expand(data);}});obs.observe(document.getElementById('root'),{childList:true,subtree:true});}
  }).catch(error=>console.error('Caderno de Medicina:',error));
})();
