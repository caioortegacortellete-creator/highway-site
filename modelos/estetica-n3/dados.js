/* ============================================================
   DADOS DO CLIENTE — edite aqui. Topo, rodapé, links de WhatsApp,
   páginas de tratamento e artigos são montados a partir deste arquivo.
   Dados fictícios — apenas para demonstração.
   ============================================================ */
const CONFIG = {
  nome: 'Alba',                          // nome curto (logo, marca d'água do rodapé)
  escritorio: 'Clínica Alba',            // nome completo
  especialidade: 'Estética facial e corporal',
  desde: '2016',
  cnpj: '00.000.000/0001-00',
  whatsapp: '5545999999999',             // só números, com 55 + DDD
  telefone: '(45) 99999-9999',
  email: 'contato@clinicaalba.com.br',
  endereco: 'Av. Brasil, 0000 · Sala 00',
  bairroCidade: 'Centro, Cascavel/PR',
  cidade: 'Cascavel/PR',
  horario: 'Segunda a sexta, das 9h às 19h',
  horarioSabado: 'Sábado, das 9h às 13h',
  mapa: 'Cascavel, PR',                  // endereço usado no mapa
  responsavel: 'Camila Rocha',
  cargoResponsavel: 'Responsável técnica · Biomédica · CRBM 0000',
  fotoResponsavel: 'https://images.unsplash.com/photo-1781888683081-3ac4b43f21db?w=300&h=300&q=75&auto=format&fit=crop&crop=faces',
  redes: { instagram: '#', facebook: '#' }
};

