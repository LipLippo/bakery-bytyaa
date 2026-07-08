"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function SpecialsSection() {
  return (
    <section
      id="about"
      style={{
        padding: "5rem 1.5rem 8rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: "4rem",
          flexWrap: "wrap",
        }}
      >
        {/* Left: Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{
            flex: "1 1 280px",
            minWidth: "240px",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2rem, 4vw, 2.8rem)",
              color: "var(--primary)",
              marginBottom: "1.5rem",
              lineHeight: 1.2,
            }}
          >
            Dibuat dengan Sepenuh Hati
          </h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
            style={{
              fontSize: "1.05rem",
              color: "var(--text-muted)",
              lineHeight: 1.8,
            }}
          >
            Berawal dari dapur rumahan, Bakery ByTyaa memadukan bahan premium
            dan dedikasi di setiap adonan untuk menghadirkan cita rasa autentik
            yang selalu bikin kangen.
          </motion.p>
        </motion.div>

        {/* Right: Logo with Blob shape */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
          style={{
            position: "relative",
            width: "min(320px, 80vw)",
            aspectRatio: "1 / 1",
            flexShrink: 0,
          }}
        >
          {/* Secondary decorative blob */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute",
              top: "-5%",
              left: "-5%",
              right: "-5%",
              bottom: "-5%",
              backgroundColor: "var(--secondary)",
              opacity: 0.05,
              borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
              zIndex: -1,
            }}
          />

          {/* Image inside Blob shape */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              zIndex: 1,
              borderRadius: "53% 47% 41% 59% / 46% 58% 42% 54%",
              overflow: "hidden",
              boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
              border: "1px solid var(--border)",
              mixBlendMode: "multiply",
            }}
          >
            <Image
              src="/logo-whisk.png"
              alt="Bakery ByTyaa Logo"
              fill
              priority
              style={{ objectFit: "cover", transform: "scale(1.15)" }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
