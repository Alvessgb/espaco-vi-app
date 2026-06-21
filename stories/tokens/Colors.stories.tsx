import type { Meta, StoryObj } from "@storybook/react";
import { colors } from "@/lib/design-system/tokens";

const ColorSwatch = ({
  name,
  value,
}: {
  name: string;
  value: string;
}) => (
  <div className="flex flex-col gap-1 items-center">
    <div
      className="w-16 h-16 rounded-xl border border-[#E0C5AC]"
      style={{ backgroundColor: value }}
    />
    <span className="font-poppins text-xs text-[#5F4B3C] font-medium">{name}</span>
    <span className="font-poppins text-xs text-[#8B6B5A]">{value}</span>
  </div>
);

function ColorsStory() {
  return (
    <div className="flex flex-wrap gap-6 p-6">
      {Object.entries(colors).map(([name, value]) => (
        <ColorSwatch key={name} name={name} value={value} />
      ))}
    </div>
  );
}

const meta: Meta<typeof ColorsStory> = {
  title: "Tokens/Colors",
  component: ColorsStory,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ColorsStory>;

export const All: Story = {};
