// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import MenuLateral from "@/components/menu";
 
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
 
export const metadata: Metadata = {
  title: "Viva Condo",
  description: "Painel administrativo do Viva Condo",
};
 
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
 
  return (
<html lang="pt-BR">
<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {session ? (
          // SE ESTÁ LOGADO: Mostra o menu e o conteúdo (que será uma página protegida)
<div className="flex">
<MenuLateral />
<main className="flex-1 ml-18 bg-gray-50 min-h-screen">{children}</main>
</div>
        ) : (
          // SE NÃO ESTÁ LOGADO: Mostra apenas o conteúdo (que será a página de login)
          children
          
        )} 
        
</body>
</html>
  );
}