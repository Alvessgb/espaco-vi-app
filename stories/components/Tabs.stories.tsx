"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Tabs } from "@/components/ds/tabs";

const tabs = [
  { value: "cilios", label: "Cílios" },
  { value: "sobrancelhas", label: "Sobrancelhas" },
  { value: "pele", label: "Pele" },
];

function TabsDemo() {
  const [value, setValue] = useState("cilios");
  return (
    <div className="w-80">
      <Tabs tabs={tabs} value={value} onChange={setValue} />
      <div className="p-4 font-poppins text-sm text-[#5F4B3C]">
        Tab ativa: <strong>{value}</strong>
      </div>
    </div>
  );
}

const meta: Meta<typeof TabsDemo> = {
  title: "Components/Tabs",
  component: TabsDemo,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TabsDemo>;

export const Default: Story = {};
