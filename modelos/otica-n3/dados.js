/* ============================================================
   DADOS DO CLIENTE — edite aqui. Topo, rodapé, links de WhatsApp,
   páginas de produto e artigos são montados a partir deste arquivo.
   Dados fictícios — apenas para demonstração.
   ============================================================ */
const CONFIG = {
  nome: 'Mirante',                       // nome curto (logo, marca d'água do rodapé)
  escritorio: 'Ótica Mirante',           // nome completo
  especialidade: 'Óculos de grau, óculos de sol e lentes de contato',
  desde: '2012',
  cnpj: '00.000.000/0001-00',
  whatsapp: '5544999999999',            // só números, com 55 + DDD
  telefone: '(44) 99999-9999',
  email: 'contato@oticamirante.com.br',
  endereco: 'Av. Brasil, 0000 · Loja 00',
  bairroCidade: 'Zona 01, Maringá/PR',
  cidade: 'Maringá/PR',
  horario: 'Segunda a sexta, das 9h às 18h',
  horarioSabado: 'Sábado, das 9h às 13h',
  mapa: 'Maringá, PR',                   // endereço usado no mapa
  responsavel: 'Fernanda Lima',
  cargoResponsavel: 'Fundadora · Óptica responsável',
  fotoResponsavel: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=300&h=300&q=75&auto=format&fit=crop&crop=faces',
  redes: { instagram: '#', facebook: '#' }
};

