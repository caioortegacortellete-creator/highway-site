/* ============================================================
   DADOS DO CLIENTE — edite aqui. Topo, rodapé, links de WhatsApp,
   páginas de área e artigos são montados a partir deste arquivo.
   Dados fictícios — apenas para demonstração.
   ============================================================ */
const CONFIG = {
  nome: 'Rafael Duarte',
  escritorio: 'Rafael Duarte Advocacia',
  iniciais: 'RD',
  oab: 'OAB/PR 00.000',
  especialidade: 'Direito de Família e Sucessões',
  whatsapp: '5543999999999',            // só números, com 55 + DDD
  telefone: '(43) 99999-9999',
  email: 'contato@rafaelduarte.adv.br',
  endereco: 'Av. Higienópolis, 0000 · Sala 000',
  bairroCidade: 'Centro, Londrina/PR',
  cidade: 'Londrina/PR',
  horario: 'Segunda a sexta, das 9h às 18h',
  mapa: 'Londrina, PR',                  // endereço usado no mapa
  redes: { instagram: '#', linkedin: '#', facebook: '#' }
};

const AREAS = [
  {
    id: 'divorcio', titulo: 'Divórcio', icone: 'M8 4a4 4 0 1 0 0 8M16 4a4 4 0 1 1 0 8M3 20c0-3 2.5-5 5-5M21 20c0-3-2.5-5-5-5M12 3v18',
    foto: 'https://images.unsplash.com/photo-1562564055-71e051d33c19',
    resumo: 'Consensual ou litigioso, judicial ou em cartório, com atenção aos efeitos sobre filhos e patrimônio.',
    intro: [
      'O divórcio encerra o casamento, mas as decisões tomadas nesse momento continuam produzindo efeitos por muitos anos: na rotina dos filhos, na divisão dos bens e na vida financeira de cada um.',
      'Por isso, a condução começa pela compreensão do cenário completo, para que o caminho escolhido seja o mais adequado, seja um acordo em cartório ou um processo judicial.'
    ],
    quando: ['Antes de sair de casa ou assinar qualquer acordo', 'Quando há filhos menores ou bens a dividir', 'Se não há consenso sobre os termos da separação', 'Para entender se é possível fazer em cartório'],
    documentos: ['Certidão de casamento atualizada', 'Documentos pessoais do casal', 'Certidão de nascimento dos filhos', 'Documentos dos bens (imóveis, veículos, contas)'],
    faq: [
      ['O divórcio pode ser feito em cartório?', 'Em muitos casos, sim, especialmente quando há acordo entre o casal. Os requisitos variam conforme a situação, e isso é avaliado logo na primeira conversa.'],
      ['Preciso da concordância da outra parte?', 'Não. O divórcio é um direito e pode ser pedido mesmo sem concordância. Nesse caso, o caminho é judicial.'],
      ['A partilha precisa ser feita junto com o divórcio?', 'Não necessariamente. Em algumas situações, a partilha pode ser resolvida depois, o que é analisado caso a caso.']
    ]
  },
  {
    id: 'uniao-estavel', titulo: 'União estável', icone: 'M4 12a5 5 0 1 0 10 0a5 5 0 1 0-10 0M10 12a5 5 0 1 0 10 0a5 5 0 1 0-10 0',
    foto: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85',
    resumo: 'Reconhecimento, escritura e dissolução, com definição clara do regime de bens.',
    intro: [
      'A união estável gera direitos e deveres muito parecidos com os do casamento, e muitas vezes o casal só percebe isso no momento de uma separação ou de um falecimento.',
      'Formalizar a relação e escolher o regime de bens com orientação evita incertezas e protege os dois.'
    ],
    quando: ['Ao decidir morar juntos e formalizar a relação', 'Para escolher ou alterar o regime de bens', 'No fim da união, para organizar a partilha', 'Para garantir direitos previdenciários e sucessórios'],
    documentos: ['Documentos pessoais do casal', 'Comprovantes de residência em comum', 'Certidão de nascimento dos filhos, se houver', 'Documentos dos bens adquiridos'],
    faq: [
      ['União estável precisa ser registrada?', 'Não é obrigatório, mas a formalização por escritura traz segurança e facilita a prova da relação.'],
      ['Qual o regime de bens se não houver contrato?', 'Sem contrato, aplica-se em regra a comunhão parcial de bens.'],
      ['É possível converter em casamento?', 'Sim. A conversão pode ser feita diretamente no cartório de registro civil.']
    ]
  },
  {
    id: 'guarda', titulo: 'Guarda e convivência', icone: 'M5 6a3 3 0 1 0 6 0a3 3 0 1 0-6 0M14.8 9a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0-4.4 0M3 21v-4a5 5 0 0 1 10 0v4M13 21v-3a4 4 0 0 1 8 0v3',
    foto: 'https://images.unsplash.com/photo-1479142506502-19b3a3b7ff33',
    resumo: 'Guarda compartilhada ou unilateral e regime de convivência, com foco no bem-estar dos filhos.',
    intro: [
      'Quando os pais se separam, a prioridade é preservar a rotina e o vínculo dos filhos com os dois. A definição da guarda e da convivência organiza responsabilidades, horários e decisões do dia a dia.',
      'O trabalho busca acordos equilibrados sempre que possível e atua com firmeza quando o interesse da criança exige.'
    ],
    quando: ['Na separação, para organizar a rotina das crianças', 'Quando o acordo atual deixou de funcionar', 'Em mudanças de cidade de um dos pais', 'Se houver dificuldade no convívio com os filhos'],
    documentos: ['Certidão de nascimento dos filhos', 'Documentos pessoais dos pais', 'Comprovantes da rotina escolar e de saúde', 'Acordos ou decisões anteriores, se houver'],
    faq: [
      ['Guarda compartilhada é a regra?', 'Sim. Quando os dois pais estão aptos, a guarda compartilhada é a regra prevista em lei.'],
      ['Guarda compartilhada significa dividir o tempo igualmente?', 'Não necessariamente. Ela trata da divisão das responsabilidades; o tempo de convivência é definido conforme a rotina da criança.'],
      ['O acordo de convivência pode ser alterado?', 'Sim, sempre que as circunstâncias mudarem e o interesse dos filhos justificar.']
    ]
  },
  {
    id: 'pensao', titulo: 'Pensão alimentícia', icone: 'M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z',
    foto: 'https://images.unsplash.com/photo-1473186505569-9c61870c11f9',
    resumo: 'Fixação, revisão e cobrança, de acordo com a necessidade e a possibilidade.',
    intro: [
      'A pensão alimentícia deve equilibrar a necessidade de quem recebe e a possibilidade de quem paga. Quando essa equação muda, o valor também pode mudar.',
      'A atuação abrange desde a definição inicial até a revisão e a cobrança de valores em atraso.'
    ],
    quando: ['Para definir o valor na separação', 'Quando a renda ou as necessidades mudaram', 'Se os pagamentos estão atrasados', 'Para encerrar a obrigação quando cabível'],
    documentos: ['Certidão de nascimento dos filhos', 'Comprovantes de despesas (escola, saúde, moradia)', 'Comprovantes de renda disponíveis', 'Decisão ou acordo anterior, se houver'],
    faq: [
      ['Existe um percentual fixo de pensão?', 'Não. O valor é definido caso a caso, considerando necessidade e possibilidade.'],
      ['A pensão acaba aos 18 anos?', 'Não automaticamente. Pode continuar, por exemplo, durante os estudos, conforme a situação.'],
      ['O que fazer se a pensão não for paga?', 'É possível cobrar os valores em atraso judicialmente, com medidas previstas em lei.']
    ]
  },
  {
    id: 'partilha', titulo: 'Partilha de bens', icone: 'M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6',
    foto: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407',
    resumo: 'Divisão de imóveis, empresas e investimentos conforme o regime de bens.',
    intro: [
      'A divisão do patrimônio costuma ser o ponto mais sensível de uma separação. Imóveis financiados, empresas e investimentos exigem análise cuidadosa do regime de bens e da origem de cada bem.',
      'O objetivo é uma partilha justa, clara e segura, evitando disputas futuras.'
    ],
    quando: ['No divórcio ou no fim da união estável', 'Quando há empresa, financiamento ou dívida em comum', 'Se houver dúvida sobre o que entra na divisão', 'Para formalizar uma partilha já combinada'],
    documentos: ['Certidão de casamento ou escritura de união', 'Matrículas e documentos de imóveis', 'Documentos de veículos e contas', 'Contrato social de empresas, se houver'],
    faq: [
      ['Bens recebidos de herança entram na partilha?', 'Na comunhão parcial, em regra, não. Cada regime tem suas regras, e a análise é feita caso a caso.'],
      ['E se o imóvel ainda estiver financiado?', 'É possível partilhar os direitos sobre o imóvel e as parcelas pagas durante a relação.'],
      ['A partilha pode ser feita em cartório?', 'Sim, quando há acordo entre as partes e os requisitos legais são atendidos.']
    ]
  },
  {
    id: 'inventario', titulo: 'Inventário e sucessões', icone: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7',
    foto: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744',
    resumo: 'Inventário judicial ou em cartório, testamento e planejamento sucessório.',
    intro: [
      'Após a perda de um familiar, o inventário organiza a transferência do patrimônio aos herdeiros. Conduzido com método, ele evita custos desnecessários e desgastes entre a família.',
      'Também é possível planejar a sucessão em vida, com testamento e outros instrumentos, trazendo tranquilidade para todos.'
    ],
    quando: ['Após o falecimento de um familiar com bens', 'Para planejar a sucessão em vida', 'Quando há divergência entre os herdeiros', 'Para regularizar bens de inventários antigos'],
    documentos: ['Certidão de óbito', 'Documentos do falecido e dos herdeiros', 'Documentos dos bens (imóveis, veículos, contas)', 'Testamento, se houver'],
    faq: [
      ['Existe prazo para abrir o inventário?', 'Sim. A lei prevê prazo para a abertura, e o atraso pode gerar multa sobre o imposto em vários estados.'],
      ['Inventário pode ser feito em cartório?', 'Sim, quando há acordo entre os herdeiros e os requisitos legais são atendidos.'],
      ['Vale a pena fazer planejamento sucessório?', 'Em muitos casos, sim. Ele organiza a transmissão do patrimônio e reduz conflitos futuros.']
    ]
  }
];

