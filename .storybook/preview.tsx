import type { Preview } from "@storybook/react";
import "../app/globals.css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "vi-bg",
      values: [
        { name: "vi-bg", value: "#F5EBE0" },
        { name: "white", value: "#FFFFFF" },
        { name: "dark", value: "#2C1F17" },
      ],
    },
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color|fill|stroke)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