const PRODUTOS = [
  {
    id: 'oculos-de-grau', titulo: 'Óculos de grau', icone: 'M2.5 13a4 4 0 1 0 8 0a4 4 0 1 0-8 0M13.5 13a4 4 0 1 0 8 0a4 4 0 1 0-8 0M10.5 12.5c1-1 2-1 3 0M2.5 12 2 9M21.5 12l.5-3',
    foto: 'https://images.unsplash.com/photo-1486250944723-86bca2b15b06',
    resumo: 'Armações de acetato, metal e titânio, com lentes de laboratório escolhidas para a sua rotina.',
    intro: [
      'Um bom óculos de grau começa pela lente certa. Com a receita em mãos, a gente entende como é o seu dia (tela, leitura, volante) e indica o tratamento que faz diferença para você, como antirreflexo e filtro de luz azul.',
      'Depois vem a armação: formato, tamanho e material que combinam com o seu rosto e aguentam a sua rotina. As medidas são tiradas na loja, com o óculos no rosto.'
    ],
    indicado: ['Quem acabou de receber a primeira receita', 'Quem quer trocar a armação e manter as lentes', 'Quem passa muitas horas em frente a telas', 'Quem sente o óculos atual pesado ou desconfortável'],
    trazer: ['Receita do oftalmologista', 'O óculos que você usa hoje, se tiver', 'Uma ideia do estilo que você gosta (pode ser foto)', 'Documento com CPF, para a nota fiscal'],
    faq: [
      ['Posso trocar só a armação?', 'Sim. Se as lentes estiverem em bom estado e o formato permitir, dá para aproveitá-las em uma armação nova. Avaliamos na hora.'],
      ['Filtro de luz azul vale a pena?', 'Para quem passa muitas horas em telas, ele pode trazer mais conforto. Explicamos as opções e você decide.'],
      ['Em quanto tempo fica pronto?', 'As lentes mais comuns ficam prontas em poucos dias úteis. O prazo exato vai junto com o orçamento.']
    ]
  },
  {
    id: 'oculos-de-sol', titulo: 'Óculos de sol', icone: 'M8 12a4 4 0 1 0 8 0a4 4 0 1 0-8 0M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
    foto: 'https://images.unsplash.com/photo-1556015048-4d3aa10df74c',
    resumo: 'Proteção UV de verdade, com ou sem grau, inclusive com lentes polarizadas.',
    intro: [
      'Óculos de sol é proteção para os olhos, não só acessório. Todos os modelos da loja têm proteção contra raios UV, e as lentes polarizadas cortam o reflexo do asfalto, da água e do vidro dos carros.',
      'Quem usa óculos de grau também pode ter o seu: fazemos lentes solares com a sua receita, em armações próprias para o sol.'
    ],
    indicado: ['Quem usa óculos de grau e quer um par para o sol', 'Motoristas e quem pega estrada', 'Quem pratica esporte ao ar livre', 'Quem sente incômodo com a claridade'],
    trazer: ['Receita, se quiser lentes com grau', 'O óculos de sol atual, se for trocar as lentes', 'Uma ideia de uso: dirigir, praia, esporte'],
    faq: [
      ['Lente escura protege mais?', 'Não necessariamente. Quem protege é o filtro UV; a cor da lente só muda o conforto com a claridade.'],
      ['O que é lente polarizada?', 'É uma lente que corta o reflexo de superfícies como asfalto e água. Ajuda bastante quem dirige.'],
      ['Dá para fazer óculos de sol com grau?', 'Sim, inclusive multifocal. Basta trazer a receita.']
    ]
  },
  {
    id: 'multifocais', titulo: 'Lentes multifocais', icone: 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0M5 9h14M4 14h16',
    foto: 'https://images.unsplash.com/photo-1615468822882-4828d2602857',
    resumo: 'Longe, meia distância e perto em uma lente só, com medição feita na loja.',
    intro: [
      'A lente multifocal junta a visão de longe, a intermediária (como a tela do computador) e a de perto em uma lente só, sem a linha dos antigos bifocais.',
      'O segredo da adaptação está na medição: a altura das pupilas e a posição da armação no rosto definem onde fica cada campo. Por isso, ela é feita aqui, com calma, com o óculos já ajustado.'
    ],
    indicado: ['Quem começou a afastar o celular para ler', 'Quem alterna entre dois óculos e quer usar um só', 'Quem já usa multifocal e não se adaptou', 'Quem trabalha com computador e documentos'],
    trazer: ['Receita com adição para perto', 'O óculos atual, se já usa multifocal', 'Conte como é o seu trabalho e a sua rotina'],
    faq: [
      ['Todo mundo se adapta à multifocal?', 'A grande maioria, sim, especialmente com medição correta e a lente adequada. Nos primeiros dias, é normal estranhar as laterais.'],
      ['E se eu não me adaptar?', 'Volte à loja. Conferimos medidas, ajuste da armação e posição da lente antes de qualquer outra decisão.'],
      ['Qualquer armação serve?', 'Não. A armação precisa ter altura suficiente para os três campos. Ajudamos a escolher.']
    ]
  },
  {
    id: 'lentes-de-contato', titulo: 'Lentes de contato', icone: 'M3 12c2.5-4.5 5.5-6.5 9-6.5s6.5 2 9 6.5c-2.5 4.5-5.5 6.5-9 6.5S5.5 16.5 3 12ZM9 12a3 3 0 1 0 6 0a3 3 0 1 0-6 0',
    foto: 'https://images.unsplash.com/photo-1736012685132-227addb515fc',
    resumo: 'Descartáveis, tóricas para astigmatismo e coloridas, com orientação de uso.',
    intro: [
      'Lentes de contato dão liberdade para o esporte, para o trabalho e para quem simplesmente prefere não usar óculos o tempo todo.',
      'Trabalhamos com lentes diárias, mensais e tóricas (para astigmatismo), seguindo a indicação do seu oftalmologista. Na primeira compra, ensinamos a colocar, tirar e guardar com segurança.'
    ],
    indicado: ['Quem pratica esporte e quer mais liberdade', 'Quem quer alternar entre óculos e lentes', 'Quem já usa e quer repor com praticidade', 'Quem tem astigmatismo e quer lentes tóricas'],
    trazer: ['Receita específica para lentes de contato', 'A caixa da lente que você usa hoje, se tiver', 'Seu estojo, para conferirmos o estado'],
    faq: [
      ['A receita do óculos serve para lentes?', 'Não. A lente de contato tem medidas próprias, indicadas pelo oftalmologista em uma receita específica.'],
      ['Posso dormir de lente?', 'Só se o modelo e o seu médico permitirem. Na dúvida, tire sempre antes de dormir.'],
      ['De quanto em quanto tempo troco o estojo?', 'O ideal é trocar o estojo a cada reposição de lentes, ou pelo menos a cada três meses.']
    ]
  },
  {
    id: 'oculos-infantis', titulo: 'Óculos infantis', icone: 'M8 8a4 4 0 1 0 8 0a4 4 0 1 0-8 0M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7',
    foto: 'https://images.unsplash.com/photo-1594918794521-a0c01cdff8c0',
    resumo: 'Armações flexíveis e resistentes, no tamanho certo para não escorregar.',
    intro: [
      'Óculos de criança precisa ser confortável o bastante para ela esquecer que está usando. Por isso, trabalhamos com armações leves, flexíveis e no tamanho certo, que não escorregam no nariz.',
      'As lentes são mais resistentes a impacto, e a criança participa da escolha da cor, o que ajuda muito a aceitar o óculos no dia a dia.'
    ],
    indicado: ['Crianças com a primeira receita', 'Quem precisa trocar por causa do crescimento', 'Pais que buscam uma armação que aguente a rotina', 'Crianças que praticam esporte'],
    trazer: ['Receita do oftalmologista', 'A criança, para experimentar e medir', 'O óculos atual, se houver'],
    faq: [
      ['Com que frequência trocar o óculos da criança?', 'Depende do crescimento e das consultas com o oftalmologista. Revisamos o ajuste sempre que precisar.'],
      ['A lente infantil é diferente?', 'Indicamos materiais mais resistentes a impacto, mais seguros para a rotina das crianças.'],
      ['E se o óculos entortar?', 'Traga na loja. Ajustes são feitos na hora.']
    ]
  },
  {
    id: 'ajustes-e-consertos', titulo: 'Ajustes e consertos', icone: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4Z',
    foto: 'https://images.unsplash.com/photo-1765451817006-4a9f9cb3afc4',
    resumo: 'Plaquetas, hastes, parafusos, solda e alinhamento, muitas vezes na hora.',
    intro: [
      'Óculos torto, frouxo ou machucando o nariz incomoda e ainda atrapalha a visão, porque a lente sai do lugar certo.',
      'Fazemos ajustes, troca de plaquetas, hastes e parafusos, solda e alinhamento. Muitos reparos ficam prontos enquanto você espera, inclusive em óculos comprados em outro lugar.'
    ],
    indicado: ['Óculos torto, frouxo ou que machuca o nariz', 'Plaqueta amarelada ou parafuso solto', 'Haste quebrada ou armação desalinhada', 'Óculos que escorrega ao olhar para baixo'],
    trazer: ['O óculos (e o estojo, se tiver)', 'A peça quebrada, se ela se soltou'],
    faq: [
      ['Vocês consertam óculos de outra ótica?', 'Sim. Avaliamos o reparo e explicamos as opções antes de fazer.'],
      ['Ajuste tem custo?', 'Para clientes da loja, ajustes de rotina são sem custo. Consertos com troca de peças são orçados na hora.'],
      ['Quanto tempo demora?', 'Ajustes e trocas simples costumam ser feitos na hora. Soldas e peças especiais podem levar alguns dias.']
    ]
  }
];

