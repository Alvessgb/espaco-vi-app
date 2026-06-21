import type { Meta, StoryObj } from "@storybook/react";
import { AdminStatCard } from "@/components/ds/admin-stat-card";
import { Calendar, DollarSign, Users } from "lucide-react";

const meta: Meta<typeof AdminStatCard> = {
  title: "Components/AdminStatCard",
  component: AdminStatCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AdminStatCard>;

export const Revenue: Story = {
  args: {
    icon: <DollarSign size={18} />,
    label: "Receita do mês",
    value: "R$ 4.320",
    trend: { value: "12%", positive: true },
  },
};

export const Appointments: Story = {
  args: {
    icon: <Calendar size={18} />,
    label: "Agendamentos",
    value: 38,
    trend: { value: "5%", positive: false },
  },
};

export const Clients: Story = {
  args: {
    icon: <Users size={18} />,
    label: "Clientes ativos",
    value: 124,
  },
};
