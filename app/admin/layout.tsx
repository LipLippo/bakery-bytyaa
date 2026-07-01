"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  ShoppingCart,
  Box,
  ShoppingBag,
  FileText,
  Search,
  Maximize,
  Mail,
  Bell,
  LogOut,
  Plus,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Kasir POS", href: "/admin/kasir", icon: ShoppingCart },
    { name: "Produk", href: "/admin/produk", icon: Box },
    { name: "Laporan", href: "/admin/laporan", icon: FileText },
  ];

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-50 w-[260px] flex-shrink-0 flex flex-col transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        style={{
          backgroundColor: "var(--card)",
          borderRight: "1px solid var(--border)",
        }}
      >
        {/* Brand */}
        <div
          style={{
            height: "70px",
            display: "flex",
            alignItems: "center",
            padding: "0 1.5rem",
            borderBottom: "1px solid var(--border)",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              backgroundColor: "var(--primary)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            {/* Cookie icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="1.5"/>
              <circle cx="9" cy="9" r="1.5" fill="white"/>
              <circle cx="14" cy="8" r="1" fill="white"/>
              <circle cx="8" cy="14" r="1" fill="white"/>
              <circle cx="13" cy="14" r="1.5" fill="white"/>
              <circle cx="11" cy="11.5" r="0.8" fill="white"/>
            </svg>
          </div>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.3rem", color: "var(--primary)" }}>
            ByTyaa Admin
          </span>
          </div>
          <button className="md:hidden text-[var(--text-muted)]" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* User Profile in Sidebar */}
        <div style={{ padding: "1.5rem 1.5rem 0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "var(--secondary)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 600,
                fontSize: "1.1rem",
              }}
            >
              AU
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>
                Admin UMKM
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Manager</div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav style={{ flex: 1, padding: "1rem 0" }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {menuItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05, duration: 0.4, ease: EASE }}
                  style={{ position: "relative" }}
                >
                  <Link
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "0.85rem 1.5rem",
                      textDecoration: "none",
                      color: isActive ? "var(--secondary)" : "var(--text-muted)",
                      fontWeight: isActive ? 600 : 500,
                      fontSize: "0.95rem",
                      gap: "0.75rem",
                      transition: "background-color 0.2s, color 0.2s",
                    }}
                  >
                    <item.icon size={18} />
                    {item.name}
                  </Link>
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-indicator"
                      transition={{ duration: 0.3, ease: EASE }}
                      style={{
                        position: "absolute",
                        right: "1.5rem",
                        top: "50%",
                        marginTop: "-3px",
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: "var(--secondary)",
                      }}
                    />
                  )}
                </motion.li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Sidebar Watermark */}
        <div style={{ padding: "1.5rem", textAlign: "center", borderTop: "1px solid var(--border)", marginTop: "auto" }}>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", color: "var(--primary)", margin: "0 0 0.2rem 0" }}>ByTyaa</p>
          <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>Homemade Cookies</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header
          className="h-[70px] flex items-center justify-between px-4 md:px-8 sticky top-0 z-30"
          style={{
            backgroundColor: "var(--card)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-4">
            <button className="md:hidden text-[var(--text)]" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            {/* Search - Hidden on very small screens */}
            <div
              className="hidden sm:flex items-center"
              style={{
              backgroundColor: "var(--background)",
              borderRadius: "0.5rem",
              padding: "0.5rem 1rem",
              width: "300px",
              border: "1px solid var(--border)",
            }}
          >
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Cari data..."
              style={{
                border: "none",
                backgroundColor: "transparent",
                outline: "none",
                marginLeft: "0.75rem",
                fontSize: "0.95rem",
                width: "100%",
                color: "var(--text)",
              }}
            />
          </div>
          </div>

          {/* Top Right Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div className="hidden md:flex items-center gap-2 cursor-pointer">
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  backgroundColor: "var(--secondary)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                AU
              </div>
              <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--text)" }}>
                Admin UMKM
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            <div className="hidden md:block w-[1px] h-[24px]" style={{ backgroundColor: "var(--border)" }} />

            <div style={{ display: "flex", gap: "1rem", color: "var(--text-muted)" }}>
              <Maximize size={20} className="hidden md:block" style={{ cursor: "pointer" }} />
              <Mail size={20} className="hidden md:block" style={{ cursor: "pointer" }} />
              <div style={{ position: "relative", cursor: "pointer" }}>
                <Bell size={20} />
                <div style={{ position: "absolute", top: 0, right: 0, width: "6px", height: "6px", backgroundColor: "var(--secondary)", borderRadius: "50%" }} />
              </div>
              <Link href="/">
                <LogOut size={20} style={{ cursor: "pointer", color: "var(--text-muted)" }} />
              </Link>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 md:p-8 flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
