import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// Pexels images mapped by procedure type
const IMAGES: Record<string, string> = {
  // Cílios — lash extension close-ups
  "fox-glow":                   "https://images.pexels.com/photos/3764568/pexels-photo-3764568.jpeg?auto=compress&cs=tinysrgb&w=800",
  "fox-glow-marrom":            "https://images.pexels.com/photos/3685523/pexels-photo-3685523.jpeg?auto=compress&cs=tinysrgb&w=800",
  "volume-brasileiro":          "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=800",
  "volume-brasileiro-marrom":   "https://images.pexels.com/photos/3373714/pexels-photo-3373714.jpeg?auto=compress&cs=tinysrgb&w=800",
  "sublime-4d":                 "https://images.pexels.com/photos/5069373/pexels-photo-5069373.jpeg?auto=compress&cs=tinysrgb&w=800",
  "sublime-4d-light":           "https://images.pexels.com/photos/5069363/pexels-photo-5069363.jpeg?auto=compress&cs=tinysrgb&w=800",
  "volume-5d":                  "https://images.pexels.com/photos/3764568/pexels-photo-3764568.jpeg?auto=compress&cs=tinysrgb&w=800",
  "volume-5c":                  "https://images.pexels.com/photos/3373714/pexels-photo-3373714.jpeg?auto=compress&cs=tinysrgb&w=800",
  "volume-glow":                "https://images.pexels.com/photos/3685523/pexels-photo-3685523.jpeg?auto=compress&cs=tinysrgb&w=800",
  "duo-blend":                  "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=800",
  "remocao-de-cilios":          "https://images.pexels.com/photos/5069383/pexels-photo-5069383.jpeg?auto=compress&cs=tinysrgb&w=800",
  // Manutenções de cílios
  "manutencao-volume-brasileiro":        "https://images.pexels.com/photos/3764568/pexels-photo-3764568.jpeg?auto=compress&cs=tinysrgb&w=800",
  "manutencao-volume-brasileiro-marrom": "https://images.pexels.com/photos/3685523/pexels-photo-3685523.jpeg?auto=compress&cs=tinysrgb&w=800",
  "manutencao-fox-glow":                 "https://images.pexels.com/photos/3373714/pexels-photo-3373714.jpeg?auto=compress&cs=tinysrgb&w=800",
  "manutencao-fox-glow-marrom":          "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=800",
  "manutencao-sublime-4d":               "https://images.pexels.com/photos/5069373/pexels-photo-5069373.jpeg?auto=compress&cs=tinysrgb&w=800",
  "manutencao-sublime-4d-light":         "https://images.pexels.com/photos/5069363/pexels-photo-5069363.jpeg?auto=compress&cs=tinysrgb&w=800",
  "manutencao-volume-5d":                "https://images.pexels.com/photos/3764568/pexels-photo-3764568.jpeg?auto=compress&cs=tinysrgb&w=800",
  "manutencao-volume-5c":                "https://images.pexels.com/photos/3685523/pexels-photo-3685523.jpeg?auto=compress&cs=tinysrgb&w=800",
  "manutencao-volume-glow":              "https://images.pexels.com/photos/3373714/pexels-photo-3373714.jpeg?auto=compress&cs=tinysrgb&w=800",
  "manutencao-duo-blend":                "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=800",
  // Combos
  "volume-brasileiro-manutencao":        "https://images.pexels.com/photos/3764568/pexels-photo-3764568.jpeg?auto=compress&cs=tinysrgb&w=800",
  "volume-brasileiro-marrom-manutencao": "https://images.pexels.com/photos/3685523/pexels-photo-3685523.jpeg?auto=compress&cs=tinysrgb&w=800",
  "fox-glow-manutencao":                 "https://images.pexels.com/photos/3373714/pexels-photo-3373714.jpeg?auto=compress&cs=tinysrgb&w=800",
  "fox-glow-marrom-manutencao":          "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=800",
  "sublime-4d-manutencao":              "https://images.pexels.com/photos/5069373/pexels-photo-5069373.jpeg?auto=compress&cs=tinysrgb&w=800",
  "volume-5d-manutencao":               "https://images.pexels.com/photos/3764568/pexels-photo-3764568.jpeg?auto=compress&cs=tinysrgb&w=800",
  "volume-glow-manutencao":             "https://images.pexels.com/photos/3685523/pexels-photo-3685523.jpeg?auto=compress&cs=tinysrgb&w=800",
  "duo-blend-manutencao":               "https://images.pexels.com/photos/5069363/pexels-photo-5069363.jpeg?auto=compress&cs=tinysrgb&w=800",
  // Sobrancelhas
  "design-de-sobrancelhas":    "https://images.pexels.com/photos/4783234/pexels-photo-4783234.jpeg?auto=compress&cs=tinysrgb&w=800",
  "design-com-coloracao":      "https://images.pexels.com/photos/4783194/pexels-photo-4783194.jpeg?auto=compress&cs=tinysrgb&w=800",
  "brow-lamination":           "https://images.pexels.com/photos/9157321/pexels-photo-9157321.jpeg?auto=compress&cs=tinysrgb&w=800",
  "brow-lamination-design":    "https://images.pexels.com/photos/4783234/pexels-photo-4783234.jpeg?auto=compress&cs=tinysrgb&w=800",
  "brow-lamination-design-com-coloracao": "https://images.pexels.com/photos/4783194/pexels-photo-4783194.jpeg?auto=compress&cs=tinysrgb&w=800",
  "nanoblading":               "https://images.pexels.com/photos/9157321/pexels-photo-9157321.jpeg?auto=compress&cs=tinysrgb&w=800",
  "retoque-nanoblading":       "https://images.pexels.com/photos/4783234/pexels-photo-4783234.jpeg?auto=compress&cs=tinysrgb&w=800",
  "henna":                     "https://images.pexels.com/photos/4783194/pexels-photo-4783194.jpeg?auto=compress&cs=tinysrgb&w=800",
  // Pele
  "limpeza-de-pele-tradicional": "https://images.pexels.com/photos/3373720/pexels-photo-3373720.jpeg?auto=compress&cs=tinysrgb&w=800",
  "limpeza-detox":               "https://images.pexels.com/photos/3622608/pexels-photo-3622608.jpeg?auto=compress&cs=tinysrgb&w=800",
  "limpeza-mineral-glow":        "https://images.pexels.com/photos/2773977/pexels-photo-2773977.jpeg?auto=compress&cs=tinysrgb&w=800",
  "limpeza-clareadora":          "https://images.pexels.com/photos/3373720/pexels-photo-3373720.jpeg?auto=compress&cs=tinysrgb&w=800",
  "limpeza-ouro-glow":           "https://images.pexels.com/photos/3622608/pexels-photo-3622608.jpeg?auto=compress&cs=tinysrgb&w=800",
  "limpeza-premium":             "https://images.pexels.com/photos/2773977/pexels-photo-2773977.jpeg?auto=compress&cs=tinysrgb&w=800",
  "dermaplaning":                "https://images.pexels.com/photos/3373720/pexels-photo-3373720.jpeg?auto=compress&cs=tinysrgb&w=800",
  // Lash lifting / Fio a fio / Micro
  "lash-lifting":               "https://images.pexels.com/photos/5069383/pexels-photo-5069383.jpeg?auto=compress&cs=tinysrgb&w=800",
  "cilios-fio-a-fio":           "https://images.pexels.com/photos/3764568/pexels-photo-3764568.jpeg?auto=compress&cs=tinysrgb&w=800",
  "micropigmentacao-labial":    "https://images.pexels.com/photos/3373714/pexels-photo-3373714.jpeg?auto=compress&cs=tinysrgb&w=800",
};

async function main() {
  const procedures = await db.procedure.findMany({ select: { id: true, slug: true } });

  for (const p of procedures) {
    const url = IMAGES[p.slug];
    if (!url) {
      console.log("No image for slug:", p.slug);
      continue;
    }

    // Upsert primary image
    const existing = await db.procedureImage.findFirst({ where: { procedureId: p.id } });
    if (existing) {
      await db.procedureImage.update({ where: { id: existing.id }, data: { url, isPrimary: true } });
    } else {
      await db.procedureImage.create({ data: { procedureId: p.id, url, isPrimary: true, order: 0 } });
    }
    console.log("✓", p.slug);
  }

  console.log("Done.");
  await db.$disconnect();
}

main().catch(console.error);
