import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Debales AI — Multi-tenant AI Assistant",
  description: "AI-powered sales assistant platform with multi-tenant architecture",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#0a0a0f] text-[#f0f0f5] antialiased">
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#16161f",
                color: "#f0f0f5",
                border: "1px solid rgba(255,255,255,0.07)",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
              },
              success: {
                iconTheme: { primary: "#10b981", secondary: "#0a0a0f" },
              },
              error: {
                iconTheme: { primary: "#f43f5e", secondary: "#0a0a0f" },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
