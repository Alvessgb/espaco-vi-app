import type { Meta, StoryObj } from "@storybook/react";
import { ProcedureCard } from "@/components/ds/procedure-card";

const meta: Meta<typeof ProcedureCard> = {
  title: "Components/ProcedureCard",
  component: ProcedureCard,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ProcedureCard>;

const defaultArgs = {
  id: "1",
  slug: "volume-russo",
  name: "Volume Russo",
  shortDescription: "Extensão de cílios com técnica de leque para máximo volume.",
  price: 18000,
  durationMinutes: 120,
  onAdd: () => alert("Adicionado!"),
  onViewDetails: () => alert("Detalhes!"),
};

export const Default: Story = { args: defaultArgs };

export const WithBadge: Story = {
  args: { ...defaultArgs, badge: "Mais pedido" },
};

export const InCart: Story = {
  args: { ...defaultArgs, isInCart: true },
};

export const ShortDuration: Story = {
  args: { ...defaultArgs, name: "Retirada de cílios", durationMinutes: 30, price: 5000 },
};
