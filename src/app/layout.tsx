"use client";

import { usePathname } from "next/navigation";
import { ToastProvider } from "@/components/toastNotification";
import MenuLateral from "@/components/menu";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // 👇 Verifica se a página atual é o login
  const isLoginPage = pathname === "/";

  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {isLoginPage ? (
          // 🔹 Se for login, mostra só o conteúdo
          <>{children}</>
        ) : (
          // 🔹 Caso contrário, mostra o menu e o conteúdo
          <div className="flex">
            <MenuLateral />
            <main className="flex-1 bg-gray-50 min-h-screen">{children}</main>
          </div>
        )}

        {/* 🔔 Provider global de notificações */}
        <ToastProvider />
      </body>
    </html>
  );
}
