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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
          <style>
            {`
              .login-modal-card {
                flex-direction: row;
              }
              .login-left-panel {
                flex: 0 0 45%;
                border-radius: 0 12rem 12rem 0;
              }
              .login-right-panel {
                padding: 4rem;
              }
              @media (max-width: 768px) {
                .login-modal-card {
                  flex-direction: column !important;
                  max-width: 420px !important;
                  min-height: auto !important;
                }
                .login-left-panel {
                  flex: none !important;
                  padding: 3.5rem 2rem 2.5rem 2rem !important;
                  border-radius: 0 0 3rem 3rem !important;
                }
                .login-right-panel {
                  padding: 2.5rem 2rem !important;
                }
              }
            `}
          </style>

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
              background: "rgba(44, 74, 110, 0.25)",
              backdropFilter: "blur(5px)",
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
              backgroundColor: "var(--background, #f0e6d3)",
              backgroundImage: "url('/bakery-pattern.png')",
              backgroundSize: "450px 450px",
              backgroundRepeat: "repeat",
              padding: "1rem",
            }}
          >
            {/* Login Card */}
            <motion.div
              className="login-modal-card"
              key="modal-card"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.4, ease: EASE }}
              style={{
                background: "var(--card, #fffaf2)",
                borderRadius: "1.5rem",
                width: "100%",
                maxWidth: "850px",
                minHeight: "500px",
                display: "flex",
                overflow: "hidden",
                boxShadow: "0 20px 40px rgba(44,74,110,0.12)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left Panel */}
              <div
                className="login-left-panel"
                style={{
                  background: "var(--primary, #2c4a6e)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "3rem",
                  color: "white",
                  textAlign: "center",
                  position: "relative",
                  zIndex: 1,
                  boxShadow: "4px 0 24px rgba(44,74,110,0.15)",
                }}
              >
                {/* Back button — moved inside the card */}
                <button
                  onClick={onClose}
                  style={{
                    position: "absolute",
                    top: "1.25rem",
                    left: "1.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "999px",
                    padding: "0.5rem 1rem",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    color: "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.2)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)")
                  }
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 5l-7 7 7 7" />
                  </svg>
                  Kembali
                </button>

                <h2 style={{ fontSize: "2.4rem", fontWeight: 700, marginBottom: "0.5rem", lineHeight: 1.2, fontFamily: "var(--font-heading)" }}>
                  Hello, Welcome!
                </h2>
                <p style={{ fontSize: "1rem", opacity: 0.9, marginTop: "0.5rem", color: "var(--border, #e0d0bc)" }}>
                  To ByTyaa Admin Panel
                </p>
              </div>

              {/* Right Panel */}
              <div
                className="login-right-panel"
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <h2
                  style={{
                    fontSize: "2.2rem",
                    fontWeight: 700,
                    textAlign: "center",
                    marginBottom: "2.5rem",
                    color: "var(--text, #3a2e28)",
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  Login
                </h2>

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
                        borderRadius: "0.5rem",
                        padding: "0.75rem 1rem",
                        marginBottom: "1.5rem",
                        fontSize: "0.85rem",
                        color: "#dc2626",
                        textAlign: "center",
                        maxWidth: "340px",
                        margin: "0 auto 1.5rem auto",
                      }}
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleLogin} style={{ maxWidth: "340px", margin: "0 auto", width: "100%" }}>
                  {/* Email Input */}
                  <div style={{ position: "relative", marginBottom: "1.25rem" }}>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      style={{
                        width: "100%",
                        padding: "1rem 3rem 1rem 1.25rem",
                        background: "#fff",
                        border: "1.5px solid var(--border, #e0d0bc)",
                        borderRadius: "0.5rem",
                        fontSize: "0.95rem",
                        color: "var(--text, #3a2e28)",
                        outline: "none",
                        transition: "all 0.2s",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "var(--secondary, #c9534a)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--border, #e0d0bc)")}
                    />
                    <div
                      style={{
                        position: "absolute",
                        right: "1.25rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--text-muted, #7a6a60)",
                        pointerEvents: "none",
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  </div>

                  {/* Password Input */}
                  <div style={{ position: "relative", marginBottom: "1.5rem" }}>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      style={{
                        width: "100%",
                        padding: "1rem 3rem 1rem 1.25rem",
                        background: "#fff",
                        border: "1.5px solid var(--border, #e0d0bc)",
                        borderRadius: "0.5rem",
                        fontSize: "0.95rem",
                        color: "var(--text, #3a2e28)",
                        outline: "none",
                        transition: "all 0.2s",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "var(--secondary, #c9534a)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--border, #e0d0bc)")}
                    />
                    <div
                      style={{
                        position: "absolute",
                        right: "1.25rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--text-muted, #7a6a60)",
                        pointerEvents: "none",
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                      </svg>
                    </div>
                  </div>

                  {/* Forgot Password */}
                  <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                    <button
                      type="button"
                      onClick={() => alert("Hubungi administrator untuk reset password.")}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "0.85rem",
                        color: "var(--text-muted, #7a6a60)",
                        cursor: "pointer",
                        padding: 0,
                        transition: "color 0.2s",
                        fontWeight: 500,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--secondary, #c9534a)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted, #7a6a60)")}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    style={{
                      width: "100%",
                      padding: "1rem",
                      borderRadius: "0.5rem",
                      background: loading ? "var(--text-muted, #7a6a60)" : "var(--secondary, #c9534a)",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "1rem",
                      border: "none",
                      cursor: loading ? "not-allowed" : "pointer",
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
                            width: "18px",
                            height: "18px",
                            border: "2px solid rgba(255,255,255,0.4)",
                            borderTop: "2px solid #fff",
                            borderRadius: "50%",
                          }}
                        />
                        Memproses...
                      </>
                    ) : (
                      "Login"
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