const TRATAMENTOS = [
  {
    id: 'limpeza-de-pele', titulo: 'Limpeza de pele', icone: 'M12 3s6.5 7 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 10 12 3 12 3Z',
    foto: 'https://images.unsplash.com/photo-1761718210089-ba3bb5ccb54f',
    resumo: 'Higienização profunda e extração cuidadosa, com produtos escolhidos para o seu tipo de pele.',
    intro: [
      'A limpeza de pele remove o excesso de oleosidade, as células mortas e os cravos que a rotina de casa não alcança. É um bom ponto de partida para quem nunca fez nenhum tratamento facial.',
      'Cada sessão começa olhando a sua pele naquele dia. A partir disso, escolhemos os produtos, o tipo de extração e o que aplicar no final. A frequência é combinada com você, conforme o tipo de pele e a rotina.'
    ],
    indicado: ['Quem tem cravos e oleosidade', 'Quem quer começar uma rotina de cuidados', 'Quem vai iniciar outros tratamentos faciais', 'Quem quer orientação sobre produtos para casa'],
    trazer: ['Os produtos que você usa hoje no rosto', 'Lista de medicamentos em uso', 'Evite maquiagem pesada no dia', 'Conte se a pele anda mais sensível'],
    faq: [
      ['A pele fica marcada depois?', 'Pode ficar um pouco avermelhada por algumas horas, o que varia de pessoa para pessoa. Evite maquiagem e sol nesse dia, e siga as orientações que passamos no final.'],
      ['De quanto em quanto tempo devo fazer?', 'Depende do tipo de pele e da rotina. Combinamos a frequência depois da avaliação.'],
      ['Quem tem acne pode fazer?', 'Depende do momento da acne. Em alguns casos, é melhor tratar primeiro com um médico. Avaliamos e explicamos o caminho mais seguro.']
    ]
  },
  {
    id: 'peeling', titulo: 'Peeling', icone: 'M3 8h18M3 12h18M3 16h18',
    foto: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881',
    resumo: 'Renovação da camada superficial da pele, com o ácido e a concentração definidos na avaliação.',
    intro: [
      'O peeling usa ácidos para renovar a camada superficial da pele. Existem vários tipos, e a escolha depende do que incomoda você, do seu tom de pele, da época do ano e de quanto sol você pega no dia a dia.',
      'Antes da primeira sessão, às vezes é preciso preparar a pele em casa. Depois dela, o protetor solar deixa de ser opção e vira regra: é ele que protege o que foi feito.'
    ],
    indicado: ['Quem se incomoda com manchas superficiais', 'Quem nota a textura irregular', 'Quem quer mais uniformidade no tom da pele', 'Quem consegue seguir os cuidados com o sol'],
    trazer: ['Os produtos que você usa hoje no rosto', 'Lista de medicamentos em uso', 'Conte se tomou sol nos últimos dias', 'Conte se tem histórico de manchas ou herpes'],
    faq: [
      ['Vai descamar muito?', 'Depende do tipo de peeling e da pele. Explicamos o que esperar antes da sessão, para você escolher uma data que combine com a sua agenda.'],
      ['Posso fazer no verão?', 'Alguns tipos sim, outros é melhor deixar para outra época. Isso é definido na avaliação, considerando a sua rotina de sol.'],
      ['Quantas sessões são necessárias?', 'Varia de pessoa para pessoa. Passamos uma estimativa na avaliação e revemos a cada retorno.']
    ]
  },
  {
    id: 'microagulhamento', titulo: 'Microagulhamento', icone: 'M5 5h.01M12 5h.01M19 5h.01M5 12h.01M12 12h.01M19 12h.01M5 19h.01M12 19h.01M19 19h.01',
    foto: 'https://images.unsplash.com/photo-1713085085470-fba013d67e65',
    resumo: 'Estímulo da produção de colágeno, indicado para textura da pele e marcas de acne.',
    intro: [
      'O microagulhamento faz microperfurações controladas na pele, que estimulam o próprio organismo a produzir colágeno. É feito com material estéril e, quando indicado, com anestésico tópico.',
      'A pele leva um tempo para responder, por isso o tratamento costuma ser feito em sessões espaçadas. O número e o intervalo são definidos na avaliação e revistos ao longo do caminho.'
    ],
    indicado: ['Quem tem marcas de acne', 'Quem se incomoda com poros e textura', 'Quem busca estímulo de colágeno', 'Quem aceita alguns dias de recuperação'],
    trazer: ['Lista de medicamentos em uso', 'Conte sobre alergias e cicatrização', 'Evite sol intenso nos dias anteriores', 'Reserve os dias seguintes sem exposição ao sol'],
    faq: [
      ['Dói?', 'A sensibilidade varia. Quando indicado, usamos anestésico tópico para deixar a sessão mais confortável.'],
      ['Quanto tempo a pele leva para se recuperar?', 'Costuma ficar avermelhada por alguns dias. Passamos todas as orientações por escrito para esse período.'],
      ['Todo mundo pode fazer?', 'Não. Acne ativa, algumas doenças de pele e certos medicamentos pedem outro caminho. Por isso a avaliação vem antes.']
    ]
  },
  {
    id: 'harmonizacao-facial', titulo: 'Harmonização facial', icone: 'M4.5 12a7.5 9.5 0 1 0 15 0a7.5 9.5 0 1 0-15 0M9 10h.01M15 10h.01M9.5 15c1.5 1.2 3.5 1.2 5 0',
    foto: 'https://images.unsplash.com/photo-1552693673-1bf958298935',
    resumo: 'Toxina botulínica e preenchedores aplicados por profissional habilitada, respeitando os seus traços.',
    intro: [
      'Harmonização não é um procedimento só: é um conjunto de possibilidades, como toxina botulínica e preenchedores, planejado depois de olhar o seu rosto como um todo. O objetivo é respeitar os seus traços, sem exagero.',
      'A aplicação é feita somente por profissional habilitada, com produtos registrados, em ambiente preparado. Se algo não for indicado para você, dizemos isso na avaliação. Você pode levar o tempo que precisar para decidir.'
    ],
    indicado: ['Quem se incomoda com linhas de expressão', 'Quem quer entender as opções antes de decidir', 'Quem busca um plano gradual e acompanhado', 'Quem prefere um resultado discreto'],
    trazer: ['Lista de medicamentos em uso', 'Conte sobre alergias e procedimentos anteriores', 'Fotos de procedimentos já feitos, se houver', 'As suas dúvidas anotadas'],
    faq: [
      ['Quem faz a aplicação?', 'Somente profissional habilitada, com registro no conselho de classe. O nome e o registro da responsável técnica estão no site.'],
      ['Quanto tempo dura?', 'Varia conforme o produto, a área e o organismo de cada pessoa. Explicamos o que esperar de cada opção na avaliação.'],
      ['Grávidas podem fazer?', 'Não são procedimentos indicados durante a gravidez e a amamentação. Avise na avaliação.']
    ]
  },
  {
    id: 'depilacao-a-laser', titulo: 'Depilação a laser', icone: 'M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8',
    foto: 'https://images.unsplash.com/photo-1700760933574-9f0f4ea9aa3b',
    resumo: 'Sessões por área do corpo, com os parâmetros ajustados ao seu tom de pele e tipo de pelo.',
    intro: [
      'O laser age no folículo do pelo. Como os pelos crescem em ciclos, o tratamento é feito em várias sessões, com intervalo definido conforme a área do corpo.',
      'Antes de começar, avaliamos o seu tom de pele e o tipo de pelo para ajustar o aparelho. Também explicamos os cuidados com o sol e com outros métodos de depilação entre as sessões.'
    ],
    indicado: ['Quem tem foliculite ou pelos encravados', 'Quem quer reduzir a frequência da depilação', 'Quem precisa de orientação sobre pele e pelo', 'Quem prefere sessões curtas e marcadas'],
    trazer: ['Lista de medicamentos em uso', 'Conte se tomou sol recentemente', 'Pergunte como preparar a área antes', 'Evite cera e pinça entre as sessões'],
    faq: [
      ['Quantas sessões vou precisar?', 'Depende da área, do tipo de pelo e do organismo. Passamos uma estimativa na avaliação, sem prometer um número fixo.'],
      ['Funciona em qualquer tom de pele?', 'Os parâmetros mudam conforme a pele e o pelo, e nem todo pelo responde igual. Por isso avaliamos antes de começar.'],
      ['Posso tomar sol durante o tratamento?', 'A exposição ao sol pede cuidado. Explicamos os prazos e os cuidados para cada caso.']
    ]
  },
  {
    id: 'massagem-e-drenagem', titulo: 'Massagem e drenagem', icone: 'M3 9c3-3 6 3 9 0s6-3 9 0M3 15c3-3 6 3 9 0s6-3 9 0',
    foto: 'https://images.unsplash.com/photo-1706795033728-9232ef548a16',
    resumo: 'Drenagem linfática e massagem modeladora, para a sensação de leveza e o bem-estar do dia a dia.',
    intro: [
      'A drenagem linfática usa movimentos suaves e ritmados, e costuma trazer sensação de leveza para quem passa muito tempo sentado ou em pé. A massagem modeladora tem movimentos mais firmes e também entra no plano quando faz sentido.',
      'As sessões podem ser avulsas ou em pacote. Depois de cirurgias, a drenagem só é feita com a liberação do seu médico.'
    ],
    indicado: ['Quem sente as pernas pesadas no fim do dia', 'Quem passa muito tempo sentada ou em pé', 'Quem quer incluir uma pausa na rotina', 'Quem tem liberação médica no pós-operatório'],
    trazer: ['Liberação médica, se for pós-operatório', 'Conte sobre problemas de saúde', 'Venha com roupa confortável', 'Beba água ao longo do dia'],
    faq: [
      ['Qual a diferença entre drenagem e modeladora?', 'A drenagem é suave e ritmada; a modeladora é mais firme. Na avaliação, conversamos sobre qual combina com o que você procura.'],
      ['Grávidas podem fazer?', 'Só depois de conversar com o obstetra e com a técnica adaptada. Avise na hora de agendar.'],
      ['Vendem pacotes?', 'Sim. Na avaliação, passamos as opções de sessões avulsas e pacotes.']
    ]
  }
];

