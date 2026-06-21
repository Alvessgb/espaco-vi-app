# Design System — Espaço Vi

## Filosofia

Estética quente, feminina e artesanal. Sem azul, sem cores corporativas, sem visual de SaaS.
Tudo em Poppins, fundo bege, cards brancos com bordas nude.

## Cores

| Token | Hex | Uso |
|---|---|---|
| Brown | `#5F4B3C` | Texto principal, botões primários, links |
| Brown dark | `#3D2B1F` | Headings |
| Brown light | `#8B6B5A` | Texto secundário, labels |
| Nude | `#E0C5AC` | Borders, dividers, chips inativos |
| Beige | `#F5EBE0` | Background geral, chips ativos bg |
| White | `#FFFFFF` | Cards |
| Green | `#4CAF50` | Status confirmado, sucesso |
| Red | `#E53935` | Status cancelado, erro |
| Amber | `#F9A825` | Status pendente, aviso |

## Tipografia

- **Fonte:** Poppins (400, 500, 600)
- **Heading:** `text-xl font-semibold text-[#3D2B1F] font-poppins`
- **Body:** `text-sm text-[#5F4B3C] font-poppins`
- **Caption:** `text-xs text-[#8B6B5A] font-poppins`

## Componentes (`components/ds/`)

### Button
```tsx
import { Button } from "@/components/ds/button";

<Button variant="primary">Agendar agora</Button>
<Button variant="ghost">Cancelar</Button>
```

### AppointmentCard
```tsx
import { AppointmentCard } from "@/components/ds/appointment-card";

<AppointmentCard
  id="abc"
  date="21 de junho de 2026"
  time="10:00"
  status="CONFIRMED"
  services={["Design de sobrancelha"]}
  durationMinutes={60}
  totalPrice={8000}
/>
```

### StatusBadge
```tsx
import { StatusBadge } from "@/components/ds/status-badge";

<StatusBadge status="CONFIRMED" />
<StatusBadge status="PENDING_PAYMENT" />
<StatusBadge status="CANCELLED" />
```

### AdminStatCard
```tsx
import { AdminStatCard } from "@/components/ds/admin-stat-card";

<AdminStatCard
  label="Atendimentos hoje"
  value={5}
  icon={<Calendar size={16} />}
/>
```

### CalendarSlot
```tsx
import { CalendarSlot } from "@/components/ds/calendar-slot";

<CalendarSlot time="10:00" available={true} selected={false} onClick={...} />
```

### ProcedureCard
```tsx
import { ProcedureCard } from "@/components/ds/procedure-card";

<ProcedureCard
  name="Lash Lifting"
  category="Cílios"
  price={15000}
  duration={90}
  badge="Mais pedido"
  href="/procedimentos/lash-lifting"
/>
```

## Padrões de layout

- Max width no mobile: `max-w-lg mx-auto px-4 py-6`
- Cards: `bg-white rounded-2xl border border-[#E0C5AC] p-5 shadow-sm`
- Botão primário: `bg-[#5F4B3C] text-white rounded-full px-6 py-3`
- Botão outline: `border border-[#E0C5AC] text-[#5F4B3C] rounded-full px-6 py-3`
