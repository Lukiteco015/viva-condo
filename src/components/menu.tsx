"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { LuBuilding2, LuLogOut, LuMenu, LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { FaHouseUser } from "react-icons/fa";
import { LiaCitySolid } from "react-icons/lia";
import { RxExit } from "react-icons/rx";
import { TbLayoutDashboard } from "react-icons/tb";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Menu() {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar tamanho da tela
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsMobileOpen(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Restaurar estado do sidebar do localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState !== null) setCollapsed(savedState === "true");
  }, []);

  const handleLogout = async () => {
    setLoading(true);

    try {
      await supabase.auth.signOut();
      localStorage.clear();
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      router.push("/");
    } catch (error) {
      console.error("Erro ao sair:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
  };

  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);
  const closeMobileSidebar = () => isMobile && setIsMobileOpen(false);

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: <TbLayoutDashboard size={25}/> },
    { href: "/condominios", label: "Condomínios", icon: <LuBuilding2 size={22} /> },
    { href: "/usuarios", label: "Usuários", icon: <FaHouseUser size={22} /> },
  ];

  return (
    <>
      {isMobile && (
        <button
          onClick={toggleMobileSidebar}
          className="fixed top-4 left-4 z-50 bg-blue-600 text-white p-3 rounded-lg shadow-lg hover:bg-blue-700 transition-colors md:hidden"
        >
          <LuMenu size={24} />
        </button>
      )}

      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          bg-white shadow-lg h-screen flex flex-col border-r border-gray-200
          transition-all duration-300 ease-in-out
          ${isMobile ? (isMobileOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
          ${collapsed && !isMobile ? "w-20" : "w-64"}
        `}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 min-h-[73px]">
          <div className={`flex items-center gap-3 transition-all duration-300 ${collapsed && !isMobile ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <LiaCitySolid size={50} className="text-white"/>
            </div>
            <span className="text-xl font-bold text-white whitespace-nowrap">Viva Condo</span>
          </div>

          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="absolute -right-6 top-1/2 -translate-y-1/2 bg-blue-600 text-white hover:bg-blue-700 p-2 rounded-full transition-all duration-300 shadow-lg border-2 border-white z-10"
            >
              {collapsed ? <LuChevronRight size={18} /> : <LuChevronLeft size={18} />}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-6 px-3 space-y-2 overflow-y-auto">
          {links.map(({ href, label, icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={closeMobileSidebar}
                className={`
                  group relative flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200 ease-in-out
                  ${collapsed && !isMobile ? "justify-center" : ""}
                  ${active ? "bg-blue-600 text-white shadow-md" : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"}
                `}
              >
                <span className="flex-shrink-0">{icon}</span>
                <span className={`font-medium transition-all duration-300 whitespace-nowrap ${collapsed && !isMobile ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer - Logout */}
        <div className="border-t border-gray-200 p-3 mt-auto">
          <button
            onClick={handleLogout}
            disabled={loading}
            className={`group relative w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 ${collapsed && !isMobile ? "justify-center" : ""}`}
          >
            <RxExit size={22} className="flex-shrink-0" />
            <span className="font-medium">{loading ? "Saindo..." : "Sair"}</span>
          </button>
        </div>
      </aside>

      {!isMobile && <div className={`flex-shrink-0 transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`} />}
    </>
  );
}
