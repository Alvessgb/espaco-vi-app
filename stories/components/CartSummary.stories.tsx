import type { Meta, StoryObj } from "@storybook/react";
import { CartSummary } from "@/components/ds/cart-summary";

const meta: Meta<typeof CartSummary> = {
  title: "Components/CartSummary",
  component: CartSummary,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof CartSummary>;

const items = [
  { id: "1", name: "Volume Russo", price: 18000, durationMinutes: 120 },
  { id: "2", name: "Design de sobrancelha", price: 6000, durationMinutes: 45 },
];

export const WithItems: Story = {
  args: {
    items,
    onRemove: (id) => console.log("remove", id),
    onCheckout: () => console.log("checkout"),
    onClear: () => console.log("clear"),
  },
};

export const Empty: Story = {
  args: { items: [] },
};
