"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const categories = ["FEATURED", "CHEESE CUIT", "COOKIES", "COMING SOON"];

type Product = {
  id: number;
  name: string;
  category: string;
  tag: string | null;
  price: number;
  stock: number;
  image: string | null;
  is_coming_soon: boolean;
};

export default function MenuSection() {
  const [activeTab, setActiveTab] = useState("FEATURED");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true }); // Show oldest first or change to descending
    
    if (!error && data) {
      setAllProducts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel("public:products:menu")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, (payload) => {
        if (payload.eventType === "UPDATE") {
          setAllProducts(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
        } else {
          fetchProducts();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = allProducts
    .filter((p) => p.category === activeTab)
    .sort((a, b) => {
      const aIsBest = a.tag?.toLowerCase().includes("best seller") ? 1 : 0;
      const bIsBest = b.tag?.toLowerCase().includes("best seller") ? 1 : 0;
      return bIsBest - aIsBest; // 1 will come before 0
    });

  return (
    <section
      id="menu"
      style={{
        padding: "5rem 1.5rem 4rem",
        maxWidth: "1100px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: EASE }}
        style={{ textAlign: "center", marginBottom: "1rem" }}
      >
        <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--secondary)", marginBottom: "0.5rem" }}>
          Our Menu
        </p>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(2rem, 4vw, 3.2rem)", color: "var(--primary)", marginBottom: "1.5rem" }}>
          Bakery ByTyaa Menu
        </h2>
        <div style={{ height: "1px", background: "var(--border)", marginBottom: "1.25rem" }} />
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.15 }}
        style={{ display: "flex", justifyContent: "center", gap: "2rem", marginBottom: "2.5rem", flexWrap: "wrap" }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            style={{
              background: "none",
              border: "none",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: activeTab === cat ? "var(--primary)" : "var(--text-muted)",
              cursor: "pointer",
              paddingBottom: "0.3rem",
              borderBottom: activeTab === cat ? "2px solid var(--primary)" : "2px solid transparent",
              transition: "all 0.25s ease",
            }}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Category label — animates on tab change */}
      <motion.h3
        key={activeTab + "-label"}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.5rem",
          color: "var(--secondary)",
          marginBottom: "1.5rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {activeTab}
      </motion.h3>

      {/* Cards grid with AnimatePresence on tab switch */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
          Memuat menu...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
          Belum ada produk di kategori ini.
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
          >
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 28, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.52, ease: EASE }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  const displayPrice = product.is_coming_soon ? "tunggu yaa 🤍" : `Rp${product.price.toLocaleString("id-ID")}`;
  const imageUrl = product.image || "/logo-whisk.png";

  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: "0 28px 56px rgba(44,74,110,0.24)" }}
      transition={{ duration: 0.3, ease: EASE }}
      style={{
        borderRadius: "3rem",
        overflow: "hidden",
        position: "relative",
        aspectRatio: "3 / 4.5",
        cursor: "pointer",
        background: "#c0b8a8",
      }}
    >
      <Image src={imageUrl} alt={product.name} fill style={{ objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.1) 50%, transparent 70%)" }} />

      {/* Coming Soon badge */}
      {product.is_coming_soon ? (
        <div
          style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            backgroundColor: "var(--secondary)",
            color: "white",
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "0.3rem 0.75rem",
            borderRadius: "999px",
          }}
        >
          Coming Soon
        </div>
      ) : product.stock <= 0 ? (
        <div
          style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            backgroundColor: "#ef4444",
            color: "white",
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "0.3rem 0.75rem",
            borderRadius: "999px",
          }}
        >
          Habis
        </div>
      ) : null}

      <div style={{ position: "absolute", bottom: "1.5rem", left: "1.5rem", right: "1.5rem", color: "#fff" }}>
        <p style={{ fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.9, marginBottom: "0.3rem" }}>
          {product.tag}
        </p>
        <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", lineHeight: 1.2, marginBottom: "0.3rem" }}>
          {product.name}
        </p>
        <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>{displayPrice}</p>
      </div>
    </motion.div>
  );
}
