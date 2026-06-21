import type { Meta, StoryObj } from "@storybook/react";

function TypographyStory() {
  const sizes = [
    { label: "Display / 2xl", className: "text-2xl font-bold" },
    { label: "Heading XL / xl", className: "text-xl font-semibold" },
    { label: "Heading LG / lg", className: "text-lg font-semibold" },
    { label: "Body Base", className: "text-base font-normal" },
    { label: "Body SM", className: "text-sm font-normal" },
    { label: "Caption / xs", className: "text-xs font-medium" },
  ];

  return (
    <div className="flex flex-col gap-4 p-6 max-w-lg">
      {sizes.map(({ label, className }) => (
        <div key={label} className="flex flex-col gap-0.5">
          <span className="text-xs text-[#8B6B5A] font-poppins">{label}</span>
          <span className={`font-poppins text-[#5F4B3C] ${className}`}>
            Espaço Vi — Studio de Beleza
          </span>
        </div>
      ))}
    </div>
  );
}

const meta: Meta<typeof TypographyStory> = {
  title: "Tokens/Typography",
  component: TypographyStory,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TypographyStory>;

export const All: Story = {};
