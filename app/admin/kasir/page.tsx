"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Minus, Trash2, CreditCard, RefreshCw, ShoppingBag, Download, X, ChevronDown } from "lucide-react";
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

type CartItem = {
  id: string;
  product: Product;
  quantity: number;
  notes: string;
};

// ─── Receipt Modal Component ─────────────────────────────────────────────────
function ReceiptModal({
  cart,
  subtotal,
  totalPayment,
  customerName,
  customerPhone,
  orderType,
  paymentMethod,
  orderId,
  onClose,
  onDownload,
}: {
  cart: CartItem[];
  subtotal: number;
  totalPayment: number;
  customerName: string;
  customerPhone: string;
  orderType: string;
  paymentMethod: string;
  orderId: string;
  onClose: () => void;
  onDownload: () => void;
}) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(4px)",
        padding: "1rem",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{ backgroundColor: "white", borderRadius: "1.5rem", padding: "2rem", maxWidth: "460px", width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h3 style={{ margin: 0, fontWeight: 800, color: "var(--primary)", fontSize: "1.2rem" }}>Preview Nota</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={20} /></button>
        </div>

        {/* THE RECEIPT — this div is what gets captured by html2canvas */}
        <div
          id="receipt-capture"
          style={{
            backgroundColor: "#fff",
            padding: "2rem",
            borderRadius: "0.75rem",
            border: "1px solid #e5e7eb",
            fontFamily: "monospace",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)", letterSpacing: "-0.02em" }}>ByTyaa Bakery</div>
            <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.25rem" }}>Nota Transaksi</div>
            <div style={{ height: "1px", backgroundColor: "#e5e7eb", margin: "1rem 0" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
            <span style={{ color: "#6b7280" }}>No. Nota</span>
            <span style={{ fontWeight: 700 }}>#KSR-{orderId}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
            <span style={{ color: "#6b7280" }}>Tanggal</span>
            <span>{dateStr}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
            <span style={{ color: "#6b7280" }}>Waktu</span>
            <span>{timeStr}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
            <span style={{ color: "#6b7280" }}>Pelanggan</span>
            <span style={{ fontWeight: 600 }}>{customerName || "—"}</span>
          </div>
          {customerPhone && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
              <span style={{ color: "#6b7280" }}>No. HP</span>
              <span>{customerPhone}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
            <span style={{ color: "#6b7280" }}>Jenis</span>
            <span>{orderType}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "1rem" }}>
            <span style={{ color: "#6b7280" }}>Pembayaran</span>
            <span>{paymentMethod}</span>
          </div>

          <div style={{ height: "1px", backgroundColor: "#e5e7eb", margin: "1rem 0" }} />
          {cart.map((item) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
              <span>{item.product.name} <span style={{ color: "#6b7280" }}>×{item.quantity}</span></span>
              <span style={{ fontWeight: 600 }}>Rp {(item.product.price * item.quantity).toLocaleString("id-ID")}</span>
            </div>
          ))}
          <div style={{ height: "1px", backgroundColor: "#e5e7eb", margin: "1rem 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1rem", color: "var(--primary)" }}>
            <span>TOTAL</span>
            <span>Rp {totalPayment.toLocaleString("id-ID")}</span>
          </div>
          <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.8rem", color: "#9ca3af" }}>
            Terima kasih telah berbelanja di ByTyaa Bakery 🍞
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={onDownload}
          style={{ width: "100%", marginTop: "1.5rem", padding: "0.9rem", borderRadius: "0.75rem", border: "none", backgroundColor: "var(--primary)", color: "white", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}
        >
          <Download size={18} /> Unduh Nota (.PNG)
        </motion.button>
      </motion.div>
    </div>
  );
}

// ─── Main POS Component ───────────────────────────────────────────────────────
export default function KasirPOS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState("Ambil di tempat");
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "QRIS">("Cash");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderId] = useState(() => Math.floor(Math.random() * 10000).toString().padStart(4, "0"));

  // Receipt modal
  const [showReceipt, setShowReceipt] = useState(false);

  // Category dropdown
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  // Order Type dropdown
  const [isOrderTypeOpen, setIsOrderTypeOpen] = useState(false);
  const orderTypeRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (orderTypeRef.current && !orderTypeRef.current.contains(e.target as Node)) {
        setIsOrderTypeOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();

    // Supabase Realtime Listener
    const channel = supabase
      .channel("public:products:kasir")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Cart helpers
  const addToCart = (product: Product) => {
    const inCart = cart.find(c => c.product.id === product.id);
    const currentQty = inCart ? inCart.quantity : 0;
    if (currentQty >= product.stock) return; // respect stock limit

    if (inCart) {
      setCart(prev => prev.map(c => c.id === inCart.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart(prev => [...prev, { id: `${product.id}-${Date.now()}`, product, quantity: 1, notes: "" }]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id !== id) return item;
      const newQty = item.quantity + delta;
      if (newQty <= 0) return null as unknown as CartItem;
      if (newQty > item.product.stock) return item;
      return { ...item, quantity: newQty };
    }).filter(Boolean));
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));
  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalPayment = subtotal;

  const getProductQuantityInCart = (productId: number) => {
    const item = cart.find(c => c.product.id === productId);
    return item ? item.quantity : 0;
  };

  // Categories
  const rawCategories = ["All", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
  const categories = rawCategories.map(cat => ({
    name: cat,
    count: cat === "All" ? products.length : products.filter(p => p.category === cat).length,
  }));

  const filteredProducts = products.filter(p => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setShowReceipt(true);
  };

  const handleDownloadAndSave = async () => {
    const html2canvas = (await import("html2canvas")).default;
    const element = document.getElementById("receipt-capture");
    let receiptUrl = "";

    if (element) {
      try {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/png"));
        if (blob) {
          const fileName = `receipts/KSR-${orderId}-${Date.now()}.png`;
          const { error: uploadError } = await supabase.storage
            .from("products")
            .upload(fileName, blob, { contentType: "image/png" });
          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(fileName);
            receiptUrl = publicUrl;

            // Download
            const link = document.createElement("a");
            link.href = publicUrl;
            link.download = `Nota-KSR-${orderId}.png`;
            link.click();
          }
        }
      } catch (err) {
        console.error("Failed to capture receipt", err);
      }
    }

    // Save to orders table
    const orderData = {
      order_number: `#KSR-${orderId}`,
      customer_name: customerName || "Pelanggan Kasir",
      customer_phone: customerPhone || "-",
      order_type: orderType,
      payment_method: paymentMethod,
      total_amount: totalPayment,
      status: "selesai",
      receipt_url: receiptUrl || null,
      items: cart.map(c => ({ name: c.product.name, qty: c.quantity, price: c.product.price })),
    };
    supabase.from("orders").insert([orderData]).then(({ error }) => {
      if (error) console.error("Could not save order", error);
    });

    // Decrement stock
    cart.forEach(item => {
      supabase.rpc("decrement_product_stock", { p_id: item.product.id, p_amount: item.quantity });
    });

    // Reset
    setShowReceipt(false);
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
  };

  return (
    <>
      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceipt && (
          <ReceiptModal
            cart={cart}
            subtotal={subtotal}
            totalPayment={totalPayment}
            customerName={customerName}
            customerPhone={customerPhone}
            orderType={orderType}
            paymentMethod={paymentMethod}
            orderId={orderId}
            onClose={() => setShowReceipt(false)}
            onDownload={handleDownloadAndSave}
          />
        )}
      </AnimatePresence>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] lg:overflow-hidden" style={{ gap: 0 }}>

        {/* LEFT: Product Grid */}
        <div className="flex-1 flex flex-col p-4 lg:p-6 gap-4 lg:overflow-hidden">
          {/* Top Controls */}
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            {/* Category Dropdown */}
            <div ref={categoryRef} style={{ position: "relative" }}>
              <button
                onClick={() => setIsCategoryOpen(p => !p)}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1rem", borderRadius: "0.75rem", border: "1px solid var(--border)", backgroundColor: "white", fontSize: "0.9rem", fontWeight: 600, color: "var(--text)", cursor: "pointer" }}
              >
                <span>{activeCategory === "All" ? `Semua Kategori (${products.length})` : `${activeCategory} (${categories.find(c => c.name === activeCategory)?.count ?? 0})`}</span>
                <motion.span animate={{ rotate: isCategoryOpen ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ display: "flex" }}>
                  <ChevronDown size={14} color="#94a3b8" />
                </motion.span>
              </button>
              <AnimatePresence>
                {isCategoryOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: EASE }}
                    style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 9999, backgroundColor: "white", borderRadius: "0.75rem", border: "1px solid var(--border)", boxShadow: "0 16px 40px rgba(0,0,0,0.10)", overflow: "hidden", minWidth: "200px" }}
                  >
                    {categories.map(({ name: cat, count }, idx) => {
                      const isActive = activeCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => { setActiveCategory(cat); setIsCategoryOpen(false); }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                            padding: "0.75rem 1.1rem",
                            border: "none",
                            backgroundColor: isActive ? "var(--background)" : "transparent",
                            color: isActive ? "var(--primary)" : "var(--text-muted)",
                            fontWeight: isActive ? 700 : 500,
                            fontSize: "0.9rem",
                            cursor: "pointer",
                            textAlign: "left",
                            borderBottom: idx < categories.length - 1 ? "1px solid #f8fafc" : "none",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                          onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
                        >
                          <span>{cat === "All" ? "Semua Kategori" : cat}</span>
                          <span style={{
                            fontSize: "0.75rem",
                            backgroundColor: isActive ? "var(--primary)" : "var(--background)",
                            color: isActive ? "white" : "var(--text-muted)",
                            padding: "0.1rem 0.5rem",
                            borderRadius: "999px",
                            fontWeight: 700,
                          }}>{count}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search & Refresh */}
            <div style={{ display: "flex", gap: "1rem" }}>
              <button onClick={fetchProducts} style={{ padding: "0.5rem", borderRadius: "50%", border: "1px solid var(--border)", backgroundColor: "white", cursor: "pointer", color: "var(--text-muted)" }}>
                <RefreshCw size={18} />
              </button>
              <div style={{ position: "relative" }}>
                <Search size={18} color="var(--text-muted)" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  placeholder="Cari Menu..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ padding: "0.6rem 1rem 0.6rem 2.5rem", borderRadius: "2rem", border: "1px solid var(--border)", outline: "none", width: "200px", fontSize: "0.9rem" }}
                />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 lg:overflow-y-auto pr-0 lg:pr-2 hide-scrollbar">
            {loading ? (
              <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>Memuat produk...</div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>Produk tidak ditemukan.</div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map(product => {
                  const inCartQty = getProductQuantityInCart(product.id);
                  const isOutOfStock = product.stock <= 0;
                  return (
                    <motion.div
                      key={product.id}
                      whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(44,74,110,0.08)" }}
                      style={{ backgroundColor: "white", borderRadius: "1.25rem", overflow: "hidden", border: "1px solid rgba(0,0,0,0.04)", boxShadow: "0 8px 24px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", position: "relative", transition: "all 0.3s ease" }}
                    >
                      {/* Stock badge */}
                      <div style={{ position: "absolute", top: "0.85rem", right: "0.85rem", zIndex: 10 }}>
                        <span style={{
                          backgroundColor: isOutOfStock ? "rgba(254,226,226,0.9)" : "rgba(255,255,255,0.9)",
                          color: isOutOfStock ? "#ef4444" : "var(--text-muted)",
                          padding: "0.3rem 0.6rem", borderRadius: "2rem", fontSize: "0.75rem", fontWeight: 700,
                          display: "flex", alignItems: "center", gap: "0.35rem",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)", backdropFilter: "blur(4px)"
                        }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: isOutOfStock ? "#ef4444" : "#22c55e" }} />
                          {isOutOfStock ? "Habis" : `Stok: ${product.stock}`}
                        </span>
                      </div>

                      <div style={{ height: "160px", width: "100%", backgroundColor: "#f3f4f6", position: "relative" }}>
                        <img src={product.image || "/logo-whisk.png"} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.2) 0%, transparent 40%)" }} />
                      </div>

                      <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flex: 1 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginBottom: "1rem" }}>
                          <h4 style={{ margin: 0, fontWeight: 700, fontSize: "1.05rem", color: "var(--primary)", lineHeight: 1.3 }}>{product.name}</h4>
                          <span style={{ fontWeight: 700, color: "var(--secondary)", fontSize: "1rem" }}>
                            Rp{product.price.toLocaleString("id-ID")}
                          </span>
                        </div>

                        <div style={{ marginTop: "auto" }}>
                          {isOutOfStock ? (
                            <button disabled style={{ width: "100%", padding: "0.7rem", borderRadius: "0.75rem", border: "1px dashed #d1d5db", backgroundColor: "#f9fafb", color: "#9ca3af", fontWeight: 600, cursor: "not-allowed", fontSize: "0.9rem" }}>
                              Stok Habis
                            </button>
                          ) : inCartQty > 0 ? (
                            <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1.5px solid var(--primary)", borderRadius: "0.75rem", overflow: "hidden", backgroundColor: "#f8fbff" }}>
                              <button onClick={() => updateQuantity(cart.find(c => c.product.id === product.id)!.id, -1)} style={{ padding: "0.7rem 1rem", border: "none", backgroundColor: "transparent", color: "var(--primary)", cursor: "pointer", display: "flex", alignItems: "center" }}><Minus size={18} /></button>
                              <span style={{ fontWeight: 800, color: "var(--primary)", fontSize: "1rem" }}>{inCartQty}</span>
                              <button onClick={() => addToCart(product)} style={{ padding: "0.7rem 1rem", border: "none", backgroundColor: "transparent", color: "var(--primary)", cursor: "pointer", display: "flex", alignItems: "center" }}><Plus size={18} /></button>
                            </div>
                          ) : (
                            <button onClick={() => addToCart(product)} style={{ width: "100%", padding: "0.7rem", borderRadius: "0.75rem", border: "none", backgroundColor: "var(--primary)", color: "white", fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", transition: "background 0.2s" }}>
                              <Plus size={18} /> Tambah
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>

        {/* RIGHT: Order Summary — same style as OrderFormModal */}
        <div className="w-full lg:w-[380px] flex-shrink-0 h-auto lg:h-full flex flex-col" style={{
          backgroundColor: "#f8fafc",
          borderLeft: "1px solid #f1f5f9",
        }}>
          {/* Header */}
          <div style={{ padding: "1.25rem 2rem", backgroundColor: "#ffffff", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--secondary)" }} />
              <h2 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "1.2rem", color: "var(--primary)" }}>Ringkasan Pesanan</h2>
            </div>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--secondary)" }}>#KSR-{orderId}</span>
          </div>

          {/* Form Data Diri */}
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px dashed #e2e8f0", backgroundColor: "#ffffff" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <input
                type="text"
                placeholder="Nama Pelanggan *"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                style={{ padding: "0.75rem 1rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", backgroundColor: "white", fontSize: "0.9rem", outline: "none", color: "var(--text)", boxShadow: "0 1px 2px rgba(0,0,0,0.02)", width: "100%", boxSizing: "border-box" }}
                onFocus={e => e.currentTarget.style.borderColor = "var(--secondary)"}
                onBlur={e => e.currentTarget.style.borderColor = "#e2e8f0"}
              />
              <input
                type="tel"
                placeholder="Nomor WhatsApp / HP"
                value={customerPhone}
                onChange={e => {
                  const numbersOnly = e.target.value.replace(/\D/g, "").slice(0, 15);
                  setCustomerPhone(numbersOnly);
                }}
                style={{ padding: "0.75rem 1rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", backgroundColor: "white", fontSize: "0.9rem", outline: "none", color: "var(--text)", boxShadow: "0 1px 2px rgba(0,0,0,0.02)", width: "100%", boxSizing: "border-box" }}
                onFocus={e => e.currentTarget.style.borderColor = "var(--secondary)"}
                onBlur={e => e.currentTarget.style.borderColor = "#e2e8f0"}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "0.75rem" }}>
              {/* Jenis Pesanan Dropdown */}
              <div ref={orderTypeRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setIsOrderTypeOpen(p => !p)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "0.75rem 1rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", backgroundColor: "white", fontSize: "0.85rem", fontWeight: 600, color: "var(--text)", cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{orderType}</span>
                  <motion.span animate={{ rotate: isOrderTypeOpen ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ display: "flex", flexShrink: 0 }}>
                    <ChevronDown size={14} color="#94a3b8" />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {isOrderTypeOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15, ease: EASE }}
                      style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 9999, backgroundColor: "white", borderRadius: "0.75rem", border: "1px solid #e2e8f0", boxShadow: "0 16px 40px rgba(0,0,0,0.10)", overflow: "hidden" }}
                    >
                      {["Ambil di tempat", "Makan di sini", "COD"].map((opt, i) => (
                        <button key={opt} onClick={() => { setOrderType(opt); setIsOrderTypeOpen(false); }}
                          style={{ display: "flex", width: "100%", padding: "0.65rem 1rem", border: "none", backgroundColor: orderType === opt ? "var(--background)" : "transparent", color: orderType === opt ? "var(--primary)" : "var(--text-muted)", fontWeight: orderType === opt ? 700 : 500, fontSize: "0.85rem", cursor: "pointer", borderBottom: i < 2 ? "1px solid #f8fafc" : "none", textAlign: "left" }}
                          onMouseEnter={e => { if (orderType !== opt) e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                          onMouseLeave={e => { if (orderType !== opt) e.currentTarget.style.backgroundColor = "transparent"; }}
                        >{opt}</button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Metode Pembayaran */}
              <div style={{ display: "flex", gap: "0.4rem" }}>
                {(["Cash", "QRIS"] as const).map(method => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    style={{
                      flex: 1, padding: "0.75rem 0.5rem", borderRadius: "0.75rem",
                      border: paymentMethod === method ? "2px solid var(--secondary)" : "1px solid #e2e8f0",
                      backgroundColor: paymentMethod === method ? "var(--secondary)" : "white",
                      color: paymentMethod === method ? "white" : "var(--text-muted)",
                      fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s",
                    }}
                  >{method}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 lg:overflow-y-auto p-4 lg:p-6 flex flex-col gap-3 hide-scrollbar">
            <h3 style={{ margin: "0 0 0.25rem", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Keranjang</h3>
            {cart.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--text-muted)", opacity: 0.5, gap: "0.75rem", paddingTop: "2rem" }}>
                <ShoppingBag size={36} color="var(--border)" />
                <p style={{ fontWeight: 600, fontSize: "0.9rem", margin: 0 }}>Belum ada menu yang dipilih</p>
              </div>
            ) : (
              <AnimatePresence>
                {cart.map(item => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    style={{ backgroundColor: "white", borderRadius: "0.875rem", padding: "0.875rem", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "0.75rem" }}
                  >
                    <div style={{ width: "48px", height: "48px", borderRadius: "0.5rem", overflow: "hidden", flexShrink: 0 }}>
                      <img src={item.product.image || "/logo-whisk.png"} alt={item.product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--primary)", marginBottom: "0.1rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.product.name}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--secondary)", fontWeight: 700 }}>Rp {(item.product.price * item.quantity).toLocaleString("id-ID")}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
                      <button onClick={() => updateQuantity(item.id, -1)} style={{ width: "24px", height: "24px", borderRadius: "50%", border: "1px solid #e2e8f0", backgroundColor: "white", color: "var(--secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={12} /></button>
                      <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--primary)", minWidth: "16px", textAlign: "center" }}>{item.quantity}</span>
                      <button onClick={() => addToCart(item.product)} style={{ width: "24px", height: "24px", borderRadius: "50%", border: "none", backgroundColor: "var(--secondary)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={12} /></button>
                      <button onClick={() => removeFromCart(item.id)} style={{ width: "24px", height: "24px", borderRadius: "50%", border: "none", backgroundColor: "#fee2e2", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginLeft: "0.25rem" }}><Trash2 size={11} /></button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Checkout Footer */}
          <div style={{ padding: "1.25rem 1.5rem", backgroundColor: "#ffffff", borderTop: "1px solid #f1f5f9", flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-muted)" }}>Total Pembayaran</span>
              <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--secondary)" }}>Rp {totalPayment.toLocaleString("id-ID")}</span>
            </div>
            <motion.button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              whileHover={cart.length > 0 ? { scale: 1.02 } : {}}
              whileTap={cart.length > 0 ? { scale: 0.97 } : {}}
              style={{
                width: "100%", padding: "1rem", borderRadius: "0.875rem", border: "none",
                backgroundColor: cart.length === 0 ? "#e2e8f0" : "var(--secondary)",
                color: cart.length === 0 ? "#94a3b8" : "white",
                fontWeight: 700, fontSize: "1rem", cursor: cart.length === 0 ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                boxShadow: cart.length > 0 ? "0 8px 20px rgba(201,83,74,0.25)" : "none",
                transition: "all 0.2s",
              }}
            >
              <CreditCard size={18} />
              {paymentMethod === "Cash" ? "Cetak Nota" : "Proses QRIS"}
            </motion.button>
          </div>
        </div>
      </div>
    </>
  );
}
