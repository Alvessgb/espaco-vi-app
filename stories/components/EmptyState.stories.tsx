import type { Meta, StoryObj } from "@storybook/react";
import { EmptyState } from "@/components/ds/empty-state";
import { Calendar } from "lucide-react";

const meta: Meta<typeof EmptyState> = {
  title: "Components/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const WithAction: Story = {
  args: {
    icon: <Calendar size={48} />,
    title: "Nenhum agendamento",
    description: "Você ainda não tem agendamentos. Que tal explorar nossos procedimentos?",
    action: { label: "Ver procedimentos", onClick: () => alert("navigate") },
  },
};

export const WithoutAction: Story = {
  args: {
    icon: <Calendar size={48} />,
    title: "Sem resultados",
    description: "Nenhum procedimento encontrado para essa categoria.",
  },
};