const ARTIGOS = [
  {
    id: 'divorcio-em-cartorio', area: 'divorcio', data: '14 out 2026', leitura: '4 min',
    titulo: 'Divórcio em cartório: quando é possível e como funciona',
    resumo: 'O divórcio extrajudicial costuma ser mais rápido. Entenda em quais situações ele é uma opção.',
    foto: 'https://images.unsplash.com/photo-1562564055-71e051d33c19',
    corpo: [
      ['p', 'Muita gente imagina que todo divórcio precisa passar por um processo judicial. Na prática, quando existe acordo entre o casal, o caminho pode ser bem mais simples: a escritura pública em cartório.'],
      ['h2', 'O que é o divórcio extrajudicial'],
      ['p', 'É o divórcio feito por escritura pública, em um cartório de notas, sem necessidade de processo. O casal define os termos em conjunto e cada um é assistido por advogado, que pode ser comum aos dois.'],
      ['h2', 'Quando ele é possível'],
      ['p', 'O requisito central é o consenso: os dois precisam concordar com o divórcio e com as condições, como a partilha de bens e eventual pensão entre o casal. Quando há filhos menores, as questões relativas a eles, como guarda e alimentos, precisam estar resolvidas na forma exigida pelas normas atuais.'],
      ['h2', 'Quais as vantagens'],
      ['p', 'Em geral, o procedimento é mais rápido e menos desgastante. Ainda assim, o acordo precisa ser bem construído: um termo mal redigido pode gerar discussões anos depois, especialmente sobre bens.'],
      ['h2', 'Por onde começar'],
      ['p', 'O primeiro passo é uma conversa para entender a situação do casal, os bens envolvidos e se todos os requisitos estão presentes. A partir disso, é possível indicar o caminho mais seguro.']
    ]
  },
  {
    id: 'guarda-compartilhada', area: 'guarda', data: '02 out 2026', leitura: '5 min',
    titulo: 'Guarda compartilhada: o que realmente muda na rotina',
    resumo: 'Guarda compartilhada não significa dividir o tempo ao meio. Veja como ela funciona na prática.',
    foto: 'https://images.unsplash.com/photo-1479142506502-19b3a3b7ff33',
    corpo: [
      ['p', 'A guarda compartilhada é a regra quando os dois pais estão aptos a exercer o poder familiar. Mesmo assim, ela ainda gera muitas dúvidas.'],
      ['h2', 'Responsabilidade dividida'],
      ['p', 'Compartilhar a guarda significa que as decisões importantes sobre a vida dos filhos, como escola, saúde e atividades, são tomadas em conjunto pelos dois.'],
      ['h2', 'E o tempo de convivência?'],
      ['p', 'O tempo com cada um dos pais é definido de acordo com a rotina da criança, a distância entre as casas e outros fatores. Ele não precisa ser exatamente igual para que a guarda seja compartilhada.'],
      ['h2', 'Quando o acordo precisa mudar'],
      ['p', 'Mudanças de cidade, de trabalho ou da própria fase de vida dos filhos podem exigir ajustes. Sempre que o interesse da criança justificar, o acordo pode ser revisto.']
    ]
  },
  {
    id: 'primeiros-passos-inventario', area: 'inventario', data: '18 set 2026', leitura: '4 min',
    titulo: 'Inventário: quais são os primeiros passos',
    resumo: 'Depois da perda de um familiar, organizar o inventário cedo evita multas e desgastes.',
    foto: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744',
    corpo: [
      ['p', 'Lidar com a burocracia logo após a perda de alguém próximo é difícil. Mas alguns cuidados nas primeiras semanas evitam problemas maiores depois.'],
      ['h2', 'Atenção ao prazo'],
      ['p', 'A lei prevê um prazo para a abertura do inventário. Em vários estados, o atraso gera multa sobre o imposto de transmissão (ITCMD).'],
      ['h2', 'Reúna os documentos'],
      ['p', 'Certidão de óbito, documentos do falecido e dos herdeiros e documentos de todos os bens: imóveis, veículos, contas e investimentos.'],
      ['h2', 'Cartório ou processo judicial?'],
      ['p', 'Quando os herdeiros estão de acordo e os requisitos legais são atendidos, o inventário pode ser feito em cartório, geralmente de forma mais rápida. Havendo divergência, o caminho é judicial.'],
      ['h2', 'Conte com orientação'],
      ['p', 'Cada família tem uma realidade. Uma análise inicial ajuda a definir o caminho, estimar custos e organizar as próximas etapas com tranquilidade.']
    ]
  }
];
