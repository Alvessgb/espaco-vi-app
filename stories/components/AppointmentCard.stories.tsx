import type { Meta, StoryObj } from "@storybook/react";
import { AppointmentCard } from "@/components/ds/appointment-card";

const meta: Meta<typeof AppointmentCard> = {
  title: "Components/AppointmentCard",
  component: AppointmentCard,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof AppointmentCard>;

const base = {
  id: "1",
  date: "21 de junho de 2026",
  time: "10:00",
  services: ["Volume Russo", "Design de sobrancelha"],
  durationMinutes: 165,
  totalPrice: 24000,
};

export const PendingPayment: Story = {
  args: { ...base, status: "PENDING_PAYMENT", onCancel: () => alert("cancelar") },
};

export const Confirmed: Story = {
  args: { ...base, status: "CONFIRMED", onCancel: () => alert("cancelar") },
};

export const Completed: Story = {
  args: { ...base, status: "COMPLETED" },
};

export const Cancelled: Story = {
  args: { ...base, status: "CANCELLED" },
};