const ARTIGOS = [
  {
    id: 'protetor-solar-no-dia-a-dia', tratamento: 'peeling', titulo: 'Protetor solar: o cuidado que vale mais do que parece',
    resumo: 'Quanto usar, quando reaplicar e por que ele faz parte de qualquer tratamento para a pele.',
    foto: 'https://images.unsplash.com/photo-1599847987657-881f11b92a75', data: 'Setembro de 2026', leitura: '3 min',
    corpo: [
      ['p', 'Se existe um hábito que acompanha todos os tratamentos para a pele, é o protetor solar. Ele não é só para o dia de praia: a radiação também chega perto da janela do carro e na caminhada até o trabalho.'],
      ['h2', 'Quanto usar'],
      ['p', 'Uma referência fácil é aplicar o suficiente para cobrir bem o rosto e o pescoço, sem economizar. Pouco produto significa menos proteção do que está escrito na embalagem.'],
      ['h2', 'Quando reaplicar'],
      ['p', 'Se você fica ao ar livre, sua ou entra na água, reaplique ao longo do dia. Em dias de escritório, uma nova camada antes de sair também ajuda.'],
      ['h2', 'E durante um tratamento?'],
      ['p', 'Depois de peelings e microagulhamento, a pele pede ainda mais cuidado. Passamos as orientações por escrito, porque seguir essa parte em casa faz diferença.']
    ]
  },
  {
    id: 'primeira-limpeza-de-pele', tratamento: 'limpeza-de-pele', titulo: 'Primeira limpeza de pele: o que esperar da sessão',
    resumo: 'Do que acontece na maca aos cuidados das horas seguintes, para você chegar sem dúvidas.',
    foto: 'https://images.unsplash.com/photo-1670201203150-bf8771401590', data: 'Agosto de 2026', leitura: '3 min',
    corpo: [
      ['p', 'Muita gente adia a primeira limpeza de pele por não saber como ela funciona. A sessão é mais simples do que parece, e você pode perguntar o que quiser em qualquer momento.'],
      ['h2', 'Como é a sessão'],
      ['p', 'Primeiro, olhamos a sua pele e conversamos sobre a sua rotina. Depois vêm a higienização, a esfoliação, o preparo da pele, a extração e, no final, a máscara e o protetor solar.'],
      ['h2', 'E depois?'],
      ['p', 'A pele pode ficar um pouco avermelhada por algumas horas, o que varia de pessoa para pessoa. Evite maquiagem e sol nesse dia, e siga as orientações que passamos no final.'],
      ['h2', 'Como preparar a pele'],
      ['p', 'Venha sem maquiagem pesada e conte quais produtos você usa. Se estiver com alguma lesão ou irritação, avise antes: às vezes é melhor remarcar.']
    ]
  },
  {
    id: 'como-escolher-uma-clinica', tratamento: 'harmonizacao-facial', titulo: 'Cinco perguntas para fazer antes de um procedimento estético',
    resumo: 'O que vale conferir antes de decidir, para escolher com calma e segurança.',
    foto: 'https://images.unsplash.com/photo-1693004927824-f2623bbedc8b', data: 'Julho de 2026', leitura: '4 min',
    corpo: [
      ['p', 'Um procedimento estético é uma decisão sobre o seu corpo, e você tem o direito de entender tudo antes. Estas perguntas ajudam em qualquer clínica, inclusive aqui.'],
      ['h2', 'Quem vai fazer?'],
      ['p', 'Pergunte a formação e o registro profissional de quem vai realizar o procedimento. Você pode conferir esse registro no conselho de classe.'],
      ['h2', 'Qual produto será usado?'],
      ['p', 'Pergunte a marca e confirme se o produto tem registro na Anvisa. É um direito seu ver a embalagem.'],
      ['h2', 'O que pode dar errado?'],
      ['p', 'Todo procedimento tem riscos e contraindicações. Um bom atendimento explica isso antes, sem pressa, e diz o que fazer se algo sair do esperado.'],
      ['h2', 'Isso é indicado para mim?'],
      ['p', 'Desconfie de indicações feitas sem avaliação e de promessas de resultado. Se ficar em dúvida, leve o tempo que precisar para decidir.']
    ]
  }
];
