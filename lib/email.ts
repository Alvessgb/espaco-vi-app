import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY!);
  }
  return _resend;
}

const FROM = process.env.EMAIL_FROM ?? "Espaço Vi <noreply@espacovi.com.br>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const VICTORIA_EMAIL = process.env.ADMIN_EMAIL ?? "victoria@espacovi.com.br";

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
    body { margin:0; padding:0; background-color:#F5EBE0; font-family:'Poppins',sans-serif; }
    .wrapper { max-width:520px; margin:0 auto; padding:32px 16px; }
    .card { background:#fff; border-radius:16px; border:1px solid #E0C5AC; padding:32px; }
    .logo { font-size:20px; font-weight:600; color:#5F4B3C; margin-bottom:24px; text-align:center; }
    h1 { font-size:18px; font-weight:600; color:#3D2B1F; margin:0 0 8px; }
    p { font-size:14px; color:#8B6B5A; margin:0 0 12px; line-height:1.6; }
    .detail-row { display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #F5EBE0; font-size:13px; }
    .detail-label { color:#8B6B5A; }
    .detail-value { color:#3D2B1F; font-weight:500; }
    .btn { display:inline-block; background:#5F4B3C; color:#fff; text-decoration:none; padding:12px 28px; border-radius:999px; font-size:14px; font-weight:500; margin-top:20px; }
    .footer { text-align:center; font-size:12px; color:#8B6B5A; margin-top:24px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="logo">Espaço Vi</div>
    <div class="card">
      ${content}
    </div>
    <div class="footer">Espaço Vi · estética com cuidado e intenção</div>
  </div>
</body>
</html>`;
}

export async function sendBookingConfirmationToClient(data: {
  to: string;
  name: string;
  date: string;
  time: string;
  services: string[];
  totalDuration: number;
  totalPrice: number;
}): Promise<void> {
  const servicesList = data.services.map((s) => `<li style="font-size:13px;color:#5F4B3C;margin-bottom:4px;">${s}</li>`).join("");
  const price = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(data.totalPrice / 100);

  const content = `
    <h1>Agendamento confirmado! 🌸</h1>
    <p>Olá, <strong>${data.name}</strong>! Seu agendamento está confirmado. Mal podemos esperar para te receber.</p>

    <div class="detail-row">
      <span class="detail-label">Data</span>
      <span class="detail-value">${data.date}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Horário</span>
      <span class="detail-value">${data.time}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Duração</span>
      <span class="detail-value">${data.totalDuration}min</span>
    </div>
    <div class="detail-row" style="border-bottom:none;">
      <span class="detail-label">Total</span>
      <span class="detail-value">${price}</span>
    </div>

    <p style="margin-top:16px;">Procedimentos:</p>
    <ul style="margin:0 0 16px;padding-left:20px;">${servicesList}</ul>

    <p style="font-size:12px;color:#8B6B5A;background:#F5EBE0;border-radius:8px;padding:10px;">
      A taxa de agendamento de R$30,00 já foi paga e será abatida no valor total no dia do atendimento.
    </p>

    <a href="${APP_URL}/meus-agendamentos" class="btn">Ver meus agendamentos</a>
  `;

  await getResend().emails.send({
    from: FROM,
    to: data.to,
    subject: "Agendamento confirmado no Espaço Vi! 🌸",
    html: baseTemplate(content),
  });
}

export async function sendNewBookingToVictoria(data: {
  clientName: string;
  date: string;
  time: string;
  services: string[];
  totalDuration: number;
}): Promise<void> {
  const servicesList = data.services.map((s) => `<li style="font-size:13px;color:#5F4B3C;margin-bottom:4px;">${s}</li>`).join("");

  const content = `
    <h1>Novo agendamento</h1>
    <p>Uma nova cliente agendou um horário.</p>

    <div class="detail-row">
      <span class="detail-label">Cliente</span>
      <span class="detail-value">${data.clientName}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Data</span>
      <span class="detail-value">${data.date}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Horário</span>
      <span class="detail-value">${data.time}</span>
    </div>
    <div class="detail-row" style="border-bottom:none;">
      <span class="detail-label">Duração</span>
      <span class="detail-value">${data.totalDuration}min</span>
    </div>

    <p style="margin-top:16px;">Procedimentos:</p>
    <ul style="margin:0 0 16px;padding-left:20px;">${servicesList}</ul>

    <a href="${APP_URL}/victoria/agenda/dia" class="btn">Ver agenda</a>
  `;

  await getResend().emails.send({
    from: FROM,
    to: VICTORIA_EMAIL,
    subject: `Novo agendamento: ${data.clientName} — ${data.date} às ${data.time}`,
    html: baseTemplate(content),
  });
}

export async function sendReviewRequest(data: {
  to: string;
  name: string;
  appointmentId: string;
}): Promise<void> {
  const content = `
    <h1>Como foi sua experiência?</h1>
    <p>Olá, <strong>${data.name}</strong>! Esperamos que você tenha adorado o atendimento. Sua opinião é muito importante para nós.</p>
    <p>Leva menos de um minutinho e ajuda outras clientes a conhecerem o Espaço Vi. 🌸</p>
    <a href="${APP_URL}/avaliar/${data.appointmentId}" class="btn">Deixar avaliação</a>
    <p style="margin-top:16px;font-size:12px;">Com carinho,<br/>Victoria — Espaço Vi</p>
  `;

  await getResend().emails.send({
    from: FROM,
    to: data.to,
    subject: "Como foi seu atendimento no Espaço Vi? 💛",
    html: baseTemplate(content),
  });
}

// Legacy functions kept for backwards compatibility
export async function sendAppointmentConfirmedEmail(
  to: string,
  name: string,
  date: string,
  services: string[]
) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: "Seu agendamento foi confirmado! 🌸",
    html: `
      <h1>Olá, ${name}!</h1>
      <p>Seu agendamento foi confirmado para <strong>${date}</strong>.</p>
      <p>Serviços: ${services.join(", ")}</p>
      <p><a href="${APP_URL}/meus-agendamentos">Ver meus agendamentos</a></p>
      <p>Até logo,<br/>Equipe Espaço Vi</p>
    `,
  });
}

export async function sendAppointmentCancelledEmail(
  to: string,
  name: string,
  date: string
) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: "Agendamento cancelado",
    html: `
      <h1>Olá, ${name}!</h1>
      <p>Seu agendamento do dia <strong>${date}</strong> foi cancelado.</p>
      <p>Se precisar remarcar, acesse: <a href="${APP_URL}/procedimentos">nossos serviços</a></p>
      <p>Equipe Espaço Vi</p>
    `,
  });
}

export async function sendAppointmentReminderEmail(
  to: string,
  name: string,
  date: string,
  services: string[]
) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: "Lembrete: seu agendamento é amanhã!",
    html: `
      <h1>Olá, ${name}!</h1>
      <p>Lembrete: você tem um agendamento amanhã, <strong>${date}</strong>.</p>
      <p>Serviços: ${services.join(", ")}</p>
      <p>Até logo,<br/>Equipe Espaço Vi</p>
    `,
  });
}
