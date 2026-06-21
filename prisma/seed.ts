import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

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
  const procedures = [
    // Cílios
    {
      categoryId: categories["cilios"],
      name: "Volume Russo",
      slug: "volume-russo",
      shortDescription: "Extensão de cílios com técnica de leque para máximo volume.",
      description: "A técnica Volume Russo utiliza múltiplos fios ultra-finos formando um leque, criando um efeito dramático e cheio de volume.",
      priceInCents: 18000,
      durationMinutes: 120,
      badge: "Mais pedido",
      order: 1,
    },
    {
      categoryId: categories["cilios"],
      name: "Clássico",
      slug: "classico",
      shortDescription: "Um fio por fio natural, perfeito para quem busca elegância discreta.",
      priceInCents: 15000,
      durationMinutes: 90,
      order: 2,
    },
    {
      categoryId: categories["cilios"],
      name: "Híbrido",
      slug: "hibrido",
      shortDescription: "Combinação de clássico e volume para um resultado sofisticado.",
      priceInCents: 17000,
      durationMinutes: 110,
      order: 3,
    },
    {
      categoryId: categories["cilios"],
      name: "Mega Volume",
      slug: "mega-volume",
      shortDescription: "Volume máximo com leques mais densos para um olhar impactante.",
      priceInCents: 22000,
      durationMinutes: 150,
      order: 4,
    },
    {
      categoryId: categories["cilios"],
      name: "Fio a Fio Natural",
      slug: "fio-a-fio-natural",
      shortDescription: "Extensão suave para um olhar naturalmente realçado.",
      priceInCents: 14000,
      durationMinutes: 80,
      order: 5,
    },
    // Manutenção de cílios
    {
      categoryId: categories["manutencao-cilios"],
      name: "Manutenção Volume Russo",
      slug: "manutencao-volume-russo",
      shortDescription: "Reposição dos fios para manter o volume russo impecável.",
      priceInCents: 10000,
      durationMinutes: 60,
      order: 1,
    },
    {
      categoryId: categories["manutencao-cilios"],
      name: "Manutenção Clássico",
      slug: "manutencao-classico",
      shortDescription: "Reposição dos fios clássicos para um look sempre renovado.",
      priceInCents: 8000,
      durationMinutes: 50,
      order: 2,
    },
    {
      categoryId: categories["manutencao-cilios"],
      name: "Manutenção Híbrido",
      slug: "manutencao-hibrido",
      shortDescription: "Reposição do mix de fios do volume híbrido.",
      priceInCents: 9000,
      durationMinutes: 55,
      order: 3,
    },
    {
      categoryId: categories["manutencao-cilios"],
      name: "Retirada de Cílios",
      slug: "retirada-cilios",
      shortDescription: "Remoção segura das extensões sem danificar os cílios naturais.",
      priceInCents: 5000,
      durationMinutes: 30,
      order: 4,
    },
    // Combos
    {
      categoryId: categories["combos"],
      name: "Combo Volume + Design",
      slug: "combo-volume-design",
      shortDescription: "Volume Russo + Design de sobrancelha com economia especial.",
      priceInCents: 22000,
      durationMinutes: 165,
      badge: "Economia",
      order: 1,
    },
    {
      categoryId: categories["combos"],
      name: "Combo Manutenção + Design",
      slug: "combo-manutencao-design",
      shortDescription: "Manutenção de cílios + Design de sobrancelha.",
      priceInCents: 16000,
      durationMinutes: 110,
      badge: "Economia",
      order: 2,
    },
    // Sobrancelhas
    {
      categoryId: categories["sobrancelhas"],
      name: "Design de Sobrancelha",
      slug: "design-sobrancelha",
      shortDescription: "Modelagem completa com linha, cera e acabamento.",
      priceInCents: 6000,
      durationMinutes: 45,
      order: 1,
    },
    {
      categoryId: categories["sobrancelhas"],
      name: "Henna de Sobrancelha",
      slug: "henna-sobrancelha",
      shortDescription: "Coloração natural com henna para sobrancelhas mais definidas.",
      priceInCents: 8000,
      durationMinutes: 60,
      order: 2,
    },
    {
      categoryId: categories["sobrancelhas"],
      name: "Laminação de Sobrancelha",
      slug: "laminacao-sobrancelha",
      shortDescription: "Alinha e fixa os fios para um resultado natural e duradouro.",
      priceInCents: 12000,
      durationMinutes: 75,
      badge: "Tendência",
      order: 3,
    },
    // Pele
    {
      categoryId: categories["pele"],
      name: "Limpeza de Pele Básica",
      slug: "limpeza-pele-basica",
      shortDescription: "Higienização profunda com extração e hidratação.",
      priceInCents: 15000,
      durationMinutes: 60,
      order: 1,
    },
    {
      categoryId: categories["pele"],
      name: "Peeling de Diamante",
      slug: "peeling-diamante",
      shortDescription: "Esfoliação mecânica para renovação e luminosidade da pele.",
      priceInCents: 18000,
      durationMinutes: 75,
      order: 2,
    },
    {
      categoryId: categories["pele"],
      name: "Hidratação Facial",
      slug: "hidratacao-facial",
      shortDescription: "Protocolo de hidratação intensa com ativos premium.",
      priceInCents: 12000,
      durationMinutes: 50,
      order: 3,
    },
  ];

  for (const proc of procedures) {
    await prisma.procedure.upsert({
      where: { slug: proc.slug },
      update: {},
      create: proc,
    });
    console.log("✓ Procedure:", proc.name);
  }

  console.log("\n✅ Seed concluído!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