const ARTIGOS = [
  {
    id: 'armacao-e-formato-do-rosto', produto: 'oculos-de-grau', data: '20 out 2026', leitura: '4 min',
    titulo: 'Como escolher a armação pelo formato do rosto',
    resumo: 'Rosto redondo, quadrado ou oval? Veja como o formato da armação muda o resultado no espelho.',
    foto: 'https://images.unsplash.com/photo-1544177586-c9b9fb1f45c2',
    corpo: [
      ['p', 'Na hora de escolher um óculos, muita gente experimenta dez modelos e sai sem saber por que um ficou melhor que o outro. Quase sempre, a resposta está no contraste entre o formato da armação e o do rosto.'],
      ['h2', 'Rosto redondo'],
      ['p', 'Armações retangulares ou quadradas, com linhas mais retas, dão contorno e alongam o rosto. Modelos muito redondos e pequenos tendem a reforçar o formato.'],
      ['h2', 'Rosto quadrado'],
      ['p', 'O maxilar marcado combina com armações redondas ou ovais, que suavizam os ângulos. Armações muito estreitas podem deixar o rosto mais largo.'],
      ['h2', 'Rosto oval'],
      ['p', 'É o formato que aceita quase tudo. Vale atenção ao tamanho: a armação deve acompanhar a largura do rosto, sem passar das têmporas.'],
      ['h2', 'Além do formato'],
      ['p', 'Cor, espessura e tamanho também contam, assim como a lente indicada na receita. Na loja, a gente olha tudo junto, com você na frente do espelho.']
    ]
  },
  {
    id: 'adaptacao-multifocal', produto: 'multifocais', data: '06 out 2026', leitura: '5 min',
    titulo: 'Multifocal: como são os primeiros dias de adaptação',
    resumo: 'Estranhar as laterais é normal no começo. Veja o que esperar e quando voltar à ótica.',
    foto: 'https://images.unsplash.com/photo-1615468822882-4828d2602857',
    corpo: [
      ['p', 'A lente multifocal é uma das maiores mudanças para quem usa óculos. Ela junta três distâncias em uma lente só, e o cérebro precisa de alguns dias para aprender onde olhar.'],
      ['h2', 'O que é normal sentir'],
      ['p', 'Nos primeiros dias, as laterais da lente podem parecer um pouco desfocadas, e descer escadas pede mais atenção. Isso costuma diminuir com o uso contínuo.'],
      ['h2', 'Dicas para se adaptar mais rápido'],
      ['p', 'Use o óculos o dia todo, e não só para ler. Para olhar para os lados, gire a cabeça, não só os olhos. Para ler, abaixe o olhar, mantendo o queixo reto.'],
      ['h2', 'Quando voltar à ótica'],
      ['p', 'Se depois de algumas semanas o desconforto continuar, volte à loja. Conferimos medidas, ajuste da armação e posição da lente. Muitas vezes, um pequeno ajuste resolve.']
    ]
  },
  {
    id: 'cuidados-lentes-de-contato', produto: 'lentes-de-contato', data: '22 set 2026', leitura: '4 min',
    titulo: 'Lentes de contato: 5 cuidados que fazem diferença',
    resumo: 'Higiene, estojo e tempo de uso: hábitos simples que deixam o uso mais seguro e confortável.',
    foto: 'https://images.unsplash.com/photo-1736012685132-227addb515fc',
    corpo: [
      ['p', 'Lentes de contato são práticas, mas exigem rotina. Alguns cuidados simples fazem toda a diferença para o conforto e a saúde dos olhos.'],
      ['h2', '1. Mãos limpas e secas'],
      ['p', 'Lave e seque bem as mãos antes de colocar ou tirar as lentes. É o cuidado mais simples e o mais importante.'],
      ['h2', '2. Solução sempre nova'],
      ['p', 'Nunca complete a solução antiga do estojo nem use água da torneira. Troque a solução todos os dias.'],
      ['h2', '3. Estojo também vence'],
      ['p', 'Troque o estojo a cada reposição de lentes, ou pelo menos a cada três meses, e deixe-o secar aberto.'],
      ['h2', '4. Respeite o tempo de uso'],
      ['p', 'Lente diária é para um dia; mensal, para um mês. Usar além do prazo aumenta o risco de irritação.'],
      ['h2', '5. Na dúvida, tire'],
      ['p', 'Olho vermelho, dor ou visão embaçada são sinais para tirar a lente e procurar o oftalmologista. Este conteúdo é informativo e não substitui a orientação médica.']
    ]
  }
];
