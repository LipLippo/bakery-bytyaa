"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(
          error.message === "Invalid login credentials"
            ? "Email atau password salah. Coba lagi."
            : error.message
        );
      } else {
        // Redirect to admin dashboard on success
        window.location.href = "/admin";
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 200,
              background: "rgba(44, 74, 110, 0.18)",
              backdropFilter: "blur(6px)",
            }}
          />

          {/* Full-screen overlay */}
          <motion.div
            key="modal-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 201,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              // Soft warm gradient background like reference
              background:
                "radial-gradient(ellipse at 60% 40%, rgba(234,106,92,0.10) 0%, transparent 60%), radial-gradient(ellipse at 30% 70%, rgba(44,74,110,0.08) 0%, transparent 55%), #f0e6d3",
              padding: "1rem",
            }}
          >
            {/* Back button — top left */}
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: "1.5rem",
                left: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "rgba(255,250,242,0.85)",
                border: "1px solid var(--border)",
                borderRadius: "999px",
                padding: "0.45rem 1rem",
                fontSize: "0.82rem",
                fontWeight: 500,
                color: "var(--text)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "#fff")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "rgba(255,250,242,0.85)")
              }
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Kembali
            </button>

            {/* Login Card */}
            <motion.div
              key="modal-card"
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 24 }}
              transition={{ duration: 0.4, ease: EASE }}
              style={{
                background: "#fff",
                borderRadius: "1.5rem",
                padding: "2.5rem 2.25rem",
                width: "100%",
                maxWidth: "420px",
                boxShadow:
                  "0 8px 48px rgba(44,74,110,0.12), 0 2px 12px rgba(44,74,110,0.07)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Logo */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginBottom: "1.75rem",
                }}
              >
                {/* Brand icon */}
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "14px",
                    background: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "0.75rem",
                    boxShadow: "0 4px 16px rgba(44,74,110,0.25)",
                  }}
                >
                  {/* Cookie icon */}
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="1.5"/>
                    <circle cx="9" cy="9" r="1.5" fill="white"/>
                    <circle cx="14" cy="8" r="1" fill="white"/>
                    <circle cx="8" cy="14" r="1" fill="white"/>
                    <circle cx="13" cy="14" r="1.5" fill="white"/>
                    <circle cx="11" cy="11.5" r="0.8" fill="white"/>
                  </svg>
                </div>

                <div
                  className="logo"
                  style={{
                    fontSize: "1.2rem",
                    color: "var(--primary)",
                    letterSpacing: "0.02em",
                    lineHeight: 1,
                    marginBottom: "0.15rem",
                  }}
                >
                  ByTyaa
                </div>
                <div
                  style={{
                    fontSize: "0.6rem",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    fontWeight: 500,
                  }}
                >
                  Homemade Cookies
                </div>
              </div>

              {/* Title */}
              <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.6rem",
                    color: "var(--text)",
                    marginBottom: "0.35rem",
                  }}
                >
                  Masuk Admin
                </h2>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Kelola katalog dan produk ByTyaa
                </p>
              </div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: "0.75rem",
                      padding: "0.75rem 1rem",
                      marginBottom: "1rem",
                      fontSize: "0.84rem",
                      color: "#dc2626",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleLogin}>
                {/* Email */}
                <div style={{ marginBottom: "1rem" }}>
                  <label
                    htmlFor="login-email"
                    style={{
                      display: "block",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "var(--text)",
                      marginBottom: "0.4rem",
                    }}
                  >
                    Alamat Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@bytyaa.com"
                    style={{
                      width: "100%",
                      padding: "0.7rem 1rem",
                      border: "1.5px solid #e5e7eb",
                      borderRadius: "0.75rem",
                      fontSize: "0.9rem",
                      outline: "none",
                      background: "#fafafa",
                      color: "var(--text)",
                      transition: "border-color 0.2s",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "var(--primary)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "#e5e7eb")
                    }
                  />
                </div>

                {/* Password */}
                <div style={{ marginBottom: "1rem" }}>
                  <label
                    htmlFor="login-password"
                    style={{
                      display: "block",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "var(--text)",
                      marginBottom: "0.4rem",
                    }}
                  >
                    Kata Sandi
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{
                        width: "100%",
                        padding: "0.7rem 2.75rem 0.7rem 1rem",
                        border: "1.5px solid #e5e7eb",
                        borderRadius: "0.75rem",
                        fontSize: "0.9rem",
                        outline: "none",
                        background: "#fafafa",
                        color: "var(--text)",
                        transition: "border-color 0.2s",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderColor = "var(--primary)")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = "#e5e7eb")
                      }
                    />
                    {/* Show/hide toggle */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "0.75rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-muted)",
                        padding: "0.2rem",
                        lineHeight: 1,
                      }}
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember me + Forgot password */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1.5rem",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      fontSize: "0.82rem",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      style={{
                        width: "15px",
                        height: "15px",
                        accentColor: "var(--primary)",
                        cursor: "pointer",
                      }}
                    />
                    Ingat saya
                  </label>
                  <button
                    type="button"
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "0.82rem",
                      color: "var(--primary)",
                      cursor: "pointer",
                      fontWeight: 500,
                      padding: 0,
                    }}
                    onClick={() => alert("Hubungi administrator untuk reset password.")}
                  >
                    Lupa sandi?
                  </button>
                </div>

                {/* Submit button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    width: "100%",
                    padding: "0.85rem",
                    borderRadius: "0.75rem",
                    background: loading ? "#aaa" : "var(--secondary)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    letterSpacing: "0.03em",
                    transition: "background 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid rgba(255,255,255,0.4)",
                          borderTop: "2px solid #fff",
                          borderRadius: "50%",
                        }}
                      />
                      Memproses...
                    </>
                  ) : (
                    "Masuk"
                  )}
                </motion.button>
              </form>

              {/* Footer note */}
              <p
                style={{
                  textAlign: "center",
                  marginTop: "1.25rem",
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                }}
              >
                Hanya untuk admin ByTyaa.{" "}
                <a
                  href="https://wa.me/6285701505778?text=Halo%2C%20saya%20ingin%20mengakses%20admin%20ByTyaa"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "var(--primary)",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Hubungi admin
                </a>
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
