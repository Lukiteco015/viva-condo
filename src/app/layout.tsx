"use client";

import Menu from "@/components/menu";
import "./globals.css";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Menu só aparece se não estiver na página de login
  const showMenu = pathname !== "/login";

  return (
    <html lang="pt-BR">
      <body className="flex h-screen bg-gray-100">
        {showMenu && <Menu />}
        <main className={`flex-1 transition-all duration-300 p-6 ${showMenu ? "ml-10" : ""}`}>
          {children}
        </main>
      </body>
    </html>
  );
}
