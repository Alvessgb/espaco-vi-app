import type { Meta, StoryObj } from "@storybook/react";
import { CalendarSlot } from "@/components/ds/calendar-slot";

const meta: Meta<typeof CalendarSlot> = {
  title: "Components/CalendarSlot",
  component: CalendarSlot,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CalendarSlot>;

export const Available: Story = { args: { time: "09:00", state: "available" } };
export const Selected: Story = { args: { time: "10:00", state: "selected" } };
export const Unavailable: Story = { args: { time: "11:00", state: "unavailable" } };

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-2 p-4">
      {["08:00","09:00","10:00","11:00","14:00","15:00","16:00","17:00"].map((t, i) => (
        <CalendarSlot
          key={t}
          time={t}
          state={i === 2 ? "selected" : i === 5 ? "unavailable" : "available"}
          onClick={() => console.log(t)}
        />
      ))}
    </div>
  ),
};
