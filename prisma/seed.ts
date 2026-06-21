import { PrismaClient, UserRole, ProcedureStatus } from "@prisma/client";

const prisma = new PrismaClient();

function J(arr: string[]): string {
  return JSON.stringify(arr);
}

function FAQ(items: { q: string; a: string }[]): string {
  return JSON.stringify(items.map((i) => ({ question: i.q, answer: i.a })));
}

const PLACEHOLDER = "https://placehold.co/800x600/E0C5AC/5F4B3C?text=Não+Realizado";
const COMBO_IMG = "https://images.pexels.com/photos/3738364/pexels-photo-3738364.jpeg?auto=compress&cs=tinysrgb&w=800";

const BEFORE_CILIOS = "• Chegar com os olhos limpos e sem maquiagem\n• Retirar lentes de contato antes\n• Evitar usar curvex no dia anterior\n• Não usar produtos oleosos na região dos olhos";
const AFTER_CILIOS = "• Evitar molhar os cílios por 24h\n• Não esfregar os olhos\n• Escovar os fios suavemente todo dia\n• Evitar produtos oleosos perto dos olhos";

const FAQ_CILIOS_PADRAO = FAQ([
  { q: "Quanto tempo dura?", a: "Com cuidados adequados, os cílios duram de 3 a 4 semanas. A manutenção é recomendada nesse período." },
  { q: "Posso molhar os cílios?", a: "Nas primeiras 24h, evite molhar. Depois disso, pode lavar normalmente com produto adequado." },
  { q: "Posso usar máscara de cílios?", a: "Não é necessário — o resultado já é bem marcante. Mas se quiser, use apenas nas pontas e sempre com removedor sem óleo." },
]);

const FAQ_MANUTENCAO = FAQ([
  { q: "Com que frequência devo fazer manutenção?", a: "A manutenção é recomendada entre 3 e 4 semanas após o procedimento inicial para repor os fios que caíram naturalmente." },
  { q: "Posso fazer manutenção em cílios de outro local?", a: "Sim, mas depende do estado dos fios. Victoria avalia antes de iniciar o procedimento." },
  { q: "A manutenção danifica os cílios naturais?", a: "Não, quando feita corretamente. Victoria retira apenas os fios com crescimento excessivo e repõe os que caíram." },
]);

