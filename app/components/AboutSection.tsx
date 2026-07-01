"use client";

import { motion } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function AboutSection() {
  return (
    <section
      id="about"
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "2rem 1.5rem 5rem",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 36, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: EASE }}
        style={{
          background: "var(--card)",
          borderRadius: "2rem",
          padding: "3rem 3.5rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "3rem",
          alignItems: "start",
        }}
      >
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.2, ease: EASE }}
        >
          <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--secondary)", marginBottom: "0.75rem" }}>
            About UMKM
          </p>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.6rem, 3vw, 2.4rem)", color: "var(--primary)", lineHeight: 1.2 }}>
            Bakery ByTyaa dari Semarang bawah.
          </h2>
        </motion.div>

        {/* Right */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.3, ease: EASE }}
        >
          <p style={{ fontSize: "0.92rem", color: "var(--text-muted)", lineHeight: 1.8 }}>
            Website ini dibuat untuk membantu UMKM menampilkan katalog produk,
            informasi harga, dan kontak pemesanan secara lebih rapi, modern,
            serta mudah diakses melalui HP. Desain dibuat hangat, clean, dan
            tetap punya karakter bakery yang manis tanpa terlihat terlalu ramai.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
