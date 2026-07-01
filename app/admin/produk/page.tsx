"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, X, RefreshCw, ChevronDown, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  tag: string | null;
  image: string | null;
  is_coming_soon: boolean;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

function getColor(category: string) {
  if (category === "Cookies") return { bg: "#e8f5e9", text: "#2e7d32" };
  if (category === "Brownies") return { bg: "#e3f2fd", text: "#1565c0" };
  if (category === "Hampers") return { bg: "#fff8e1", text: "#f57f17" };
  return { bg: "#f3e5f5", text: "#7b1fa2" };
}

const inputStyle = {
  width: "100%",
  padding: "0.75rem 1rem",
  borderRadius: "0.5rem",
  border: "1px solid var(--border)",
  backgroundColor: "var(--background)",
  fontSize: "0.95rem",
  outline: "none",
  color: "var(--text)",
  boxSizing: "border-box" as const,
};

export default function ManajemenProduk() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);

  const showToast = (message: string, type: "error" | "success" = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Delete Confirmation State
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const emptyForm = {
    name: "",
    category: "FEATURED",
    price: "",
    stock: "0",
    tag: "",
    is_coming_soon: false,
  };

  const [formData, setFormData] = useState<{
    name: string;
    category: string;
    price: string;
    stock: string;
    tag: string;
    is_coming_soon: boolean;
  }>(emptyForm);

  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setProducts(data);
    else console.error("Gagal mengambil produk:", error);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    const channel = supabase
      .channel("public:products:admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, (payload) => {
        fetchProducts(); // Refresh silently
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Open modal for ADD
  const openAddModal = () => {
    setEditingProduct(null);
    setFormData(emptyForm);
    setImageFile(null);
    setIsModalOpen(true);
  };

  // Open modal for EDIT — pre-fill form with existing data
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      tag: product.tag || "",
      is_coming_soon: product.is_coming_soon,
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData(emptyForm);
    setImageFile(null);
  };

  // Upload image helper
  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, file);
    if (uploadError) {
      alert("Gagal mengunggah gambar: " + uploadError.message);
      return null;
    }
    const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(fileName);
    return publicUrl;
  };

  // SAVE — handles both ADD and EDIT
  const handleSimpan = async () => {
    if (!formData.name || !formData.price) {
      alert("Nama dan Harga wajib diisi!");
      return;
    }
    setSubmitting(true);

    let imageUrl = editingProduct?.image || "/logo-whisk.png";

    if (imageFile) {
      const url = await uploadImage(imageFile);
      if (!url) { setSubmitting(false); return; }
      imageUrl = url;
    }

    const payload = {
      name: formData.name,
      category: formData.category,
      price: parseInt(formData.price),
      stock: parseInt(formData.stock) || 0,
      tag: formData.tag || null,
      image: imageUrl,
      is_coming_soon: formData.is_coming_soon,
    };

    let error;
    if (editingProduct) {
      ({ error } = await supabase.from("products").update(payload).eq("id", editingProduct.id));
    } else {
      ({ error } = await supabase.from("products").insert([payload]));
    }

    setSubmitting(false);
    if (error) {
      alert("Gagal menyimpan produk: " + error.message);
    } else {
      closeModal();
      fetchProducts();
    }
  };

  const executeDelete = async () => {
    if (!productToDelete) return;
    const { error } = await supabase.from("products").delete().eq("id", productToDelete.id);
    if (error) {
      showToast("Gagal menghapus produk: " + error.message, "error");
    } else {
      showToast("Produk berhasil dihapus.", "success");
      fetchProducts();
    }
    setProductToDelete(null);
  };

  return (
    <div style={{ position: "relative", minHeight: "100%" }}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={{
              position: "fixed",
              top: "2rem",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10000,
              backgroundColor: toast.type === "error" ? "#fee2e2" : "#dcfce3",
              color: toast.type === "error" ? "#991b1b" : "#166534",
              padding: "0.75rem 1.25rem",
              borderRadius: "0.75rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              border: `1px solid ${toast.type === "error" ? "#f87171" : "#86efac"}`,
              fontWeight: 600,
              fontSize: "0.9rem"
            }}
          >
            {toast.type === "error" ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 style={{ margin: "0 0 0.5rem 0", fontFamily: "var(--font-heading)", fontSize: "2rem", color: "var(--primary)", fontWeight: 700 }}>
              Manajemen Produk
            </h1>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "1rem" }}>
              Kelola daftar produk UMKM Anda secara efisien.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openAddModal}
            className="w-full md:w-auto justify-center"
            style={{ backgroundColor: "var(--secondary)", color: "white", border: "none", borderRadius: "0.5rem", padding: "0.75rem 1.25rem", fontSize: "0.95rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", boxShadow: "0 4px 12px rgba(201,83,74,0.2)" }}
          >
            <Plus size={18} /> Tambah Produk Baru
          </motion.button>
        </motion.div>

        {/* Table */}
        <motion.div
          variants={itemVariants}
          style={{ backgroundColor: "var(--card)", borderRadius: "1rem", border: "1px solid var(--border)", overflowX: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--background)" }}>
                <th style={{ padding: "1.25rem 1.5rem", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.05em" }}>PRODUK</th>
                <th style={{ padding: "1.25rem 1.5rem", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.05em" }}>KATEGORI</th>
                <th style={{ padding: "1.25rem 1.5rem", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.05em" }}>HARGA</th>
                <th style={{ padding: "1.25rem 1.5rem", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.05em" }}>STOK</th>
                <th style={{ padding: "1.25rem 1.5rem", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.05em" }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2" /> Memuat data...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
                    Belum ada produk. Klik "Tambah Produk Baru" untuk memulai.
                  </td>
                </tr>
              ) : (
                products.map(product => {
                  const color = getColor(product.category);
                  const initials = product.name.substring(0, 2).toUpperCase();
                  return (
                    <tr
                      key={product.id}
                      style={{ borderBottom: "1px solid var(--border)", transition: "background-color 0.2s" }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.01)")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                          <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: color.bg, color: color.text, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1rem", overflow: "hidden" }}>
                            {product.image ? (
                              <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : initials}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontWeight: 600, color: "var(--primary)", fontSize: "0.95rem" }}>{product.name}</span>
                            {(product.tag || product.is_coming_soon) && (
                              <span style={{ fontSize: "0.7rem", color: "var(--secondary)", fontWeight: 600 }}>
                                {product.is_coming_soon ? "COMING SOON" : product.tag}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <span style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", color: "var(--text-muted)", padding: "0.35rem 0.75rem", borderRadius: "2rem", fontSize: "0.8rem", fontWeight: 500, whiteSpace: "nowrap", display: "inline-block" }}>
                          {product.category}
                        </span>
                      </td>
                      <td style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "var(--text)", fontSize: "0.95rem" }}>
                        Rp {product.price.toLocaleString("id-ID")}
                      </td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <span style={{ fontWeight: 700, color: product.stock > 10 ? "#2e7d32" : product.stock > 0 ? "#f57f17" : "#c62828", fontSize: "0.95rem" }}>
                          {product.stock}
                        </span>
                      </td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <div style={{ display: "flex", gap: "1rem", color: "var(--text-muted)" }}>
                          {/* EDIT BUTTON — now has onClick */}
                          <button
                            onClick={() => openEditModal(product)}
                            title="Edit produk"
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "0.25rem", borderRadius: "0.35rem", transition: "all 0.2s" }}
                            onMouseEnter={e => { e.currentTarget.style.color = "var(--primary)"; e.currentTarget.style.backgroundColor = "rgba(44,74,110,0.07)"; }}
                            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.backgroundColor = "transparent"; }}
                          >
                            <Edit2 size={18} />
                          </button>
                          {/* DELETE BUTTON */}
                          <button
                            onClick={() => setProductToDelete(product)}
                            title="Hapus produk"
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "0.25rem", borderRadius: "0.35rem", transition: "all 0.2s" }}
                            onMouseEnter={e => { e.currentTarget.style.color = "var(--secondary)"; e.currentTarget.style.backgroundColor = "rgba(201,83,74,0.07)"; }}
                            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.backgroundColor = "transparent"; }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </motion.div>
      </motion.div>

      {/* Modal — shared for ADD and EDIT */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: EASE }}
              style={{ backgroundColor: "var(--card)", borderRadius: "1rem", width: "100%", maxWidth: "550px", maxHeight: "90vh", overflowY: "auto", position: "relative", zIndex: 10000, boxShadow: "0 24px 48px rgba(0,0,0,0.2)" }}
            >
              {/* Modal Header */}
              <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "1.25rem", color: "var(--primary)" }}>
                  {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
                </h2>
                <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                  <X size={20} />
                </button>
              </div>

              {/* Form fields */}
              <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                {/* If editing, show current image preview */}
                {editingProduct?.image && !imageFile && (
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", backgroundColor: "var(--background)", borderRadius: "0.75rem", border: "1px solid var(--border)" }}>
                    <img src={editingProduct.image} alt="Gambar saat ini" style={{ width: "60px", height: "60px", borderRadius: "0.5rem", objectFit: "cover" }} />
                    <div>
                      <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: "var(--primary)" }}>Gambar Saat Ini</p>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>Pilih file baru di bawah untuk mengganti gambar</p>
                    </div>
                  </div>
                )}

                {/* Nama Produk */}
                <div>
                  <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.5rem" }}>Nama Produk</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Keju Cuit"
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  {/* Kategori */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.5rem" }}>Kategori Tab di Beranda</label>
                    <div ref={categoryDropdownRef} style={{ position: "relative" }}>
                      <button
                        type="button"
                        onClick={() => setIsCategoryDropdownOpen(p => !p)}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", ...inputStyle, cursor: "pointer" }}
                      >
                        <span>{formData.category}</span>
                        <motion.span animate={{ rotate: isCategoryDropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ display: "flex" }}>
                          <ChevronDown size={15} color="#94a3b8" />
                        </motion.span>
                      </button>
                      <AnimatePresence>
                        {isCategoryDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.97 }}
                            transition={{ duration: 0.15, ease: EASE }}
                            style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 9999, backgroundColor: "white", borderRadius: "0.75rem", border: "1px solid var(--border)", boxShadow: "0 16px 40px rgba(0,0,0,0.10)", overflow: "hidden" }}
                          >
                            {["FEATURED", "CHEESE CUIT", "COOKIES", "COMING SOON"].map((opt, i, arr) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => { setFormData({ ...formData, category: opt }); setIsCategoryDropdownOpen(false); }}
                                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "0.65rem 1rem", border: "none", backgroundColor: formData.category === opt ? "var(--background)" : "transparent", color: formData.category === opt ? "var(--primary)" : "var(--text-muted)", fontWeight: formData.category === opt ? 700 : 500, fontSize: "0.9rem", cursor: "pointer", borderBottom: i < arr.length - 1 ? "1px solid #f8fafc" : "none", textAlign: "left" }}
                                onMouseEnter={e => { if (formData.category !== opt) e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                                onMouseLeave={e => { if (formData.category !== opt) e.currentTarget.style.backgroundColor = "transparent"; }}
                              >
                                {opt}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Tag */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.5rem" }}>Tag Kecil (Opsional)</label>
                    <input
                      type="text"
                      value={formData.tag}
                      onChange={e => setFormData({ ...formData, tag: e.target.value })}
                      placeholder="Contoh: BEST SELLER"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  {/* Harga */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.5rem" }}>Harga (Rp)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      placeholder="15000"
                      style={inputStyle}
                    />
                  </div>

                  {/* Stok */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.5rem" }}>Stok</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={e => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="0"
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Gambar */}
                <div>
                  <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.5rem" }}>
                    Gambar Produk {editingProduct ? "(Opsional — Kosongkan jika tidak ingin mengganti)" : "(Opsional)"}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
                    }}
                    style={{ ...inputStyle, cursor: "pointer" }}
                  />
                  {imageFile && (
                    <p style={{ fontSize: "0.75rem", color: "var(--primary)", marginTop: "0.25rem", fontWeight: 600 }}>
                      ✅ File dipilih: {imageFile.name}
                    </p>
                  )}
                  {!imageFile && (
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                      Pilih gambar dari perangkat Anda. Gambar akan diunggah ke Supabase.
                    </p>
                  )}
                </div>

                {/* Coming Soon */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input
                    type="checkbox"
                    id="coming_soon"
                    checked={formData.is_coming_soon}
                    onChange={e => setFormData({ ...formData, is_coming_soon: e.target.checked })}
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  <label htmlFor="coming_soon" style={{ fontSize: "0.95rem", fontWeight: 500, cursor: "pointer" }}>
                    Tandai sebagai "Coming Soon"
                  </label>
                </div>
              </div>

              {/* Footer buttons */}
              <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: "1rem", backgroundColor: "var(--background)" }}>
                <button
                  onClick={closeModal}
                  style={{ backgroundColor: "transparent", border: "none", color: "var(--text-muted)", fontWeight: 600, cursor: "pointer", padding: "0.5rem 1rem" }}
                >
                  Batal
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSimpan}
                  disabled={submitting}
                  style={{ backgroundColor: "var(--secondary)", color: "white", border: "none", borderRadius: "0.5rem", padding: "0.6rem 1.25rem", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? "Menyimpan..." : editingProduct ? "Simpan Perubahan" : "Simpan Produk"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {productToDelete && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100000, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ position: "absolute", inset: 0, backgroundColor: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }}
              onClick={() => setProductToDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: EASE }}
              style={{ position: "relative", backgroundColor: "white", borderRadius: "1.25rem", padding: "2rem", width: "90%", maxWidth: "400px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)", textAlign: "center" }}
            >
              <div style={{ width: "64px", height: "64px", backgroundColor: "#fee2e2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                <Trash2 size={32} color="#dc2626" />
              </div>
              <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.25rem", fontWeight: 700, color: "var(--primary)", fontFamily: "var(--font-heading)" }}>Hapus Produk</h3>
              <p style={{ margin: "0 0 2rem", fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                Apakah Anda yakin ingin menghapus produk <span style={{ fontWeight: 600, color: "var(--text)" }}>"{productToDelete.name}"</span>? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  onClick={() => setProductToDelete(null)}
                  style={{ flex: 1, padding: "0.75rem", borderRadius: "0.75rem", backgroundColor: "#f1f5f9", color: "var(--text)", border: "none", fontWeight: 600, cursor: "pointer", fontSize: "0.95rem", transition: "background-color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#e2e8f0"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                >
                  Batal
                </button>
                <button
                  onClick={executeDelete}
                  style={{ flex: 1, padding: "0.75rem", borderRadius: "0.75rem", backgroundColor: "#dc2626", color: "white", border: "none", fontWeight: 600, cursor: "pointer", fontSize: "0.95rem", transition: "background-color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#b91c1c"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "#dc2626"}
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