async function main() {
  console.log("🌱 Seeding Espaço Vi database...");

  // ── Admin user ──
  const admin = await prisma.user.upsert({
    where: { email: "victoria@espacovi.com.br" },
    update: {},
    create: {
      email: "victoria@espacovi.com.br",
      name: "Victoria Aragão",
      role: UserRole.ADMIN,
    },
  });
  console.log("✓ Admin user:", admin.email);

  // ── Categories ──
  const categoriesData = [
    { name: "Cílios", slug: "cilios", order: 1 },
    { name: "Manutenção de cílios", slug: "manutencao-cilios", order: 2 },
    { name: "Combos", slug: "combos", order: 3 },
    { name: "Sobrancelhas", slug: "sobrancelhas", order: 4 },
    { name: "Pele", slug: "pele", order: 5 },
    { name: "Não realizado", slug: "nao-realizado", order: 6 },
  ];

  const categories: Record<string, string> = {};

  for (const cat of categoriesData) {
    const c = await prisma.procedureCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories[cat.slug] = c.id;
    console.log("✓ Category:", c.name);
  }

  // ── Procedures ──
  type ProcedureInput = {
    categoryId: string;
    name: string;
    slug: string;
    shortDescription?: string;
    description?: string;
    priceInCents?: number | null;
    durationMinutes?: number | null;
    badge?: string;
    indicatedFor?: string;
    expectedResult?: string;
    beforeCare?: string;
    afterCare?: string;
    internalNotes?: string;
    status?: ProcedureStatus;
    order?: number;
    benefitsJson?: string;
    faqJson?: string;
    isBookable?: boolean;
    notBookableMessage?: string;
    maintenanceIncluded?: boolean;
    maintenanceDurationMinutes?: number;
    imageUrl?: string | null;
    searchQuery?: string;
  };

  const procedures: ProcedureInput[] = [
    // ==================== CÍLIOS ====================
    {
      categoryId: categories["cilios"],
      name: "Fox Glow",
      slug: "fox-glow",
      shortDescription: "Cílios com efeito marcante, delicado e iluminado.",
      description:
        "O Fox Glow cria um efeito de olho amendoado alongado, com fios mais concentrados nos cantos externos para um resultado sedutor e sofisticado. Volume leve e elegante para quem gosta de cílios marcados sem pesar.",
      priceInCents: 15000,
      durationMinutes: 60,
      badge: "Queridinho das clientes",
      indicatedFor:
        "Ideal para quem quer um olhar mais alongado e expressivo, com acabamento clean e elegante.",
      expectedResult:
        "Olhar definido com efeito fox eye natural, fios que duram de 3 a 4 semanas com manutenção.",
      beforeCare: BEFORE_CILIOS,
      afterCare: AFTER_CILIOS,
      benefitsJson: J([
        "Efeito olho de gato natural",
        "Comprimento concentrado nos cantos externos",
        "Aplicação rápida em 1h",
        "Resultado sofisticado e atemporal",
      ]),
      faqJson: FAQ([
        {
          q: "Quanto tempo dura?",
          a: "Com cuidados adequados, os cílios duram de 3 a 4 semanas. A manutenção é recomendada nesse período.",
        },
        {
          q: "Posso molhar os cílios?",
          a: "Nas primeiras 24h, evite molhar. Depois disso, pode lavar normalmente com produto adequado.",
        },
        {
          q: "Posso usar máscara de cílios?",
          a: "Não é necessário — o resultado já é bem marcante. Mas se quiser, use apenas nas pontas e sempre com removedor sem óleo.",
        },
      ]),
      order: 1,
      imageUrl: "https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      categoryId: categories["cilios"],
      name: "Volume Brasileiro",
      slug: "volume-brasileiro",
      shortDescription: "Volume denso e homogêneo para um olhar poderoso e cheio.",
      description:
        "O Volume Brasileiro é a técnica preferida de quem ama cílios bem cheios e dramáticos. Cada fio natural recebe um feixe de fios ultrafinos, criando um resultado encorpado, uniforme e com muito impacto.",
      priceInCents: 14000,
      durationMinutes: 90,
      badge: "Volume",
      indicatedFor:
        "Para quem quer um olhar marcante, cheio e com presença — sem precisar de maquiagem.",
      expectedResult:
        "Olhar com volume intenso e uniforme, duração de 3 a 4 semanas com manutenção.",
      beforeCare: BEFORE_CILIOS,
      afterCare: AFTER_CILIOS,
      benefitsJson: J([
        "Volume intenso e uniforme",
        "Cílios que dispensam maquiagem",
        "Resultado durável com manutenção",
        "Leveza mesmo com muito volume",
      ]),
      faqJson: FAQ([
        {
          q: "É pesado?",
          a: "Não. Apesar do volume, os fios usados são ultrafinos e muito leves. A maioria das clientes nem sente.",
        },
        {
          q: "Quanto tempo dura?",
          a: "De 3 a 4 semanas. A manutenção mantém o resultado com muito menos custo.",
        },
        {
          q: "Posso fazer com poucos cílios naturais?",
          a: "Depende da quantidade. Na consulta, Victoria avalia o que é possível para o seu olhar.",
        },
      ]),
      order: 2,
      imageUrl: "https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      categoryId: categories["cilios"],
      name: "Volume Brasileiro Marrom",
      slug: "volume-brasileiro-marrom",
      shortDescription:
        "Volume Brasileiro com fios em tom marrom para um efeito mais natural e feminino.",
      description:
        "Tudo que você ama no Volume Brasileiro, mas em fios de tom marrom suave. O resultado é cheio de volume com uma vibe mais natural, perfeita para quem prefere um look menos intenso no contraste com os fios pretos.",
      priceInCents: 15000,
      durationMinutes: 90,
      badge: "Marrom",
      indicatedFor:
        "Para quem quer volume com um toque mais natural — ótimo para loiras, ruivas e quem prefere um olhar mais suave.",
      expectedResult:
        "Olhar volumoso e natural com fios em tom marrom que harmonizam com diferentes colorações de cabelo e sobrancelhas.",
      beforeCare: BEFORE_CILIOS,
      afterCare: AFTER_CILIOS,
      benefitsJson: J([
        "Fios em tom marrom para um visual mais natural",
        "Volume encorpado e uniforme",
        "Perfeito para loiras e ruivas",
        "Resultado delicado e feminino",
      ]),
      faqJson: FAQ([
        {
          q: "O tom marrom é para todo mundo?",
          a: "É mais indicado para quem tem cabelos ou sobrancelhas mais claros, mas Victoria avalia o que fica mais harmonioso para o seu rosto.",
        },
        {
          q: "Quanto tempo dura?",
          a: "De 3 a 4 semanas com os cuidados corretos. A manutenção mantém o resultado por mais tempo.",
        },
        {
          q: "Posso combinar com manutenção?",
          a: "Sim! Temos o combo Volume Brasileiro Marrom + manutenção com valor especial.",
        },
      ]),
      order: 3,
      imageUrl: "https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      categoryId: categories["cilios"],
      name: "Fox Glow Marrom",
      slug: "fox-glow-marrom",
      shortDescription:
        "O efeito fox glow em fios marrons para um olhar ainda mais natural e sofisticado.",
      description:
        "A delicadeza do Fox Glow encontra a suavidade dos fios em tom marrom. O resultado é um olhar alongado e sedutor, mas com um toque de naturalidade que encanta — ideal para quem quer se produzir sem parecer que usou extensões.",
      priceInCents: 16000,
      durationMinutes: 60,
      badge: "Marrom",
      indicatedFor:
        "Para quem quer o efeito fox eye com uma aparência mais natural e menos contrastante.",
      expectedResult:
        "Olhar fox eye sofisticado com fios marrons que criam uma transição suave e feminina.",
      beforeCare: BEFORE_CILIOS,
      afterCare: AFTER_CILIOS,
      benefitsJson: J([
        "Efeito fox eye com leveza natural",
        "Fios marrons para harmonia com traços delicados",
        "Aplicação rápida em 1h",
        "Visual sofisticado sem exageros",
      ]),
      faqJson: FAQ([
        {
          q: "Qual a diferença para o Fox Glow comum?",
          a: "A técnica é a mesma, mas os fios em tom marrom criam um resultado mais suave e natural, com menos contraste.",
        },
        {
          q: "Quanto tempo dura?",
          a: "De 3 a 4 semanas. Recomendamos a manutenção para conservar o efeito fox.",
        },
        {
          q: "Serve para quem tem cílios naturais finos?",
          a: "Sim. O Fox Glow usa fios mais finos, adequados para quem tem cílios naturais mais delicados.",
        },
      ]),
      order: 4,
      imageUrl: "https://images.pexels.com/photos/4737484/pexels-photo-4737484.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      categoryId: categories["cilios"],
      name: "Duo Blend",
      slug: "duo-blend",
      shortDescription:
        "Combinação de dois tipos de fios para um efeito texturizado e cheio de personalidade.",
      description:
        "O Duo Blend é uma técnica personalizada que mistura dois tipos de fios diferentes — variando em espessura, curvatura ou comprimento — para criar um resultado único, com textura e dimensão que chamam atenção. Cada aplicação é adaptada ao olhar de cada cliente.",
      priceInCents: null,
      durationMinutes: 90,
      badge: "Valor a confirmar",
      indicatedFor:
        "Para quem quer um resultado exclusivo e personalizado, diferente de qualquer técnica padrão.",
      expectedResult:
        "Olhar com textura e personalidade únicos, combinando dois tipos de fios para um efeito surpreendente.",
      beforeCare: BEFORE_CILIOS,
      afterCare: AFTER_CILIOS,
      status: ProcedureStatus.PRICE_TO_CONFIRM,
      internalNotes:
        "Preço a confirmar conforme combinação de fios escolhida. Avaliar na consulta.",
      benefitsJson: J([
        "Resultado exclusivo e personalizado",
        "Combinação de dois tipos de fios",
        "Textura e dimensão únicos",
        "Adaptado ao olhar de cada cliente",
      ]),
      faqJson: FAQ([
        {
          q: "Por que o preço é a confirmar?",
          a: "O Duo Blend é uma técnica personalizada — o valor depende da combinação de fios escolhida. Victoria informa o valor exato na consulta.",
        },
        {
          q: "Quanto tempo dura?",
          a: "De 3 a 4 semanas, seguindo os cuidados recomendados.",
        },
        {
          q: "Como é feita a escolha dos fios?",
          a: "Victoria avalia seu olhar e preferências para sugerir a melhor combinação de fios para você.",
        },
      ]),
      order: 5,
      imageUrl: null,
      searchQuery: "lash extensions duo blend mixed fibers eyelashes",
    },
    {
      categoryId: categories["cilios"],
      name: "Sublime 4D",
      slug: "sublime-4d",
      shortDescription:
        "Extensão com fios em camadas para um efeito natural e com profundidade.",
      description:
        "O Sublime 4D é pensado para quem quer um resultado bonito sem parecer exagerado. A técnica usa fios em camadas estratégicas, criando profundidade e movimento em cada olhar. O efeito é volumoso, mas delicado — como se os cílios fossem naturalmente assim.",
      priceInCents: 15500,
      durationMinutes: 90,
      indicatedFor:
        "Para quem quer volume com naturalidade — cílios cheios, mas sem a aparência de extensões exageradas.",
      expectedResult:
        "Olhar com profundidade e movimento natural, volume bem distribuído que parece genuíno.",
      beforeCare: BEFORE_CILIOS,
      afterCare: AFTER_CILIOS,
      benefitsJson: J([
        "Fios em camadas para efeito 4D",
        "Volume natural sem exageros",
        "Movimento e profundidade no olhar",
        "Duração de 3 a 4 semanas",
      ]),
      faqJson: FAQ_CILIOS_PADRAO,
      order: 6,
      imageUrl: "https://images.pexels.com/photos/3373747/pexels-photo-3373747.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      categoryId: categories["cilios"],
      name: "Sublime 4D Light",
      slug: "sublime-4d-light",
      shortDescription:
        "Versão mais delicada do Sublime 4D — leveza máxima com muito charme.",
      description:
        "O Sublime 4D Light traz tudo que o Sublime 4D tem de bom, mas com fios ainda mais finos e leves. O resultado é incrivelmente suave, quase imperceptível, mas que faz toda a diferença no olhar. Perfeito para quem não está acostumada com extensões ou prefere algo mais sutil.",
      priceInCents: 15500,
      durationMinutes: 90,
      badge: "Natural",
      indicatedFor:
        "Para iniciantes em extensão de cílios ou quem prefere um look ultra natural e discreto.",
      expectedResult:
        "Olhar levemente realçado com fios ultrafinos, resultado delicado e muito natural.",
      beforeCare: BEFORE_CILIOS,
      afterCare: AFTER_CILIOS,
      benefitsJson: J([
        "Fios ultrafinos para leveza máxima",
        "Efeito natural quase imperceptível",
        "Ideal para iniciantes",
        "Conforto total mesmo para olhos sensíveis",
      ]),
      faqJson: FAQ([
        {
          q: "É diferente do Sublime 4D?",
          a: "Sim. O Light usa fios ainda mais finos, criando um resultado mais suave e natural — ótimo para quem está começando.",
        },
        {
          q: "Quanto tempo dura?",
          a: "De 3 a 4 semanas com os cuidados corretos.",
        },
        {
          q: "Posso evoluir para outras técnicas depois?",
          a: "Sim! O Sublime 4D Light é ótimo para você se acostumar com extensões e depois experimentar técnicas com mais volume.",
        },
      ]),
      order: 7,
      imageUrl: "https://images.pexels.com/photos/2253832/pexels-photo-2253832.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      categoryId: categories["cilios"],
      name: "Volume 5D",
      slug: "volume-5d",
      shortDescription:
        "Cinco fios por fio natural para um resultado ultra denso e impactante.",
      description:
        "O Volume 5D aplica cinco fios ultrafinos em cada cílio natural, resultando em uma densidade impressionante. O olhar fica dramático, cheio e com aquele impacto que se nota de longe — sem perder a leveza característica das extensões de qualidade.",
      priceInCents: 16000,
      durationMinutes: 90,
      badge: "Volume",
      indicatedFor:
        "Para quem ama cílios muito cheios e dramáticos, com densidade máxima e muito impacto visual.",
      expectedResult:
        "Olhar ultra volumoso e denso, com cinco fios por fio natural para o máximo de impacto.",
      beforeCare: BEFORE_CILIOS,
      afterCare: AFTER_CILIOS,
      benefitsJson: J([
        "Cinco fios por cílio natural",
        "Densidade máxima e impacto visual",
        "Leveza apesar do volume intenso",
        "Resultado que dispensa qualquer maquiagem",
      ]),
      faqJson: FAQ([
        {
          q: "É pesado nos olhos?",
          a: "Não. Mesmo com 5 fios por cílio, os fios são ultrafinos e muito leves. A sensação é confortável.",
        },
        {
          q: "Quanto tempo dura?",
          a: "De 3 a 4 semanas. Com manutenção em dia, o volume se mantém impressionante.",
        },
        {
          q: "Meus cílios naturais aguentam?",
          a: "Sim, quando aplicados corretamente. Victoria avalia seus cílios antes para garantir uma aplicação saudável.",
        },
      ]),
      order: 8,
      imageUrl: "https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      categoryId: categories["cilios"],
      name: "Volume 5C",
      slug: "volume-5c",
      shortDescription:
        "Volume com curva marcada para cílios naturalmente mais retos.",
      description:
        "O Volume 5C combina densidade com uma curvatura especial para dar abertura ao olhar. Ideal para quem tem cílios naturais retos ou que tendem a cair, pois a curvatura acentuada cria a ilusão de olhos mais abertos e despertos. Volume cheio com efeito de olho wide-eye.",
      priceInCents: 16000,
      durationMinutes: 90,
      indicatedFor:
        "Para quem tem cílios naturalmente retos, olhos amendoados ou quer um efeito de olho mais aberto e acordado.",
      expectedResult:
        "Olhar aberto e expressivo com volume denso e curvatura acentuada para máxima abertura.",
      beforeCare: BEFORE_CILIOS,
      afterCare: AFTER_CILIOS,
      benefitsJson: J([
        "Curvatura especial que abre o olhar",
        "Ideal para cílios retos ou que caem",
        "Volume denso com efeito wide-eye",
        "Olhar desperto e expressivo",
      ]),
      faqJson: FAQ([
        {
          q: "Por que a letra C no nome?",
          a: "O C indica a curvatura especial dos fios, mais acentuada que o padrão, criando um efeito de abertura no olhar.",
        },
        {
          q: "Serve para quem tem cílios retos?",
          a: "É exatamente para isso! O Volume 5C foi feito para transformar cílios retos em cílios curvados e abertos.",
        },
        {
          q: "Quanto tempo dura?",
          a: "De 3 a 4 semanas. A manutenção conserva a curvatura e o volume.",
        },
      ]),
      order: 9,
      imageUrl: "https://images.pexels.com/photos/4046316/pexels-photo-4046316.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      categoryId: categories["cilios"],
      name: "Volume Glow",
      slug: "volume-glow",
      shortDescription:
        "O máximo em volume com acabamento impecável e efeito glow irresistível.",
      description:
        "O Volume Glow é a técnica mais completa do catálogo de cílios do Espaço Vi. Com até 6 fios por fio natural e acabamento cuidadoso ponto a ponto, o resultado é denso, uniforme e com aquele brilho de quem saiu pronto de um editorial. Para quem quer o melhor e não abre mão.",
      priceInCents: 17000,
      durationMinutes: 120,
      badge: "Premium",
      indicatedFor:
        "Para quem quer o máximo em volume, densidade e acabamento — perfeito para ocasiões especiais ou uso diário impecável.",
      expectedResult:
        "Olhar premium com volume máximo, fios distribuídos com perfeição e aquele brilho editorial que chama atenção.",
      beforeCare: BEFORE_CILIOS,
      afterCare: AFTER_CILIOS,
      benefitsJson: J([
        "Até 6 fios por cílio natural",
        "Acabamento ponto a ponto impecável",
        "Efeito glow e brilho editorial",
        "A técnica mais completa do Espaço Vi",
      ]),
      faqJson: FAQ([
        {
          q: "Por que o Volume Glow é o mais completo?",
          a: "Porque combina a maior quantidade de fios por cílio com um acabamento mais minucioso, resultando no olhar mais impactante e sofisticado do catálogo.",
        },
        {
          q: "Quanto tempo dura?",
          a: "De 3 a 4 semanas. Por ser muito denso, a manutenção é ainda mais importante para manter o resultado premium.",
        },
        {
          q: "Tem alguma contraindicação?",
          a: "Para quem tem poucos cílios naturais pode ser mais limitado. Victoria avalia no atendimento.",
        },
      ]),
      order: 10,
      imageUrl: "https://images.pexels.com/photos/5938395/pexels-photo-5938395.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      categoryId: categories["cilios"],
      name: "Remoção de cílios",
      slug: "remocao-cilios",
      shortDescription: "Remoção segura e sem dor das extensões de cílios.",
      description:
        "A remoção é feita com produtos especializados que dissolvem o adesivo sem agredir os fios naturais. Rápida, segura e sem dor — feita por profissional especializada para proteger a saúde dos seus cílios naturais.",
      priceInCents: 4000,
      durationMinutes: 30,
      indicatedFor:
        "Para quem deseja remover as extensões com segurança, preservando os cílios naturais.",
      expectedResult:
        "Remoção completa das extensões sem danos aos cílios naturais.",
      beforeCare: "• Chegar com os cílios secos\n• Informar se tiver sensibilidade nos olhos",
      afterCare:
        "• Evitar esfregar os olhos após a remoção\n• Aplicar sérum hidratante nos cílios para recuperação\n• Aguardar pelo menos 48h antes de uma nova aplicação",
      benefitsJson: J([
        "Remoção sem dor e sem danos",
        "Produtos profissionais e seguros",
        "Preserva os cílios naturais",
        "Procedimento rápido em 30 minutos",
      ]),
      faqJson: FAQ([
        {
          q: "Vai danificar meus cílios naturais?",
          a: "Não, quando feita por profissional. O produto dissolve apenas o adesivo, sem agredir os fios naturais.",
        },
        {
          q: "Posso fazer extensão logo depois?",
          a: "Recomendamos aguardar pelo menos 48h para que os cílios se recuperem antes de uma nova aplicação.",
        },
        {
          q: "Posso tentar remover em casa?",
          a: "Não recomendamos. A remoção em casa com produtos inadequados pode arrancar os cílios naturais. Vale a pena fazer com profissional.",
        },
      ]),
      order: 11,
      imageUrl: "https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=800",
    },

    // ==================== MANUTENÇÕES ====================
    {
      categoryId: categories["manutencao-cilios"],
      name: "Manutenção Volume Brasileiro",
      slug: "manutencao-volume-brasileiro",
      shortDescription:
        "Manutenção para reposição dos fios e conservação do resultado por mais tempo.",
      description:
        "A manutenção do Volume Brasileiro repõe os fios que caíram naturalmente com o ciclo de crescimento dos cílios. O resultado é renovado, o volume é restaurado e você sai como se tivesse acabado de fazer o procedimento completo.",
      priceInCents: 10000,
      durationMinutes: 60,
      badge: "Manutenção",
      indicatedFor:
        "Clientes que já realizaram o Volume Brasileiro e desejam conservar o resultado.",
      expectedResult:
        "Volume Brasileiro renovado, com fios repostos e resultado igual ao procedimento original.",
      beforeCare: BEFORE_CILIOS,
      afterCare: AFTER_CILIOS,
      benefitsJson: J([
        "Reposição dos fios caídos",
        "Resultado renovado por menos",
        "Mantém o volume e o acabamento",
        "Mais econômico que refazer do zero",
      ]),
      faqJson: FAQ_MANUTENCAO,
      order: 1,
      imageUrl: "https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      categoryId: categories["manutencao-cilios"],
      name: "Manutenção Volume Brasileiro Marrom",
      slug: "manutencao-volume-brasileiro-marrom",
      shortDescription:
        "Manutenção para reposição dos fios e conservação do resultado por mais tempo.",
      description:
        "A manutenção do Volume Brasileiro Marrom conserva o efeito natural e feminino dos fios em tom marrom. Os fios que caíram são repostos com o mesmo tom e técnica, mantendo o resultado impecável.",
      priceInCents: 11000,
      durationMinutes: 60,
      badge: "Manutenção",
      indicatedFor:
        "Clientes que já realizaram o Volume Brasileiro Marrom e querem conservar o resultado.",
      expectedResult:
        "Volume Brasileiro Marrom renovado, com a mesma leveza e naturalidade do procedimento original.",
      beforeCare: BEFORE_CILIOS,
      afterCare: AFTER_CILIOS,
      benefitsJson: J([
        "Fios marrons repostos com precisão",
        "Tom natural conservado",
        "Mais econômico que refazer",
        "Resultado idêntico ao original",
      ]),
      faqJson: FAQ_MANUTENCAO,
      order: 2,
      imageUrl: "https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      categoryId: categories["manutencao-cilios"],
      name: "Manutenção Fox Glow",
      slug: "manutencao-fox-glow",
      shortDescription:
        "Manutenção para reposição dos fios e conservação do resultado por mais tempo.",
      description:
        "A manutenção do Fox Glow preserva o efeito alongado e sedutor que você ama. Os fios nos cantos externos são repostos com cuidado para manter o mapeamento correto e o efeito fox eye impecável.",
      priceInCents: 11000,
      durationMinutes: 60,
      badge: "Manutenção",
      indicatedFor:
        "Clientes que já realizaram o Fox Glow e desejam conservar o efeito fox eye.",
      expectedResult:
        "Efeito fox eye preservado com fios repostos nos pontos estratégicos.",
      beforeCare: BEFORE_CILIOS,
      afterCare: AFTER_CILIOS,
      benefitsJson: J([
        "Efeito fox eye renovado",
        "Reposição precisa nos cantos externos",
        "Economia em relação ao procedimento completo",
        "Resultado como se fosse novo",
      ]),
      faqJson: FAQ_MANUTENCAO,
      order: 3,
      imageUrl: "https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      categoryId: categories["manutencao-cilios"],
      name: "Manutenção Fox Glow Marrom",
      slug: "manutencao-fox-glow-marrom",
      shortDescription:
        "Manutenção para reposição dos fios e conservação do resultado por mais tempo.",
      description:
        "A manutenção do Fox Glow Marrom repõe os fios em tom marrom nos pontos estratégicos, mantendo o efeito fox eye com a naturalidade característica dos fios marrons.",
      priceInCents: 12000,
      durationMinutes: 60,
      badge: "Manutenção",
      indicatedFor:
        "Clientes que já realizaram o Fox Glow Marrom e querem conservar o resultado.",
      expectedResult:
        "Fox Glow Marrom renovado, com a delicadeza dos fios marrons preservada.",
      beforeCare: BEFORE_CILIOS,
      afterCare: AFTER_CILIOS,
      benefitsJson: J([
        "Fios marrons repostos nos pontos estratégicos",
        "Efeito fox eye conservado",
        "Naturalidade do tom marrom mantida",
        "Econômico e eficiente",
      ]),
      faqJson: FAQ_MANUTENCAO,
      order: 4,
      imageUrl: "https://images.pexels.com/photos/4737484/pexels-photo-4737484.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      categoryId: categories["manutencao-cilios"],
      name: "Manutenção Sublime 4D",
      slug: "manutencao-sublime-4d",
      shortDescription:
        "Manutenção para reposição dos fios e conservação do resultado por mais tempo.",
      description:
        "A manutenção do Sublime 4D repõe os fios em camadas que se desprenderam, restaurando a profundidade e o movimento característicos da técnica. O resultado volta a parecer recém-feito.",
      priceInCents: 11500,
      durationMinutes: 60,
      badge: "Manutenção",
      indicatedFor:
        "Clientes que já realizaram o Sublime 4D e querem conservar o efeito em camadas.",
      expectedResult:
        "Profundidade e movimento do Sublime 4D restaurados, resultado como recém-feito.",
      beforeCare: BEFORE_CILIOS,
      afterCare: AFTER_CILIOS,
      benefitsJson: J([
        "Fios em camadas repostos",
        "Profundidade 4D restaurada",
        "Movimento natural conservado",
        "Mais econômico que refazer",
      ]),
      faqJson: FAQ_MANUTENCAO,
      order: 5,
      imageUrl: "https://images.pexels.com/photos/3373747/pexels-photo-3373747.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      categoryId: categories["manutencao-cilios"],
      name: "Manutenção Sublime 4D Light",
      slug: "manutencao-sublime-4d-light",
      shortDescription:
        "Manutenção para reposição dos fios e conservação do resultado por mais tempo.",
      description:
        "A manutenção do Sublime 4D Light conserva a leveza e a sutileza dos fios ultrafinos, repostos com o mesmo cuidado do procedimento original. Ideal para quem preza pelo resultado natural e discreto.",
      priceInCents: 11500,
      durationMinutes: 60,
      badge: "Manutenção",
      indicatedFor:
        "Clientes que já realizaram o Sublime 4D Light e querem conservar o efeito ultra natural.",
      expectedResult:
        "Leveza e naturalidade do Sublime 4D Light preservadas, resultado renovado sem perder a sutileza.",
      beforeCare: BEFORE_CILIOS,
      afterCare: AFTER_CILIOS,
      benefitsJson: J([
        "Fios ultrafinos repostos com precisão",
        "Naturalidade do resultado conservada",
        "Leveza máxima mantida",
        "Ideal para quem preza a discrição",
      ]),
      faqJson: FAQ_MANUTENCAO,
      order: 6,
      imageUrl: "https://images.pexels.com/photos/2253832/pexels-photo-2253832.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      categoryId: categories["manutencao-cilios"],
      name: "Manutenção Volume 5D",
      slug: "manutencao-volume-5d",
      shortDescription:
        "Manutenção para reposição dos fios e conservação do resultado por mais tempo.",
      description:
        "A manutenção do Volume 5D restaura a densidade intensa que você escolheu. Os feixes de 5 fios que se desprenderam são repostos mantendo o impacto visual e a uniformidade do resultado.",
      priceInCents: 12000,
      durationMinutes: 90,
      badge: "Manutenção",
      indicatedFor:
        "Clientes que já realizaram o Volume 5D e querem conservar a densidade e o impacto.",
      expectedResult:
        "Densidade e impacto do Volume 5D restaurados, olhar tão dramático quanto no dia do procedimento.",
      beforeCare: BEFORE_CILIOS,
      afterCare: AFTER_CILIOS,
      benefitsJson: J([
        "Feixes de 5 fios repostos",
        "Densidade máxima restaurada",
        "Impacto visual conservado",
        "Economia em relação ao procedimento completo",
      ]),
      faqJson: FAQ_MANUTENCAO,
      order: 7,
      imageUrl: "https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      categoryId: categories["manutencao-cilios"],
      name: "Manutenção Volume 5C",
      slug: "manutencao-volume-5c",
      shortDescription:
        "Manutenção para reposição dos fios e conservação do resultado por mais tempo.",
      description:
        "A manutenção do Volume 5C repõe os fios com a curvatura especial que abre o olhar, conservando o efeito wide-eye que você ama. A curvatura é mantida com cuidado para garantir que o resultado continue idêntico.",
      priceInCents: 12000,
      durationMinutes: 90,
      badge: "Manutenção",
      indicatedFor:
        "Clientes que já realizaram o Volume 5C e querem conservar o efeito de olho aberto.",
      expectedResult:
        "Curvatura e volume do Volume 5C conservados, com o efeito de abertura do olhar renovado.",
      beforeCare: BEFORE_CILIOS,
      afterCare: AFTER_CILIOS,
      benefitsJson: J([
        "Fios com curvatura especial repostos",
        "Efeito wide-eye conservado",
        "Volume e abertura do olhar mantidos",
        "Mais econômico que refazer",
      ]),
      faqJson: FAQ_MANUTENCAO,
      order: 8,
      imageUrl: "https://images.pexels.com/photos/4046316/pexels-photo-4046316.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      categoryId: categories["manutencao-cilios"],
      name: "Manutenção Volume Glow",
      slug: "manutencao-volume-glow",
      shortDescription:
        "Manutenção para reposição dos fios e conservação do resultado por mais tempo.",
      description:
        "A manutenção do Volume Glow preserva o acabamento impecável e o brilho editorial da técnica premium. Os fios são repostos com o mesmo cuidado ponto a ponto, mantendo a densidade e o glow que tornaram o resultado tão especial.",
      priceInCents: 1300,
      durationMinutes: 90,
      badge: "Manutenção",
      indicatedFor:
        "Clientes que já realizaram o Volume Glow e querem conservar o acabamento premium.",
      expectedResult:
        "Volume Glow preservado com a mesma perfeição e brilho do procedimento original.",
      beforeCare: BEFORE_CILIOS,
      afterCare: AFTER_CILIOS,
      status: ProcedureStatus.PRICE_TO_CONFIRM,
      internalNotes:
        "Valor informado como R$13; confirmar se seria R$130 (R$1300 em centavos)",
      benefitsJson: J([
        "Acabamento premium conservado",
        "Brilho editorial mantido",
        "Reposição ponto a ponto",
        "Densidade máxima restaurada",
      ]),
      faqJson: FAQ_MANUTENCAO,
      order: 9,
      imageUrl: "https://images.pexels.com/photos/5938395/pexels-photo-5938395.jpeg?auto=compress&cs=tinysrgb&w=800",
    },

    // ==================== COMBOS ====================
    {
      categoryId: categories["combos"],
      name: "Volume Brasileiro + manutenção",
      slug: "combo-volume-brasileiro",
      shortDescription:
        "Volume Brasileiro completo + manutenção futura com desconto especial.",
      description:
        "Faça o Volume Brasileiro e já garanta sua manutenção com desconto especial. O combo inclui o procedimento completo e uma manutenção futura — você agenda cada um no horário mais conveniente.",
      priceInCents: 20000,
      durationMinutes: 90,
      badge: "Combo",
      indicatedFor:
        "Para quem quer garantir o resultado por mais tempo desde o início, com economia.",
      expectedResult:
        "Volume Brasileiro completo agora e manutenção garantida, resultado prolongado com mais economia.",
      beforeCare: BEFORE_CILIOS,
      afterCare: AFTER_CILIOS,
      maintenanceIncluded: true,
      maintenanceDurationMinutes: 60,
      benefitsJson: J([
        "Economia no pacote completo",
        "Manutenção já garantida",
        "Agendamento flexível da manutenção",
        "Resultado prolongado com menos custo",
      ]),
      faqJson: FAQ([
        {
          q: "Posso agendar a manutenção quando quiser?",
          a: "Sim! A manutenção incluída no combo pode ser agendada no momento mais conveniente para você, dentro de 30 dias.",
        },
        {
          q: "Quanto economizo no combo?",
          a: "O combo oferece desconto especial em relação a contratar os dois procedimentos separadamente.",
        },
      ]),
      order: 1,
      imageUrl: COMBO_IMG,
    },
    {
      categoryId: categories["combos"],
      name: "Volume Brasileiro Marrom + manutenção",
      slug: "combo-volume-brasileiro-marrom",
      shortDescription:
        "Volume Brasileiro Marrom completo + manutenção futura com desconto especial.",
      description:
        "Faça o Volume Brasileiro Marrom e já garanta sua manutenção com desconto especial. O combo inclui o procedimento completo com fios marrons e uma manutenção futura — você agenda cada um no horário mais conveniente.",
      priceInCents: 21000,
      durationMinutes: 90,
      badge: "Combo",
      indicatedFor:
        "Para quem quer garantir o Volume Brasileiro Marrom por mais tempo com economia.",
      expectedResult:
        "Volume Brasileiro Marrom completo agora e manutenção garantida para prolongar o resultado.",
      beforeCare: BEFORE_CILIOS,
      afterCare: AFTER_CILIOS,
      maintenanceIncluded: true,
      maintenanceDurationMinutes: 60,
      benefitsJson: J([
        "Fios marrons incluídos no combo",
        "Manutenção já garantida",
        "Agendamento flexível",
        "Economia no pacote",
      ]),
      faqJson: FAQ([
        {
          q: "A manutenção do combo também usa fios marrons?",
          a: "Sim! A manutenção mantém os mesmos fios marrons do procedimento original.",
        },
        {
          q: "Posso agendar a manutenção quando quiser?",
          a: "Sim, dentro de 30 dias após o procedimento inicial.",
        },
      ]),
      order: 2,
      imageUrl: COMBO_IMG,
    },
    {
      categoryId: categories["combos"],
      name: "Fox Glow + manutenção",
      slug: "combo-fox-glow",
      shortDescription:
        "Fox Glow completo + manutenção futura com desconto especial.",
      description:
        "Faça o Fox Glow e já garanta sua manutenção com desconto especial. O combo inclui o procedimento completo e uma manutenção futura para conservar o efeito fox eye — você agenda cada um no horário mais conveniente.",
      priceInCents: 22000,
      durationMinutes: 60,
      badge: "Combo",
      indicatedFor:
        "Para quem quer garantir o efeito fox eye por mais tempo com economia.",
      expectedResult:
        "Fox Glow completo agora e efeito fox eye garantido por mais tempo com a manutenção incluída.",
      beforeCare: BEFORE_CILIOS,
      afterCare: AFTER_CILIOS,
      maintenanceIncluded: true,
      maintenanceDurationMinutes: 60,
      benefitsJson: J([
        "Efeito fox eye garantido por mais tempo",
        "Manutenção incluída no pacote",
        "Agendamento flexível",
        "Economia especial",
      ]),
      faqJson: FAQ([
        {
          q: "A manutenção mantém o efeito fox?",
          a: "Sim! A manutenção repõe os fios nos cantos externos para preservar o mapeamento fox.",
        },
        {
          q: "Quanto economizo?",
          a: "O combo oferece valor especial comparado a contratar Fox Glow e manutenção separadamente.",
        },
      ]),
      order: 3,
      imageUrl: COMBO_IMG,
    },
    {
      categoryId: categories["combos"],
      name: "Fox Glow Marrom + manutenção",
      slug: "combo-fox-glow-marrom",
      shortDescription:
        "Fox Glow Marrom completo + manutenção futura com desconto especial.",
      description:
        "Faça o Fox Glow Marrom e já garanta sua manutenção com desconto especial. O combo inclui o procedimento completo com fios marrons e uma manutenção futura — você agenda cada um no horário mais conveniente.",
      priceInCents: 23000,
      durationMinutes: 60,
      badge: "Combo",
      indicatedFor:
        "Para quem quer garantir o Fox Glow Marrom por mais tempo com economia.",
      expectedResult:
        "Fox Glow Marrom completo agora e resultado prolongado com manutenção garantida.",
      beforeCare: BEFORE_CILIOS,
      afterCare: AFTER_CILIOS,
      maintenanceIncluded: true,
      maintenanceDurationMinutes: 60,
      benefitsJson: J([
        "Fios marrons fox garantidos",
        "Manutenção incluída",
        "Agendamento flexível",
        "Economia especial no combo",
      ]),
      faqJson: FAQ([
        {
          q: "A manutenção usa os mesmos fios marrons?",
          a: "Sim! A manutenção do combo fox marrom usa exatamente os mesmos fios para manter a harmonia.",
        },
        {
          q: "Posso agendar a manutenção quando quiser?",
          a: "Sim, dentro de 30 dias após o procedimento inicial.",
        },
      ]),
      order: 4,
      imageUrl: COMBO_IMG,
    },
    {
      categoryId: categories["combos"],
      name: "Sublime 4D + manutenção",
      slug: "combo-sublime-4d",
      shortDescription:
        "Sublime 4D completo + manutenção futura com desconto especial.",
      description:
        "Faça o Sublime 4D e já garanta sua manutenção com desconto especial. O combo inclui o procedimento completo e uma manutenção futura para conservar a profundidade e o movimento dos fios em camadas — você agenda cada um no horário mais conveniente.",
      priceInCents: 23000,
      durationMinutes: 90,
      badge: "Combo",
      indicatedFor:
        "Para quem quer garantir o efeito 4D em camadas por mais tempo com economia.",
      expectedResult:
        "Sublime 4D completo agora e profundidade 4D conservada com manutenção incluída.",
      beforeCare: BEFORE_CILIOS,
      afterCare: AFTER_CILIOS,
      maintenanceIncluded: true,
      maintenanceDurationMinutes: 60,
      benefitsJson: J([
        "Efeito 4D garantido por mais tempo",
        "Manutenção incluída no pacote",
        "Agendamento flexível",
        "Valor especial no combo",
      ]),
      faqJson: FAQ([
        {
          q: "A manutenção conserva o efeito em camadas?",
          a: "Sim! Os fios de cada camada são repostos para preservar a profundidade do Sublime 4D.",
        },
        {
          q: "Quanto tempo tenho para usar a manutenção?",
          a: "A manutenção deve ser agendada em até 30 dias após o procedimento.",
        },
      ]),
      order: 5,
      imageUrl: COMBO_IMG,
    },
    {
      categoryId: categories["combos"],
      name: "Volume 5D + manutenção",
      slug: "combo-volume-5d",
      shortDescription:
        "Volume 5D completo + manutenção futura com desconto especial.",
      description:
        "Faça o Volume 5D e já garanta sua manutenção com desconto especial. O combo inclui o procedimento completo e uma manutenção futura para conservar a densidade impactante dos feixes de 5 fios — você agenda cada um no horário mais conveniente.",
      priceInCents: 24000,
      durationMinutes: 90,
      badge: "Combo",
      indicatedFor:
        "Para quem quer garantir o Volume 5D ultra denso por mais tempo com economia.",
      expectedResult:
        "Volume 5D completo agora e densidade máxima conservada com manutenção garantida.",
      beforeCare: BEFORE_CILIOS,
      afterCare: AFTER_CILIOS,
      maintenanceIncluded: true,
      maintenanceDurationMinutes: 90,
      benefitsJson: J([
        "Densidade 5D garantida por mais tempo",
        "Manutenção incluída",
        "Agendamento flexível",
        "Melhor custo-benefício",
      ]),
      faqJson: FAQ([
        {
          q: "A manutenção do combo tem 90 minutos também?",
          a: "Sim, a manutenção do Volume 5D requer 90 minutos para repor todos os feixes corretamente.",
        },
        {
          q: "Vale a pena comparado a contratar separado?",
          a: "Sim! O combo oferece desconto especial e a tranquilidade de ter a manutenção já garantida.",
        },
      ]),
      order: 6,
      imageUrl: COMBO_IMG,
    },
    {
      categoryId: categories["combos"],
      name: "Duo Blend + manutenção",
      slug: "combo-duo-blend",
      shortDescription:
        "Duo Blend personalizado + manutenção futura com desconto especial.",
      description:
        "Faça o Duo Blend e já garanta sua manutenção com desconto especial. O combo inclui o procedimento completo personalizado e uma manutenção futura — você agenda cada um no horário mais conveniente.",
      priceInCents: 24000,
      durationMinutes: 90,
      badge: "Combo",
      indicatedFor:
        "Para quem quer o Duo Blend exclusivo garantido por mais tempo com economia.",
      expectedResult:
        "Duo Blend personalizado agora e resultado exclusivo prolongado com manutenção incluída.",
      beforeCare: BEFORE_CILIOS,
      afterCare: AFTER_CILIOS,
      maintenanceIncluded: true,
      maintenanceDurationMinutes: 90,
      benefitsJson: J([
        "Resultado exclusivo Duo Blend",
        "Manutenção personalizada incluída",
        "Agendamento flexível",
        "Desconto especial no combo",
      ]),
      faqJson: FAQ([
        {
          q: "A manutenção mantém a personalização do Duo Blend?",
          a: "Sim! Victoria repõe exatamente os mesmos tipos de fios da combinação personalizada original.",
        },
        {
          q: "O preço do combo é fixo?",
          a: "O preço pode variar conforme a combinação escolhida. Victoria informa o valor exato na consulta.",
        },
      ]),
      order: 7,
      imageUrl: null,
      searchQuery: "lash extensions duo blend combo eyelashes",
    },
    {
      categoryId: categories["combos"],
      name: "Volume Glow + manutenção",
      slug: "combo-volume-glow",
      shortDescription:
        "Volume Glow premium + manutenção futura com desconto especial.",
      description:
        "Faça o Volume Glow e já garanta sua manutenção com desconto especial. O combo inclui o procedimento premium mais completo do Espaço Vi e uma manutenção futura — você agenda cada um no horário mais conveniente.",
      priceInCents: 20000,
      durationMinutes: 120,
      badge: "Combo",
      indicatedFor:
        "Para quem quer o Volume Glow premium garantido por mais tempo com economia.",
      expectedResult:
        "Volume Glow impecável agora e acabamento premium conservado com manutenção garantida.",
      beforeCare: BEFORE_CILIOS,
      afterCare: AFTER_CILIOS,
      maintenanceIncluded: true,
      maintenanceDurationMinutes: 90,
      benefitsJson: J([
        "Procedimento premium incluído",
        "Manutenção do Volume Glow garantida",
        "Agendamento flexível",
        "Melhor custo-benefício do catálogo",
      ]),
      faqJson: FAQ([
        {
          q: "Por que o combo Volume Glow é mais barato que contratar separado?",
          a: "Exatamente por isso — o combo foi criado para oferecer a experiência premium mais acessível.",
        },
        {
          q: "Quando posso usar a manutenção?",
          a: "Em até 30 dias após o procedimento inicial. Victoria orienta na hora do agendamento.",
        },
      ]),
      order: 8,
      imageUrl: COMBO_IMG,
    },

    // ==================== SOBRANCELHAS ====================
    {
      categoryId: categories["sobrancelhas"],
      name: "Design de sobrancelhas",
      slug: "design-sobrancelhas",
      shortDescription:
        "Design personalizado para realçar o formato natural das suas sobrancelhas.",
      description:
        "O design de sobrancelhas é feito com muito cuidado para valorizar o que você já tem. Victoria mapeia o formato ideal para o seu rosto e realça com retirada precisa dos fios excedentes.",
      priceInCents: 4500,
      durationMinutes: 40,
      indicatedFor:
        "Para quem quer sobrancelhas bem definidas e no formato certo para o rosto, sem alterar demais o visual.",
      expectedResult:
        "Sobrancelhas modeladas e definidas, no formato ideal para o seu rosto, duração de 3 a 4 semanas.",
      beforeCare:
        "• Chegar com a pele limpa e sem maquiagem na região\n• Evitar fazer a sobrancelha em casa nos 7 dias anteriores\n• Informar se usar algum medicamento que afina o sangue",
      afterCare:
        "• Evitar exposição solar direta por 24h\n• Não aplicar maquiagem na região por pelo menos 2h\n• Hidratar a região com creme suave se a pele ficar sensível",
      benefitsJson: J([
        "Formato personalizado para o seu rosto",
        "Retirada precisa dos fios excedentes",
        "Resultado natural e harmonioso",
        "Duração de 3 a 4 semanas",
      ]),
      faqJson: FAQ([
        {
          q: "Dói?",
          a: "A sensação é mínima. A maioria das clientes considera bem tranquilo.",
        },
        {
          q: "Quanto tempo dura?",
          a: "Em média 3 a 4 semanas, dependendo do crescimento dos fios.",
        },
        {
          q: "Qual a diferença para o design com coloração?",
          a: "O design simples apenas modela. O design com coloração também aplica um pigmento para deixar os fios mais uniformes e definidos.",
        },
      ]),
      order: 1,
      imageUrl: "https://images.pexels.com/photos/2533165/pexels-photo-2533165.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      categoryId: categories["sobrancelhas"],
      name: "Design com coloração",
      slug: "design-com-coloracao",
      shortDescription:
        "Design completo de sobrancelhas com coloração para mais definição e uniformidade.",
      description:
        "O design com coloração combina a modelagem precisa das sobrancelhas com a aplicação de uma coloração que uniformiza e define os fios. O resultado é sobrancelhas marcadas, com aparência mais cheia e definida, mesmo para quem tem fios claros ou esparsos.",
      priceInCents: 7500,
      durationMinutes: 60,
      badge: "Mais definição",
      indicatedFor:
        "Para quem quer sobrancelhas mais marcadas, com fios uniformes — ideal para quem tem fios claros, esparsos ou quer um visual mais definido.",
      expectedResult:
        "Sobrancelhas modeladas e com coloração uniforme, mais cheias e definidas, duração de 2 a 3 semanas.",
      beforeCare:
        "• Chegar com a pele limpa\n• Informar alergias a tinturas ou produtos capilares\n• Não fazer design em casa nos 7 dias anteriores",
      afterCare:
        "• Evitar molhar a região por 24h\n• Não esfregar as sobrancelhas\n• Evitar sol direto por 48h para a cor durar mais",
      benefitsJson: J([
        "Coloração que uniformiza os fios",
        "Sobrancelhas com aparência mais cheia",
        "Ideal para fios claros ou esparsos",
        "Resultado marcado e duradouro",
      ]),
      faqJson: FAQ([
        {
          q: "A coloração danifica os fios?",
          a: "Não, quando feita com produtos adequados e por profissional. Os produtos usados são formulados especificamente para sobrancelhas.",
        },
        {
          q: "Quanto tempo dura a coloração?",
          a: "Em média de 2 a 3 semanas. O design em si dura de 3 a 4 semanas.",
        },
        {
          q: "Consigo escolher o tom da coloração?",
          a: "Sim! Victoria avalia o tom ideal para harmonizar com o seu cabelo e a sua pele.",
        },
      ]),
      order: 2,
      imageUrl: "https://images.pexels.com/photos/4612438/pexels-photo-4612438.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      categoryId: categories["sobrancelhas"],
      name: "Brow Lamination",
      slug: "brow-lamination",
      shortDescription:
        "Sobrancelhas alinhadas, encorpadas e no lugar por semanas.",
      description:
        "A brow lamination é um tratamento que alinha os fios das sobrancelhas e os mantém na posição desejada por semanas. O resultado é uma sobrancelha mais cheia, penteada e com aparência de fios saudáveis.",
      priceInCents: 14000,
      durationMinutes: 60,
      indicatedFor:
        "Para quem tem fios rebeldes, sobrancelhas com crescimento irregular ou quer a aparência de sobrancelhas mais cheias e bem alinhadas.",
      expectedResult:
        "Sobrancelhas alinhadas, encorpadas e fixas na posição ideal por 4 a 6 semanas.",
      beforeCare:
        "• Chegar com a pele limpa e sem maquiagem\n• Evitar fazer design ou depilar nos 7 dias anteriores\n• Informar se tiver pele sensível ou alergias",
      afterCare:
        "• Não molhar a região por 24h\n• Evitar esfregar ou pensar as sobrancelhas no dia\n• Hidratar os fios diariamente com óleo leve\n• Evitar sol intenso nos primeiros dias",
      benefitsJson: J([
        "Fios alinhados e fixos por semanas",
        "Aparência de sobrancelhas mais cheias",
        "Sem necessidade de maquiagem diária",
        "Duração de 4 a 6 semanas",
      ]),
      faqJson: FAQ([
        {
          q: "Quanto tempo dura?",
          a: "De 4 a 6 semanas com os cuidados corretos.",
        },
        {
          q: "Posso fazer com sobrancelhas finas?",
          a: "Sim! A lamination aproveita todos os fios disponíveis e dá a impressão de sobrancelhas mais cheias.",
        },
        {
          q: "Preciso parar com a depilação?",
          a: "Pelo menos nos primeiros dias, sim. Victoria orienta na hora do procedimento.",
        },
      ]),
      order: 3,
      imageUrl: "https://images.pexels.com/photos/6663359/pexels-photo-6663359.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      categoryId: categories["sobrancelhas"],
      name: "Brow Lamination + Design",
      slug: "brow-lamination-design",
      shortDescription:
        "Brow lamination completa com design personalizado para sobrancelhas impecáveis.",
      description:
        "O combo Brow Lamination + Design une o alinhamento duradouro da lamination com o design personalizado para um resultado completo. Os fios são alinhados e fixados, e o formato final é modelado para valorizar o seu rosto.",
      priceInCents: 17000,
      durationMinutes: 60,
      indicatedFor:
        "Para quem quer sobrancelhas alinhadas, fixas e com o formato ideal — resultado completo em uma sessão.",
      expectedResult:
        "Sobrancelhas com lamination e design personalizado, resultado impecável que dura de 4 a 6 semanas.",
      beforeCare:
        "• Chegar com a pele limpa\n• Evitar fazer design nos 7 dias anteriores\n• Informar alergias se houver",
      afterCare:
        "• Não molhar por 24h\n• Não esfregar a região\n• Hidratar diariamente\n• Evitar sol intenso nos primeiros dias",
      benefitsJson: J([
        "Lamination + design em uma sessão",
        "Fios alinhados no formato ideal",
        "Resultado mais completo e duradouro",
        "Sobrancelhas impecáveis por semanas",
      ]),
      faqJson: FAQ([
        {
          q: "Qual a vantagem de fazer os dois juntos?",
          a: "Você sai com sobrancelhas alinhadas E no formato certo — o resultado é muito mais completo do que fazer cada um separado.",
        },
        {
          q: "Quanto tempo dura?",
          a: "A lamination dura de 4 a 6 semanas. O design pode precisar de retoques em 3 a 4 semanas.",
        },
      ]),
      order: 4,
      imageUrl: "https://images.pexels.com/photos/6663574/pexels-photo-6663574.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      categoryId: categories["sobrancelhas"],
      name: "Brow Lamination + Design com coloração",
      slug: "brow-lamination-design-coloracao",
      shortDescription:
        "O combo mais completo para sobrancelhas: lamination, design e coloração.",
      description:
        "O combo mais completo do catálogo de sobrancelhas. A brow lamination alinha e fixa os fios, o design modela no formato ideal para o seu rosto e a coloração uniformiza e define — tudo em uma única sessão.",
      priceInCents: null,
      durationMinutes: 90,
      status: ProcedureStatus.PRICE_TO_CONFIRM,
      internalNotes: "Preço a confirmar. Avaliar na consulta.",
      indicatedFor:
        "Para quem quer o resultado mais completo possível para as sobrancelhas — alinhamento, formato e cor em uma sessão.",
      expectedResult:
        "Sobrancelhas com fios alinhados, formato perfeito e coloração uniforme — o resultado mais completo.",
      beforeCare:
        "• Chegar com a pele limpa\n• Informar alergias a tinturas ou produtos capilares\n• Evitar design nos 7 dias anteriores",
      afterCare:
        "• Não molhar por 24h\n• Não esfregar a região\n• Hidratar diariamente\n• Evitar sol intenso nos primeiros dias",
      benefitsJson: J([
        "Lamination + design + coloração",
        "Resultado mais completo em uma sessão",
        "Fios alinhados, formatados e uniformes",
        "O máximo em sobrancelhas",
      ]),
      faqJson: FAQ([
        {
          q: "Por que o preço é a confirmar?",
          a: "O combo envolve três procedimentos e o valor varia conforme a avaliação. Victoria informa o valor exato na consulta.",
        },
        {
          q: "Quanto tempo dura?",
          a: "A lamination dura de 4 a 6 semanas. O design dura 3 a 4 semanas. A coloração dura de 2 a 3 semanas.",
        },
      ]),
      order: 5,
      imageUrl: "https://images.pexels.com/photos/4612440/pexels-photo-4612440.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      categoryId: categories["sobrancelhas"],
      name: "Nanoblading",
      slug: "nanoblading",
      shortDescription:
        "Fios realistas e precisos para sobrancelhas que parecem naturais todos os dias.",
      description:
        "O nanoblading é uma técnica de micropigmentação com agulhas ultra finas que cria fios individuais praticamente idênticos aos naturais. O resultado é extremamente realista, delicado e adaptado ao formato ideal para o seu rosto.",
      priceInCents: 40000,
      durationMinutes: 120,
      badge: "Fios realistas",
      indicatedFor:
        "Para quem quer sobrancelhas sempre prontas sem precisar maquiar — ideal para quem tem falhas, fios escassos ou quer eliminar a maquiagem da rotina.",
      expectedResult:
        "Sobrancelhas com fios individuais realistas que parecem naturais, duração de 1 a 2 anos com retoque.",
      beforeCare:
        "• Evitar retirar pelos nos 15 dias anteriores\n• Não usar ácidos na região nos 7 dias anteriores\n• Chegar com a pele limpa\n• Informar se usa algum medicamento anticoagulante",
      afterCare:
        "• Não molhar a região por 10 dias\n• Não coçar nem descascar a região durante a cicatrização\n• Usar o produto de cicatrização indicado\n• Evitar exposição solar direta por pelo menos 30 dias",
      benefitsJson: J([
        "Fios individuais ultra realistas",
        "Sem maquiagem na rotina diária",
        "Duração de 1 a 2 anos",
        "Resultado adaptado ao seu rosto",
      ]),
      faqJson: FAQ([
        {
          q: "Nanoblading é igual micropigmentação?",
          a: "São técnicas parecidas, mas o nanoblading usa agulhas muito mais finas, criando fios mais realistas e naturais.",
        },
        {
          q: "Dói?",
          a: "É aplicado anestésico tópico antes. A maioria das clientes sente apenas um leve desconforto.",
        },
        {
          q: "Precisa de retoque?",
          a: "Sim. O retoque é feito entre 4 e 6 semanas após o procedimento inicial para fixar o pigmento e corrigir eventuais falhas.",
        },
      ]),
      order: 6,
      imageUrl: "https://images.pexels.com/photos/6663362/pexels-photo-6663362.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      categoryId: categories["sobrancelhas"],
      name: "Retoque Nanoblading",
      slug: "retoque-nanoblading",
      shortDescription:
        "Retoque do nanoblading para fixar o pigmento e corrigir eventuais falhas.",
      description:
        "O retoque do nanoblading é feito entre 4 e 6 semanas após o procedimento inicial. É uma etapa fundamental para fixar o pigmento nas áreas que clarearam durante a cicatrização e garantir um resultado final perfeito.",
      priceInCents: 8990,
      durationMinutes: 90,
      indicatedFor:
        "Clientes que já realizaram o nanoblading e precisam do retoque obrigatório de cicatrização.",
      expectedResult:
        "Pigmento fixado uniformemente, fios definidos e resultado final do nanoblading completo.",
      beforeCare:
        "• Aguardar pelo menos 4 semanas após o nanoblading inicial\n• Chegar com a pele limpa\n• Informar se teve reações durante a cicatrização",
      afterCare:
        "• Seguir os mesmos cuidados pós-nanoblading\n• Não molhar por 7 dias\n• Usar o produto de cicatrização indicado",
      benefitsJson: J([
        "Pigmento fixado nas áreas que clarearam",
        "Resultado final do nanoblading completo",
        "Correção de eventuais falhas",
        "Etapa essencial para durabilidade máxima",
      ]),
      faqJson: FAQ([
        {
          q: "O retoque é obrigatório?",
          a: "Sim. O retoque é uma etapa do processo do nanoblading — é quando o pigmento é fixado definitivamente.",
        },
        {
          q: "Quando devo fazer o retoque?",
          a: "Entre 4 e 6 semanas após o nanoblading inicial, quando a cicatrização estiver completa.",
        },
        {
          q: "O retoque dói tanto quanto o procedimento inicial?",
          a: "Não. O retoque é mais rápido e a sensação de desconforto tende a ser menor.",
        },
      ]),
      order: 7,
      imageUrl: "https://images.pexels.com/photos/2533165/pexels-photo-2533165.jpeg?auto=compress&cs=tinysrgb&w=800",
    },

    // ==================== PELE ====================
    {
      categoryId: categories["pele"],
      name: "Limpeza de pele tradicional",
      slug: "limpeza-pele-tradicional",
      shortDescription:
        "Limpeza profunda para desobstruir os poros e renovar o brilho da pele.",
      description:
        "A limpeza de pele tradicional combina vapor, extração e uma máscara calmante para devolver o equilíbrio à sua pele. É o procedimento base do skincare, essencial para quem quer manter a pele saudável e limpa.",
      priceInCents: 13000,
      durationMinutes: 90,
      indicatedFor:
        "Para quem quer manter a pele saudável e limpa regularmente — indicada para todos os tipos de pele.",
      expectedResult:
        "Pele limpa, poros desobstruídos e brilho natural renovado, resultado visível desde a primeira sessão.",
      beforeCare:
        "• Chegar com a pele limpa e sem maquiagem\n• Evitar exposição solar intensa no dia anterior\n• Informar se estiver usando ácidos ou retinol",
      afterCare:
        "• Usar protetor solar após o procedimento\n• Evitar maquiagem por pelo menos 24h\n• Não espremer cravos ou espinhas\n• Hidratar a pele com produto leve",
      benefitsJson: J([
        "Poros desobstruídos e limpos",
        "Brilho natural renovado",
        "Base para todos os tratamentos de pele",
        "Indicada para todos os tipos de pele",
      ]),
      faqJson: FAQ([
        {
          q: "A pele fica vermelha depois?",
          a: "Pode ficar levemente avermelhada por algumas horas após a extração. Passa rapidamente.",
        },
        {
          q: "Posso usar maquiagem no mesmo dia?",
          a: "Recomendamos esperar pelo menos 24h para que a pele se recupere.",
        },
        {
          q: "Quantas vezes devo fazer?",
          a: "Em média, uma vez por mês para manter os poros limpos e a pele equilibrada.",
        },
      ]),
      order: 1,
      imageUrl: "https://images.pexels.com/photos/3760514/pexels-photo-3760514.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      categoryId: categories["pele"],
      name: "Limpeza detox",
      slug: "limpeza-detox",
      shortDescription:
        "Limpeza profunda com foco em detoxificar e renovar a pele cansada.",
      description:
        "A limpeza detox vai além da limpeza convencional, com ativos especiais que eliminam impurezas acumuladas e neutralizam os efeitos do estresse e da poluição. Ideal para peles que precisam de um reset completo.",
      priceInCents: 14000,
      durationMinutes: 90,
      badge: "Pele glow",
      indicatedFor:
        "Para peles cansadas, opacas ou que sofreram com estresse, poluição ou mudança de estação.",
      expectedResult:
        "Pele visivelmente renovada, mais luminosa e com aspecto saudável desde a primeira sessão.",
      beforeCare:
        "• Chegar com a pele limpa\n• Evitar sol intenso no dia anterior\n• Informar uso de medicamentos ou ácidos",
      afterCare:
        "• Usar protetor solar\n• Evitar maquiagem por 24h\n• Hidratar bem a pele\n• Beber bastante água nos dias seguintes",
      benefitsJson: J([
        "Eliminação de impurezas acumuladas",
        "Neutralização dos efeitos da poluição",
        "Pele mais luminosa e renovada",
        "Reset completo para peles cansadas",
      ]),
      faqJson: FAQ([
        {
          q: "Qual a diferença para a limpeza tradicional?",
          a: "A limpeza detox usa ativos específicos para neutralizar impurezas ambientais e estresse oxidativo, indo além da limpeza convencional.",
        },
        {
          q: "Com que frequência fazer?",
          a: "Uma vez por mês ou quando sentir a pele muito cansada e opaca.",
        },
        {
          q: "Para que tipo de pele é indicada?",
          a: "Para todos os tipos, especialmente peles que vivem expostas à poluição e ao estresse cotidiano.",
        },
      ]),
      order: 2,
      imageUrl: "https://images.pexels.com/photos/3985329/pexels-photo-3985329.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      categoryId: categories["pele"],
      name: "Limpeza mineral glow",
      slug: "limpeza-mineral-glow",
      shortDescription:
        "Limpeza com ativos minerais para pele iluminada e revitalizada.",
      description:
        "A limpeza mineral glow incorpora minerais revitalizantes ao protocolo de limpeza, deixando a pele profundamente limpa e com um glow natural e saudável. Os minerais nutrem enquanto limpam, resultando em pele mais luminosa e com textura uniforme.",
      priceInCents: 14000,
      durationMinutes: 90,
      indicatedFor:
        "Para peles que precisam de luminosidade e revitalização, especialmente peles secas ou sem brilho.",
      expectedResult:
        "Pele limpa e com glow natural, textura uniforme e luminosidade visível desde o primeiro atendimento.",
      beforeCare:
        "• Chegar com a pele limpa\n• Informar uso de ácidos ou tratamentos ativos\n• Evitar sol intenso no dia anterior",
      afterCare:
        "• Usar protetor solar\n• Hidratar a pele com produto mineral ou sérum iluminador\n• Evitar maquiagem por 24h",
      benefitsJson: J([
        "Ativos minerais que nutrem e iluminam",
        "Pele com glow natural e saudável",
        "Textura uniforme pós-procedimento",
        "Revitalização profunda",
      ]),
      faqJson: FAQ([
        {
          q: "O que são os ativos minerais?",
          a: "São minerais como zinco, magnésio e selênio que nutrem a pele, combatem radicais livres e promovem luminosidade natural.",
        },
        {
          q: "Serve para pele oleosa?",
          a: "Sim! Os minerais ajudam a equilibrar a produção de sebo enquanto iluminam a pele.",
        },
        {
          q: "Com que frequência fazer?",
          a: "Uma vez por mês para manter a pele sempre revitalizada e brilhante.",
        },
      ]),
      order: 3,
      imageUrl: "https://images.pexels.com/photos/3765146/pexels-photo-3765146.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      categoryId: categories["pele"],
      name: "Limpeza clareadora",
      slug: "limpeza-clareadora",
      shortDescription:
        "Tratamento focado em uniformizar o tom e clarear manchas suaves.",
      description:
        "A limpeza clareadora combina o protocolo de limpeza profunda com ativos clareadores que atuam na hiperpigmentação leve e manchas superficiais. O resultado é uma pele mais uniforme, com o tom equilibrado e as manchas visivelmente atenuadas.",
      priceInCents: 15000,
      durationMinutes: 90,
      indicatedFor:
        "Para quem tem manchas leves, melasma superficial ou quer uniformizar o tom da pele.",
      expectedResult:
        "Tom de pele mais uniforme, manchas atenuadas e pele limpa com resultado visível em poucos tratamentos.",
      beforeCare:
        "• Chegar com a pele limpa\n• Informar uso de clareadores ou ácidos em casa\n• Evitar sol intenso nos 3 dias anteriores",
      afterCare:
        "• Usar protetor solar FPS 50 obrigatoriamente\n• Evitar exposição solar por 48h\n• Não usar ácidos em casa por 3 dias\n• Hidratar bem a pele",
      benefitsJson: J([
        "Ativos clareadores para manchas superficiais",
        "Tom de pele uniformizado",
        "Limpeza profunda associada ao clareamento",
        "Proteção contra nova hiperpigmentação",
      ]),
      faqJson: FAQ([
        {
          q: "Funciona para todo tipo de mancha?",
          a: "Para manchas leves e superficiais, sim. Para casos mais intensos como melasma profundo, pode ser necessário um protocolo mais específico.",
        },
        {
          q: "Quantas sessões preciso?",
          a: "O ideal é um protocolo de 4 a 6 sessões para resultados significativos, mas melhoras são visíveis desde o início.",
        },
        {
          q: "O protetor solar é obrigatório?",
          a: "Sim, e isso é inegociável. Os ativos clareadores deixam a pele sensível ao sol, que pode piorar as manchas sem proteção adequada.",
        },
      ]),
      order: 4,
      imageUrl: "https://images.pexels.com/photos/3738352/pexels-photo-3738352.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      categoryId: categories["pele"],
      name: "Limpeza ouro glow",
      slug: "limpeza-ouro-glow",
      shortDescription:
        "Limpeza de pele com ativos de ouro para efeito luminoso e rejuvenescedor.",
      description:
        "A limpeza ouro glow incorpora partículas de ouro coloidal ao protocolo, um ativo poderoso conhecido por suas propriedades rejuvenescedoras e iluminadoras. O resultado é uma pele profundamente limpa, com um brilho dourado e visivelmente mais jovem.",
      priceInCents: 16000,
      durationMinutes: 90,
      badge: "Premium",
      indicatedFor:
        "Para quem quer uma experiência premium com resultado extraordinário em luminosidade e rejuvenescimento.",
      expectedResult:
        "Pele limpa com efeito luminoso dourado, aparência mais jovem e uniforme, resultado visível desde a primeira sessão.",
      beforeCare:
        "• Chegar com a pele limpa\n• Informar alergias a metais\n• Evitar sol intenso no dia anterior",
      afterCare:
        "• Usar protetor solar\n• Hidratar com sérum rico\n• Evitar maquiagem por 24h\n• Aproveitar o glow!",
      benefitsJson: J([
        "Ouro coloidal para efeito rejuvenescedor",
        "Luminosidade dourada e sofisticada",
        "Pele visivelmente mais jovem",
        "Experiência premium do início ao fim",
      ]),
      faqJson: FAQ([
        {
          q: "O que é ouro coloidal?",
          a: "São partículas de ouro em escala nanométrica que penetram na pele, estimulando colágeno e promovendo luminosidade intensa.",
        },
        {
          q: "Posso fazer se tiver alergia a metal?",
          a: "Informe sobre qualquer alergia antes. Victoria avalia se é seguro realizar o procedimento.",
        },
        {
          q: "Com que frequência fazer?",
          a: "Uma vez por mês para manter o efeito renovador. É um tratamento que recompensa a regularidade.",
        },
      ]),
      order: 5,
      imageUrl: "https://images.pexels.com/photos/4586979/pexels-photo-4586979.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      categoryId: categories["pele"],
      name: "Limpeza premium",
      slug: "limpeza-premium",
      shortDescription:
        "A experiência mais completa em limpeza de pele — resultados visíveis desde o primeiro atendimento.",
      description:
        "A limpeza premium vai além da limpeza convencional. Combina protocolos exclusivos, ativos de alto desempenho e uma sequência personalizada de tratamentos para uma pele visivelmente mais bonita, saudável e luminosa.",
      priceInCents: 22000,
      durationMinutes: 120,
      badge: "Premium",
      indicatedFor:
        "Para quem quer o melhor resultado possível em uma única sessão — perfeito para ocasiões especiais ou quem está iniciando um protocolo de skincare sério.",
      expectedResult:
        "Pele transformada: limpa, luminosa, hidratada e com textura uniforme — o resultado mais completo do catálogo de pele.",
      beforeCare:
        "• Chegar com a pele limpa e preparada\n• Informar todos os produtos usados em casa\n• Evitar sol intenso nos 2 dias anteriores\n• Informar uso de ácidos, retinol ou prescrições médicas",
      afterCare:
        "• Usar protetor solar FPS 50\n• Manter a hidratação em dia\n• Seguir o protocolo home care indicado\n• Evitar maquiagem por 24h",
      benefitsJson: J([
        "Protocolo exclusivo e personalizado",
        "Ativos de alto desempenho",
        "Resultado mais completo do catálogo",
        "Pele transformada em uma sessão",
      ]),
      faqJson: FAQ([
        {
          q: "O que a limpeza premium tem que as outras não têm?",
          a: "A limpeza premium combina múltiplos protocolos: extração profunda, ativos de alto desempenho, máscara personalizada e cuidados extras que transformam o resultado.",
        },
        {
          q: "Quanto tempo dura a sessão?",
          a: "São 2 horas de tratamento completo — o mais longo e completo do catálogo.",
        },
        {
          q: "É muito mais cara que as outras?",
          a: "O valor é maior por ser um protocolo completo, mas o resultado também é muito superior. Muitas clientes fazem mensalmente.",
        },
      ]),
      order: 6,
      imageUrl: "https://images.pexels.com/photos/3985332/pexels-photo-3985332.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      categoryId: categories["pele"],
      name: "Dermaplaning",
      slug: "dermaplaning",
      shortDescription:
        "Esfoliação com lâmina para pele mais lisa, suave e com muito glow.",
      description:
        "O dermaplaning remove suavemente as células mortas e os pelos finos do rosto com uma lâmina especial, deixando a pele com textura de seda e preparada para absorver melhor qualquer cuidado posterior.",
      priceInCents: 12000,
      durationMinutes: 60,
      badge: "Pele glow",
      indicatedFor:
        "Para quem quer pele mais lisa, luminosa e preparada — ótimo antes de eventos ou para potencializar outros tratamentos.",
      expectedResult:
        "Pele extremamente lisa, suave ao toque e com glow natural, maquiagem que desliza e produtos que absorvem melhor.",
      beforeCare:
        "• Chegar com a pele limpa e sem maquiagem\n• Evitar sol intenso nos 2 dias anteriores\n• Informar se estiver com acne ativa ou pele inflamada",
      afterCare:
        "• Usar protetor solar FPS 50 obrigatoriamente\n• Evitar sol direto por 48h\n• Não usar esfoliantes em casa por 7 dias\n• Hidratar bem a pele",
      benefitsJson: J([
        "Remoção de pelos finos e células mortas",
        "Pele com textura de seda",
        "Glow natural imediato",
        "Potencializa a absorção de outros produtos",
      ]),
      faqJson: FAQ([
        {
          q: "Vai voltar mais grosso?",
          a: "Não. O dermaplaning não altera a estrutura do pelo. Ele volta exatamente igual.",
        },
        {
          q: "É indicado para pele sensível?",
          a: "Depende do grau de sensibilidade. Victoria avalia na consulta.",
        },
        {
          q: "Posso fazer antes de uma festa?",
          a: "Sim! O resultado é imediato e ótimo para noivas, madrinhas ou qualquer ocasião especial.",
        },
      ]),
      order: 7,
      imageUrl: "https://images.pexels.com/photos/5069397/pexels-photo-5069397.jpeg?auto=compress&cs=tinysrgb&w=800",
    },

    // ==================== NÃO REALIZADOS ====================
    {
      categoryId: categories["nao-realizado"],
      name: "Henna",
      slug: "henna",
      shortDescription:
        "Coloração com henna para sobrancelhas mais definidas e naturais.",
      description:
        "A henna é uma técnica de coloração natural para sobrancelhas. Não realizamos esse procedimento no Espaço Vi, mas temos opções similares que podem te surpreender.",
      priceInCents: null,
      durationMinutes: null,
      isBookable: false,
      notBookableMessage:
        "No momento não trabalhamos com esse procedimento, mas posso te indicar opções bem parecidas aqui no Espaço Vi 🤍",
      status: ProcedureStatus.UNAVAILABLE,
      internalNotes:
        "Sugestão: indicar Design com coloração como alternativa próxima.",
      order: 1,
      imageUrl: null,
      searchQuery: "henna eyebrows natural coloring",
    },
    {
      categoryId: categories["nao-realizado"],
      name: "Lash Lifting",
      slug: "lash-lifting",
      shortDescription: "Curvatura permanente dos cílios naturais sem extensão.",
      description:
        "O lash lifting é um procedimento que curva os cílios naturais. Não realizamos esse procedimento no Espaço Vi, mas temos opções incríveis de extensão de cílios que vão te encantar.",
      priceInCents: null,
      durationMinutes: null,
      isBookable: false,
      notBookableMessage:
        "No momento não trabalhamos com esse procedimento, mas posso te indicar opções bem parecidas aqui no Espaço Vi 🤍",
      status: ProcedureStatus.UNAVAILABLE,
      internalNotes:
        "Não trabalhamos com lash lifting. Sugestão: apresentar as opções de cílios mais naturais como Fox Glow ou Sublime 4D Light.",
      order: 2,
      imageUrl: null,
      searchQuery: "lash lifting natural eyelash curl",
    },
    {
      categoryId: categories["nao-realizado"],
      name: "Cílios fio a fio",
      slug: "cilios-fio-a-fio",
      shortDescription: "Extensão clássica com um fio sintético por fio natural.",
      description:
        "Os cílios fio a fio são uma técnica clássica de extensão. Não realizamos esse procedimento no Espaço Vi, mas temos técnicas similares com resultado ainda mais bonito.",
      priceInCents: null,
      durationMinutes: null,
      isBookable: false,
      notBookableMessage:
        "No momento não trabalhamos com esse procedimento, mas posso te indicar opções bem parecidas aqui no Espaço Vi 🤍",
      status: ProcedureStatus.UNAVAILABLE,
      internalNotes:
        "Sugestão: indicar Fox Glow ou Volume Brasileiro como alternativas.",
      order: 3,
      imageUrl: null,
      searchQuery: "classic lash extensions one by one",
    },
    {
      categoryId: categories["nao-realizado"],
      name: "Micropigmentação labial",
      slug: "micropigmentacao-labial",
      shortDescription: "Pigmentação permanente para definir o contorno e a cor dos lábios.",
      description:
        "A micropigmentação labial é um procedimento de pigmentação permanente. Não realizamos esse procedimento no Espaço Vi, mas temos serviços para sobrancelhas e cílios que vão valorizar ainda mais o seu olhar.",
      priceInCents: null,
      durationMinutes: null,
      isBookable: false,
      notBookableMessage:
        "No momento não trabalhamos com esse procedimento. Mas temos serviços incríveis para sobrancelhas e cílios que vão valorizar ainda mais o seu olhar 🤍",
      status: ProcedureStatus.UNAVAILABLE,
      internalNotes:
        "Procedimento não realizado. Direcionar para catálogo de sobrancelhas ou cílios.",
      order: 4,
      imageUrl: null,
      searchQuery: "lip micropigmentation permanent makeup",
    },
  ];

  let seededCount = 0;
  for (const proc of procedures) {
    const { imageUrl, searchQuery, ...rest } = proc;
    const created = await prisma.procedure.upsert({
      where: { slug: proc.slug },
      update: rest,
      create: rest,
    });

    // Add primary image if provided
    if (imageUrl) {
      const existingImage = await prisma.procedureImage.findFirst({
        where: { procedureId: created.id, isPrimary: true },
      });
      if (!existingImage) {
        await prisma.procedureImage.create({
          data: {
            procedureId: created.id,
            url: imageUrl,
            isPrimary: true,
            order: 0,
          },
        });
      }
    }

    seededCount++;
    console.log(`✓ Procedure (${seededCount}): ${proc.name}`);
  }

  console.log(`\n✅ Seed concluído! ${seededCount} procedimentos inseridos.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
