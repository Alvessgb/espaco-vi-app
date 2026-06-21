import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "@/components/ds/badge";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Category: Story = { args: { variant: "category", children: "Cílios" } };
export const Success: Story = { args: { variant: "success", children: "Confirmado" } };
export const Error: Story = { args: { variant: "error", children: "Cancelado" } };
export const Warning: Story = { args: { variant: "warning", children: "Pendente" } };
export const Price: Story = { args: { variant: "price", children: "Promoção" } };

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="category">Cílios</Badge>
      <Badge variant="success">Confirmado</Badge>
      <Badge variant="error">Cancelado</Badge>
      <Badge variant="warning">Pendente</Badge>
      <Badge variant="price">Promoção</Badge>
      <Badge variant="neutral">Concluído</Badge>
    </div>
  ),
};
