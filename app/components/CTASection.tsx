"use client";

import { motion } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function CTASection() {
  return (
    <section
      style={{
        borderTop: "1px solid var(--border)",
        padding: "5rem 1.5rem",
        textAlign: "center",
      }}
    >
      <motion.h2
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.65, ease: EASE }}
        style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(2.5rem, 5vw, 4rem)", color: "var(--primary)", marginBottom: "1rem" }}
      >
        Ready to order?
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
        style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginBottom: "2rem" }}
      >
        Pesan cookies homemade fresh dari Bakery ByTyaa sekarang.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.88 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
      >
        <motion.button
          onClick={() => window.dispatchEvent(new CustomEvent("openOrderModal"))}
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.2 }}
          style={{
            display: "inline-block",
            padding: "0.9rem 2rem",
            borderRadius: "999px",
            background: "var(--secondary)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.95rem",
            letterSpacing: "0.02em",
            cursor: "pointer",
            border: "none",
          }}
        >
          Order via WhatsApp
        </motion.button>
      </motion.div>
    </section>
  );
}
