import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

// Eye/lash images
const EYE1 = "https://images.pexels.com/photos/3764568/pexels-photo-3764568.jpeg?auto=compress&cs=tinysrgb&w=800";
const EYE2 = "https://images.pexels.com/photos/3685523/pexels-photo-3685523.jpeg?auto=compress&cs=tinysrgb&w=800";
const EYE3 = "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=800";
const EYE4 = "https://images.pexels.com/photos/3373714/pexels-photo-3373714.jpeg?auto=compress&cs=tinysrgb&w=800";
const EYE5 = "https://images.pexels.com/photos/5069373/pexels-photo-5069373.jpeg?auto=compress&cs=tinysrgb&w=800";
const BROW = "https://images.pexels.com/photos/4783234/pexels-photo-4783234.jpeg?auto=compress&cs=tinysrgb&w=800";
const SKIN = "https://images.pexels.com/photos/3373720/pexels-photo-3373720.jpeg?auto=compress&cs=tinysrgb&w=800";

const SLUG_MAP: Record<string, string> = {
  "combo-fox-glow-marrom":          EYE2,
  "remocao-cilios":                 EYE1,
  "combo-sublime-4d":               EYE5,
  "combo-volume-brasileiro":        EYE1,
  "combo-volume-brasileiro-marrom": EYE2,
  "combo-fox-glow":                 EYE3,
  "combo-volume-glow":              EYE4,
  "design-sobrancelhas":            BROW,
  "combo-duo-blend":                EYE4,
  "brow-lamination-design-coloracao": BROW,
  "combo-volume-5d":                EYE5,
  "limpeza-pele-tradicional":       SKIN,
};

async function main() {
  const procedures = await db.procedure.findMany({ select: { id: true, slug: true } });
  for (const p of procedures) {
    const url = SLUG_MAP[p.slug];
    if (!url) continue;
    const existing = await db.procedureImage.findFirst({ where: { procedureId: p.id } });
    if (existing) {
      await db.procedureImage.update({ where: { id: existing.id }, data: { url } });
    } else {
      await db.procedureImage.create({ data: { procedureId: p.id, url, isPrimary: true, order: 0 } });
    }
    console.log("✓", p.slug);
  }
  console.log("Done.");
  await db.$disconnect();
}
main().catch(console.error);
