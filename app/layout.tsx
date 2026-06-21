import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "sonner";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import { espacoViTheme } from "@/lib/antd-theme";
import ptBR from "antd/locale/pt_BR";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Espaço Vi — Studio de Beleza",
  description:
    "Agende seus procedimentos de cílios, sobrancelhas e pele com Victoria Aragão.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <AntdRegistry>
          <ConfigProvider theme={espacoViTheme} locale={ptBR}>
            <QueryProvider>
              {children}
              <Toaster
                toastOptions={{
                  style: {
                    fontFamily: "var(--font-poppins)",
                    background: "#FFFFFF",
                    color: "#5F4B3C",
                    border: "1px solid #E0C5AC",
                  },
                }}
              />
            </QueryProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
