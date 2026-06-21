import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "@/components/ds/input";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { placeholder: "seu@email.com" },
};

export const WithLabel: Story = {
  args: { label: "Email", placeholder: "seu@email.com", type: "email" },
};

export const WithError: Story = {
  args: { label: "Email", placeholder: "seu@email.com", error: "Email inválido" },
};

export const Disabled: Story = {
  args: { label: "Nome", value: "Victoria Aragão", disabled: true },
};
