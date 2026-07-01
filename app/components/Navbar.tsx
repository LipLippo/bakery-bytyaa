"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import LoginModal from "./LoginModal";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Navbar() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "rgba(240, 230, 211, 0.92)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "0 1.5rem",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Left nav links */}
          <div
            className="hidden md:flex gap-8 text-[0.82rem] font-medium tracking-[0.04em] uppercase"
          >
            <Link
              href="#home"
              style={{ color: "var(--text)", transition: "color 0.2s" }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = "var(--secondary)")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = "var(--text)")
              }
            >
              Home
            </Link>
            <Link
              href="#menu"
              style={{ color: "var(--text)", transition: "color 0.2s" }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = "var(--secondary)")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = "var(--text)")
              }
            >
              Menu
            </Link>
            <Link
              href="#about"
              style={{ color: "var(--text)", transition: "color 0.2s" }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = "var(--secondary)")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = "var(--text)")
              }
            >
              About
            </Link>
          </div>

          {/* Center logo */}
          <div style={{ textAlign: "center" }}>
            <Link href="#home">
              <div
                className="logo"
                style={{
                  fontSize: "1.6rem",
                  color: "var(--primary)",
                  letterSpacing: "0.02em",
                  lineHeight: 1,
                }}
              >
                ByTyaa
              </div>
              <div
                style={{
                  fontSize: "0.58rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  fontWeight: 500,
                }}
              >
                Homemade Cookies
              </div>
            </Link>
          </div>

          {/* Right buttons */}
          <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
            {/* Login button */}
            <button
              id="btn-login-admin"
              onClick={() => setLoginOpen(true)}
              style={{
                padding: "0.42rem 0.9rem",
                borderRadius: "999px",
                border: "1.5px solid var(--border)",
                fontSize: "0.78rem",
                fontWeight: 500,
                color: "var(--text-muted)",
                background: "transparent",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "var(--primary)";
                el.style.color = "var(--primary)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "var(--border)";
                el.style.color = "var(--text-muted)";
              }}
            >
              {/* Lock icon */}
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Login
            </button>

            {/* Menu button */}
            <Link
              href="#menu"
              style={{
                padding: "0.45rem 1.1rem",
                borderRadius: "999px",
                border: "1.5px solid var(--text)",
                fontSize: "0.82rem",
                fontWeight: 500,
                color: "var(--text)",
                background: "transparent",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                const el = e.target as HTMLElement;
                el.style.background = "var(--text)";
                el.style.color = "var(--background)";
              }}
              onMouseLeave={(e) => {
                const el = e.target as HTMLElement;
                el.style.background = "transparent";
                el.style.color = "var(--text)";
              }}
            >
              Menu
            </Link>

            {/* Order button */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("openOrderModal"))}
              style={{
                padding: "0.45rem 1.1rem",
                borderRadius: "999px",
                background: "var(--text)",
                color: "var(--background)",
                fontSize: "0.82rem",
                fontWeight: 500,
                transition: "all 0.2s",
                display: "inline-block",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.background = "var(--primary)")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.background = "var(--text)")
              }
            >
              Order
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Login Modal */}
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
