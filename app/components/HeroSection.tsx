"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function HeroSection() {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingTop: "64px",
      }}
    >
      {/* Main hero content */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 items-center"
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "2rem 1.5rem 2rem",
        }}
      >
        {/* Left: text — each element fades up with staggered delay */}
        <div className="order-2 lg:order-1 mt-4 lg:mt-0">
          <motion.p
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--secondary)",
              marginBottom: "1rem",
            }}
          >
            Fresh From Oven
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASE, delay: 0.2 }}
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2.4rem, 6vw, 4.2rem)",
              color: "var(--primary)",
              lineHeight: 1.1,
              marginBottom: "1.5rem",
            }}
          >
            Bakery rumahan buat mood kamu naik kelas.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.32 }}
            style={{
              fontSize: "0.95rem",
              color: "var(--text-muted)",
              lineHeight: 1.7,
              marginBottom: "2rem",
              maxWidth: "400px",
            }}
          >
            Bakery ByTyaa menghadirkan aneka dessert dan kue homemade dengan rasa premium,
            tekstur lembut, dan tampilan yang cantik. Cocok untuk cemilan santai, hampers keluarga,
            maupun hadiah kecil yang niat.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.44 }}
            style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}
          >
            <Link
              href="#menu"
              style={{
                padding: "0.75rem 1.75rem",
                borderRadius: "999px",
                background: "var(--secondary)",
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.9rem",
                transition: "background 0.25s",
                display: "inline-block",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.background = "#b84540")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.background = "var(--secondary)")
              }
            >
              Lihat Menu
            </Link>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("openOrderModal"))}
              style={{
                padding: "0.75rem 1.75rem",
                borderRadius: "999px",
                border: "1.5px solid var(--text)",
                color: "var(--text)",
                fontWeight: 600,
                fontSize: "0.9rem",
                background: "transparent",
                transition: "all 0.25s",
                display: "inline-block",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                const el = e.target as HTMLElement;
                el.style.background = "var(--text)";
                el.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                const el = e.target as HTMLElement;
                el.style.background = "transparent";
                el.style.color = "var(--text)";
              }}
            >
              Pesan Sekarang
            </button>
          </motion.div>
        </div>

        {/* Right: image — slide from right + gentle float loop */}
        <motion.div
          className="order-1 lg:order-2"
          style={{ position: "relative" }}
          initial={{ opacity: 0, x: 48, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.75, ease: EASE, delay: 0.15 }}
        >
          {/* Infinite subtle float */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "loop",
            }}
          >
            <div
              style={{
                borderRadius: "3.5rem",
                overflow: "hidden",
                aspectRatio: "4 / 5",
                position: "relative",
                background: "#d0c4b0",
                maxWidth: "460px",
                margin: "0 auto",
              }}
            >
              <Image
                src="/keju-cuit.jpg"
                alt="Keju Cuit"
                fill
                style={{ objectFit: "cover" }}
                priority
              />
              {/* Dark gradient */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 50%)",
                }}
              />
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.55, ease: EASE }}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "rgba(0, 0, 0, 0.45)",
                  backdropFilter: "blur(12px)",
                  borderTop: "1px solid rgba(255,255,255,0.15)",
                  padding: "1.25rem 2rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "center",
                }}
              >
                <p
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "rgba(255, 255, 255, 0.8)",
                    marginBottom: "0.25rem",
                  }}
                >
                  Best Seller
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.5rem",
                    color: "#ffffff",
                    letterSpacing: "0.02em",
                  }}
                >
                  Keju Cuit
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Steps banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        style={{
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          maxWidth: "1100px",
          margin: "0 auto",
          width: "100%",
          padding: "0 1.5rem",
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {[
            { num: "1", text: "Pilih menu yang kamu inginkan" },
            { num: "2", text: "Lakukan pemesanan" },
            { num: "3", text: "Baker siap membuatkannya!" },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 + i * 0.12, duration: 0.5, ease: EASE }}
              className={`flex items-start gap-4 p-6 ${
                i < 2 ? "border-b md:border-b-0 md:border-r" : ""
              }`}
              style={{
                borderColor: "var(--border)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "2.2rem",
                  color: "var(--primary)",
                  lineHeight: 1,
                  opacity: 0.5,
                }}
              >
                {step.num}
              </span>
              <p style={{ fontSize: "0.9rem", fontWeight: 500, lineHeight: 1.5 }}>
                {step.text}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
