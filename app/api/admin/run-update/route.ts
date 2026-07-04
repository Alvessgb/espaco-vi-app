import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

const SECRET = "vi2025update";

async function upsertImage(slug: string, url: string) {
  const proc = await db.procedure.findUnique({ where: { slug } });
  if (!proc) return `skip:${slug}`;
  const existing = await db.procedureImage.findFirst({ where: { procedureId: proc.id } });
  if (existing) {
    await db.procedureImage.update({ where: { id: existing.id }, data: { url } });
  } else {
    await db.procedureImage.create({ data: { procedureId: proc.id, url, isPrimary: true, order: 0 } });
  }
  return `ok:${slug}`;
}

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("secret") !== SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const log: string[] = [];

  try {
    // ── Duo Blend ────────────────────────────────────────────────────────────
    await db.procedure.update({
      where: { slug: "duo-blend" },
      data: {
        shortDescription: "Duas técnicas para um olhar exclusivo, versátil e cheio de personalidade.",
        description: "Duas técnicas distintas que se unem para criar um olhar exclusivo, versátil e cheio de personalidade. Cada aplicação é totalmente personalizada ao olhar de cada cliente.",
        badge: null,
        status: "ACTIVE",
        priceInCents: 16000,
      },
    });
    log.push(await upsertImage("duo-blend", "/procedures/duo-blend.jpg"));

    // ── Design sobrancelhas: 30 min ──────────────────────────────────────────
    await db.procedure.update({ where: { slug: "design-sobrancelhas" }, data: { durationMinutes: 30 } });
    log.push(await upsertImage("design-sobrancelhas", "/procedures/design-sobrancelhas.jpg"));

    // ── Brow Lamination: 1h ──────────────────────────────────────────────────
    await db.procedure.update({ where: { slug: "brow-lamination" }, data: { durationMinutes: 60 } });
    log.push(await upsertImage("brow-lamination", "/procedures/brow-lamination.jpg"));

    // ── Brow Lamination + Design: 1h ─────────────────────────────────────────
    await db.procedure.update({ where: { slug: "brow-lamination-design" }, data: { durationMinutes: 60 } });
    log.push(await upsertImage("brow-lamination-design", "/procedures/brow-lamination-design.jpg"));

    // ── Remove fotos erradas ──────────────────────────────────────────────────
    for (const slug of ["design-com-coloracao", "nanoblading", "retoque-nanoblading"]) {
      const proc = await db.procedure.findUnique({ where: { slug } });
      if (proc) {
        await db.procedureImage.deleteMany({ where: { procedureId: proc.id } });
        log.push(`removed-img:${slug}`);
      }
    }

    // ── Limpeza clareadora ────────────────────────────────────────────────────
    await db.procedure.update({
      where: { slug: "limpeza-clareadora" },
      data: {
        shortDescription: "Enriquecido com ativos clareadores que suavizam as manchas, equilibram o tom da pele e revelam um brilho natural e saudável.",
        description: "Enriquecido com ativos clareadores que suavizam as manchas, equilibram o tom da pele e revelam um brilho natural e saudável.",
      },
    });
    log.push(await upsertImage("limpeza-clareadora", "/procedures/limpeza-clareadora.jpg"));

    // ── Limpeza ouro glow ─────────────────────────────────────────────────────
    await db.procedure.update({
      where: { slug: "limpeza-ouro-glow" },
      data: {
        shortDescription: "Com máscara de ouro, que oferece efeito lifting imediato, suaviza rugas e combate os sinais do envelhecimento.",
        description: "Com máscara de ouro, que oferece efeito lifting imediato, suaviza rugas e combate os sinais do envelhecimento. Uma experiência sensorial única com resultados visíveis desde a primeira sessão.",
      },
    });
    log.push(await upsertImage("limpeza-ouro-glow", "/procedures/limpeza-ouro-glow.jpg"));

    // ── Limpeza premium ───────────────────────────────────────────────────────
    await db.procedure.update({
      where: { slug: "limpeza-premium" },
      data: {
        shortDescription: "Uma experiência premium que une a precisão da limpeza de pele aos benefícios renovadores do dermaplaning.",
        description: "Uma experiência premium que une a precisão da limpeza de pele aos benefícios renovadores do dermaplaning. Pele renovada, mais lisa, luminosa e com textura uniforme desde a primeira sessão.",
      },
    });
    log.push(await upsertImage("limpeza-premium", "/procedures/limpeza-premium.jpg"));

    // ── Blonde Brows (criar se não existir) ───────────────────────────────────
    const sobCat = await db.procedureCategory.findFirst({ where: { slug: "sobrancelhas" } });
    if (sobCat) {
      const existing = await db.procedure.findUnique({ where: { slug: "blonde-brows" } });
      if (!existing) {
        const p = await db.procedure.create({
          data: {
            categoryId: sobCat.id,
            name: "Blonde Brows",
            slug: "blonde-brows",
            shortDescription: "Design especializado para sobrancelhas loiras — realce natural e sofisticado.",
            description: "Técnica pensada para quem tem sobrancelhas loiras, claras ou com pouca pigmentação. O procedimento define, realça e encorpa os fios com coloração e design personalizados para um resultado natural e sofisticado.",
            priceInCents: null,
            durationMinutes: 60,
            status: "PRICE_TO_CONFIRM",
            badge: "Valor a confirmar",
            order: 215,
            indicatedFor: "Para quem tem sobrancelhas loiras ou claras e quer mais definição sem perder o natural.",
            expectedResult: "Sobrancelhas definidas, com aspecto encorpado e coloração que valoriza o tom natural.",
            beforeCare: "• Chegar com a pele limpa\n• Informar alergias a tinturas\n• Evitar fazer design nos 7 dias anteriores",
            afterCare: "• Evitar molhar a região por 24h\n• Não esfregar as sobrancelhas\n• Usar protetor solar na área",
          },
        });
        await db.procedureImage.create({
          data: { procedureId: p.id, url: "/procedures/blonde-brow.jpg", isPrimary: true, order: 0 },
        });
        log.push("created:blonde-brows");
      } else {
        log.push(await upsertImage("blonde-brows", "/procedures/blonde-brow.jpg"));
      }
    }

    revalidatePath("/procedimentos");
    revalidatePath("/victoria/procedimentos");

    return NextResponse.json({ ok: true, log });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e), log }, { status: 500 });
  }
}
