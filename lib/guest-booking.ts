"use server";

import { db } from "@/lib/db";
import { hash, compare } from "bcryptjs";
import { validarSlotAntesDoCheckout } from "@/lib/scheduling";

interface ProcedurePayload {
  id: string;
  name: string;
  priceInCents: number;
  durationMinutes: number;
}

export interface GuestBookingInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  birthDate: string;
  date: string;
  time: string;
  procedures: ProcedurePayload[];
}

export interface GuestBookingResult {
  appointmentId: string;
  isNewUser: boolean;
  userName: string;
  totalPriceInCents: number;
  error?: string;
}

export async function createGuestBooking(
  input: GuestBookingInput
): Promise<GuestBookingResult> {
  const { firstName, lastName, email, password, phone, birthDate, date, time, procedures } = input;

  const [y, mo, d] = date.split("-").map(Number);
  const [h, m] = time.split(":").map(Number);
  const startTime = new Date(y, mo - 1, d, h, m, 0);

  const totalDuration = procedures.reduce((s, p) => s + (p.durationMinutes ?? 0), 0);
  const totalPriceInCents = procedures.reduce((s, p) => s + (p.priceInCents ?? 0), 0);
  const endTime = new Date(startTime.getTime() + totalDuration * 60 * 1000);

  const validation = await validarSlotAntesDoCheckout(startTime, totalDuration);
  if (!validation.valid) {
    return { appointmentId: "", isNewUser: false, userName: "", totalPriceInCents, error: validation.reason };
  }

  let isNewUser = false;
  let existingUser = await db.user.findUnique({ where: { email } });

  if (existingUser) {
    if (existingUser.password) {
      const valid = await compare(password, existingUser.password);
      if (!valid) {
        return {
          appointmentId: "",
          isNewUser: false,
          userName: existingUser.name ?? firstName,
          totalPriceInCents,
          error: "E-mail já cadastrado. Verifique sua senha.",
        };
      }
    }
    // Update contact info if missing
    if (!existingUser.phone && phone) {
      await db.user.update({ where: { id: existingUser.id }, data: { phone } });
    }
  } else {
    const hashedPassword = await hash(password, 12);
    existingUser = await db.user.create({
      data: {
        name: `${firstName} ${lastName}`.trim(),
        email,
        password: hashedPassword,
        phone: phone || null,
        birthDate: birthDate ? new Date(birthDate + "T00:00:00") : null,
      },
    });
    isNewUser = true;
  }

  const appointment = await db.appointment.create({
    data: {
      userId: existingUser.id,
      startTime,
      endTime,
      totalPriceInCents,
      durationMinutes: totalDuration,
      status: "PENDING_PAYMENT",
      procedures: {
        create: procedures.map((p) => ({
          procedureId: p.id,
          name: p.name,
          priceInCents: p.priceInCents ?? 0,
          durationMinutes: p.durationMinutes ?? 0,
        })),
      },
      payment: {
        create: {
          amountInCents: 3000,
          status: "PENDING",
        },
      },
    },
  });

  return {
    appointmentId: appointment.id,
    isNewUser,
    userName: firstName,
    totalPriceInCents,
  };
}
