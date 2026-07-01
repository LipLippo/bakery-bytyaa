"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag, Send, ChevronDown, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string | null;
  tag: string | null;
  is_coming_soon: boolean;
};

type CartItem = {
  id: string;
  product: Product;
  quantity: number;
};

// Admin WhatsApp Number
const ADMIN_WHATSAPP_NUMBER = "6285701505778";

export default function OrderFormModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);

  const showToast = (message: string, type: "error" | "success" = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderType, setOrderType] = useState("Ambil di tempat");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [cart, setCart] = useState<CartItem[]>([]);

  // Dropdown states
  const [orderTypeOpen, setOrderTypeOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const orderTypeRef = useRef<HTMLDivElement>(null);
  const paymentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (orderTypeRef.current && !orderTypeRef.current.contains(e.target as Node)) setOrderTypeOpen(false);
      if (paymentRef.current && !paymentRef.current.contains(e.target as Node)) setPaymentOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  
  // Generating a short unique order ID for the customer
  const [orderId, setOrderId] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_coming_soon", false)
      .order("created_at", { ascending: false });
      
    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setOrderId(Math.floor(Math.random() * 10000).toString().padStart(4, "0"));
      // Selalu fetch products terbaru saat modal dibuka
      fetchProducts();
    };

    window.addEventListener("openOrderModal", handleOpen);

    // Supabase Realtime Listener (Mounts once)
    const channel = supabase
      .channel("public:products:orderform")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, (payload) => {
        if (payload.eventType === "UPDATE") {
          setProducts(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
        } else {
          fetchProducts();
        }
      })
      .subscribe();

    return () => {
      window.removeEventListener("openOrderModal", handleOpen);
      supabase.removeChannel(channel);
    };
  }, []);

  const closeModal = () => setIsOpen(false);

  // Cart Operations
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id: Math.random().toString(), product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        if (newQ > item.product.stock) return item;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const getInCartQty = (productId: number) => {
    const item = cart.find(c => c.product.id === productId);
    return item ? item.quantity : 0;
  };

  const handleKirimPesanan = async () => {
    if (!customerName || customerName.trim() === "") {
      showToast("Silakan lengkapi nama Anda.", "error");
      return;
    }

    const phoneClean = customerPhone.replace(/\D/g, "");
    if (phoneClean.length < 10 || phoneClean.length > 15 || !/^\d+$/.test(customerPhone)) {
      showToast("Silakan perbaiki nomor Anda (hanya angka, 10-15 digit).", "error");
      return;
    }

    if (cart.length === 0) {
      showToast("Keranjang pesanan masih kosong.", "error");
      return;
    }

    setSubmitting(true);

    // 1. Generate Receipt Image & Upload
    const html2canvas = (await import("html2canvas")).default;
    const element = document.getElementById("public-receipt-capture");
    let receiptUrl = "";
    
    if (element) {
      element.style.display = "block";
      try {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
        
        if (blob) {
            const fileName = `receipts/ORD-${orderId}-${Date.now()}.png`;
            const { error: uploadError } = await supabase.storage
              .from("products")
              .upload(fileName, blob, { contentType: 'image/png' });
              
            if (!uploadError) {
              const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(fileName);
              receiptUrl = publicUrl;
            } else {
              console.error("Failed to upload receipt", uploadError);
            }
        }
      } catch (err) {
        console.error("Failed to generate/upload receipt", err);
      }
      element.style.display = "none";
    }

    // 2. Save order to Supabase (including receipt image URL)
    const orderData = {
      order_number: `#ORD-${orderId}`,
      customer_name: customerName,
      customer_phone: customerPhone,
      order_type: orderType,
      payment_method: paymentMethod,
      total_amount: subtotal,
      status: "pending",
      receipt_url: receiptUrl || null,
      items: cart.map(c => ({ name: c.product.name, qty: c.quantity, price: c.product.price }))
    };
    // Fire and forget — save to DB
    supabase.from("orders").insert([orderData]).then(({ error }) => {
      if (error) console.error("Could not save to Supabase. Table might not exist.", error);
    });

    // 2.5 Decrease stock in Supabase
    cart.forEach(item => {
      supabase.rpc("decrement_product_stock", { p_id: item.product.id, p_amount: item.quantity }).then(({ error }) => {
        if (error) console.error("Error decrementing stock for", item.product.name, error);
      });
    });

    // 3. Simple WhatsApp notification to admin (no long link)
    let textMessage = `*PESANAN BARU - ByTyaa Bakery*\n\n`;
    textMessage += `*No. Pesanan:* #ORD-${orderId}\n`;
    textMessage += `*Nama:* ${customerName}\n`;
    textMessage += `*HP:* ${customerPhone}\n`;
    textMessage += `*Jenis:* ${orderType} | *Bayar:* ${paymentMethod}\n\n`;
    textMessage += `*Pesanan:*\n`;
    cart.forEach(item => {
      textMessage += `• ${item.product.name} ×${item.quantity} = Rp ${(item.product.price * item.quantity).toLocaleString("id-ID")}\n`;
    });
    textMessage += `\n*Total: Rp ${subtotal.toLocaleString("id-ID")}*\n\n`;
    const encodedMessage = encodeURIComponent(textMessage);
    const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodedMessage}`;

    // Reset and Close
    setSubmitting(false);
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setIsOpen(false);

    // Open WhatsApp
    window.open(whatsappUrl, "_blank");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              top: "1.5rem",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: toast.type === "error" ? "#fef2f2" : "#f0fdf4",
              color: toast.type === "error" ? "#ef4444" : "#22c55e",
              padding: "0.75rem 1.5rem",
              borderRadius: "999px",
              fontWeight: 600,
              fontSize: "0.9rem",
              boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
              border: `1px solid ${toast.type === "error" ? "#fecaca" : "#bbf7d0"}`,
              zIndex: 999999, // Above modal
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <AlertCircle size={18} />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        <div style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeModal}
            style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{ 
              backgroundColor: "#ffffff", borderRadius: "1.5rem", width: "100%", maxWidth: "1000px", 
              height: "88vh", overflow: "hidden", position: "relative", zIndex: 10000, 
              boxShadow: "0 24px 64px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column" 
            }}
          >
            {/* Header */}
            <div style={{ padding: "1.25rem 2rem", backgroundColor: "#ffffff", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--secondary)" }} />
                <h2 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "1.4rem", color: "var(--primary)" }}>Buat Pesanan</h2>
              </div>
              <button onClick={closeModal} style={{ background: "#f8fafc", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "0.5rem", borderRadius: "50%", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f1f5f9"} onMouseLeave={e => e.currentTarget.style.backgroundColor = "#f8fafc"}>
                <X size={20} />
              </button>
            </div>

            {/* Body - 2 Columns on md up */}
            <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden bg-white">
              
              {/* LEFT: Product Selection */}
              <div className="flex-none md:flex-1 p-4 md:p-8 overflow-y-visible md:overflow-y-auto border-b md:border-b-0 md:border-r border-[#f1f5f9] hide-scrollbar" style={{ backgroundColor: "#ffffff" }}>
                <h3 style={{ margin: "0 0 1.25rem 0", fontSize: "1rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pilih Menu</h3>
                
                {loading ? (
                  <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Memuat menu yang lezat...</div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1.25rem" }}>
                    {products.sort((a, b) => {
                      const aIsBest = a.tag?.toLowerCase().includes("best seller") ? 1 : 0;
                      const bIsBest = b.tag?.toLowerCase().includes("best seller") ? 1 : 0;
                      return bIsBest - aIsBest;
                    }).map(product => {
                      const isOutOfStock = product.stock <= 0;
                      const inCartQty = getInCartQty(product.id);
                      return (
                        <div key={product.id} style={{ backgroundColor: "#ffffff", borderRadius: "1rem", overflow: "hidden", border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", transition: "transform 0.2s", cursor: "default" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "none"}>
                          <div style={{ height: "150px", width: "100%", backgroundColor: "#f8fafc", position: "relative" }}>
                             <img src={product.image || "/logo-whisk.png"} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                             {isOutOfStock && (
                               <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.7)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                 <span style={{ backgroundColor: "var(--secondary)", color: "white", padding: "0.35rem 0.75rem", borderRadius: "2rem", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em" }}>HABIS</span>
                               </div>
                             )}
                          </div>
                          <div style={{ padding: "1rem", display: "flex", flexDirection: "column", flex: 1 }}>
                            <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "0.95rem", fontWeight: 700, color: "var(--primary)" }}>{product.name}</h4>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>Rp {product.price.toLocaleString("id-ID")}</span>
                              {!isOutOfStock && (
                                <span style={{ fontSize: "0.75rem", color: "var(--secondary)", fontWeight: 600, backgroundColor: "#fff5f5", padding: "0.2rem 0.5rem", borderRadius: "999px" }}>
                                  Sisa: {product.stock}
                                </span>
                              )}
                            </div>
                            
                            <div style={{ marginTop: "auto" }}>
                              {isOutOfStock ? (
                                <button disabled style={{ width: "100%", padding: "0.5rem", borderRadius: "999px", border: "1px dashed #e2e8f0", backgroundColor: "#f8fafc", color: "#94a3b8", fontSize: "0.8rem", fontWeight: 600, cursor: "not-allowed" }}>Stok Habis</button>
                              ) : inCartQty > 0 ? (
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid var(--secondary)", backgroundColor: "#fff5f5", borderRadius: "999px", overflow: "hidden", padding: "0.25rem" }}>
                                  <button onClick={() => updateQuantity(cart.find(c => c.product.id === product.id)!.id, -1)} style={{ padding: "0.35rem", borderRadius: "50%", border: "none", backgroundColor: "white", color: "var(--secondary)", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}><Minus size={14} /></button>
                                  <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--secondary)" }}>{inCartQty}</span>
                                  <button onClick={() => addToCart(product)} style={{ padding: "0.35rem", borderRadius: "50%", border: "none", backgroundColor: "var(--secondary)", color: "white", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}><Plus size={14} /></button>
                                </div>
                              ) : (
                                <button onClick={() => addToCart(product)} style={{ width: "100%", padding: "0.6rem", borderRadius: "999px", border: "1px solid var(--secondary)", backgroundColor: "transparent", color: "var(--secondary)", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--secondary)"; e.currentTarget.style.color = "white"; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--secondary)"; }}>+ Tambah</button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* RIGHT: Order Details & Form */}
              <div className="w-full md:w-[380px] bg-[#f8fafc] flex flex-col flex-none md:flex-shrink-0 relative h-auto md:h-full">
                
                {/* Form Data Diri */}
                <div style={{ padding: "1.5rem", borderBottom: "1px dashed #e2e8f0" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <input 
                      type="text" 
                      placeholder="Nama Pemesan *" 
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      style={{ padding: "0.75rem 1rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", backgroundColor: "white", fontSize: "0.9rem", outline: "none", color: "var(--text)", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}
                      onFocus={e => e.currentTarget.style.borderColor = "var(--secondary)"}
                      onBlur={e => e.currentTarget.style.borderColor = "#e2e8f0"}
                    />
                    <input 
                      type="tel" 
                      placeholder="Nomor WhatsApp *" 
                      value={customerPhone}
                      onChange={e => {
                        const numbersOnly = e.target.value.replace(/\D/g, "").slice(0, 15);
                        setCustomerPhone(numbersOnly);
                      }}
                      style={{ padding: "0.75rem 1rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", backgroundColor: "white", fontSize: "0.9rem", outline: "none", color: "var(--text)", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}
                      onFocus={e => e.currentTarget.style.borderColor = "var(--secondary)"}
                      onBlur={e => e.currentTarget.style.borderColor = "#e2e8f0"}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "0.75rem" }}>
                    {/* Jenis Pesanan Dropdown */}
                    <div ref={orderTypeRef} style={{ position: "relative" }}>
                      <button
                        onClick={() => { setOrderTypeOpen(p => !p); setPaymentOpen(false); }}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "0.75rem 1rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", backgroundColor: "white", fontSize: "0.85rem", fontWeight: 600, color: "var(--text)", cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}
                      >
                        <span>{orderType}</span>
                        <motion.span animate={{ rotate: orderTypeOpen ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ display: "flex" }}>
                          <ChevronDown size={14} color="#94a3b8" />
                        </motion.span>
                      </button>
                      <AnimatePresence>
                        {orderTypeOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.97 }}
                            transition={{ duration: 0.15, ease: EASE }}
                            style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 9999, backgroundColor: "white", borderRadius: "0.75rem", border: "1px solid #e2e8f0", boxShadow: "0 16px 40px rgba(0,0,0,0.10)", overflow: "hidden" }}
                          >
                            {["Ambil di tempat", "COD"].map((opt, i) => (
                              <button key={opt} onClick={() => { setOrderType(opt); setOrderTypeOpen(false); }}
                                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "0.65rem 1rem", border: "none", backgroundColor: orderType === opt ? "var(--background)" : "transparent", color: orderType === opt ? "var(--primary)" : "var(--text-muted)", fontWeight: orderType === opt ? 700 : 500, fontSize: "0.85rem", cursor: "pointer", borderBottom: i === 0 ? "1px solid #f8fafc" : "none", textAlign: "left" }}
                                onMouseEnter={e => { if (orderType !== opt) e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                                onMouseLeave={e => { if (orderType !== opt) e.currentTarget.style.backgroundColor = "transparent"; }}
                              >{opt}</button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Metode Pembayaran Dropdown */}
                    <div ref={paymentRef} style={{ position: "relative" }}>
                      <button
                        onClick={() => { setPaymentOpen(p => !p); setOrderTypeOpen(false); }}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "0.75rem 1rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", backgroundColor: "white", fontSize: "0.85rem", fontWeight: 600, color: "var(--text)", cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}
                      >
                        <span>{paymentMethod}</span>
                        <motion.span animate={{ rotate: paymentOpen ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ display: "flex" }}>
                          <ChevronDown size={14} color="#94a3b8" />
                        </motion.span>
                      </button>
                      <AnimatePresence>
                        {paymentOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.97 }}
                            transition={{ duration: 0.15, ease: EASE }}
                            style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 9999, backgroundColor: "white", borderRadius: "0.75rem", border: "1px solid #e2e8f0", boxShadow: "0 16px 40px rgba(0,0,0,0.10)", overflow: "hidden" }}
                          >
                            {["Cash", "QRIS"].map((opt, i) => (
                              <button key={opt} onClick={() => { setPaymentMethod(opt); setPaymentOpen(false); }}
                                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "0.65rem 1rem", border: "none", backgroundColor: paymentMethod === opt ? "var(--background)" : "transparent", color: paymentMethod === opt ? "var(--primary)" : "var(--text-muted)", fontWeight: paymentMethod === opt ? 700 : 500, fontSize: "0.85rem", cursor: "pointer", borderBottom: i === 0 ? "1px solid #f8fafc" : "none", textAlign: "left" }}
                                onMouseEnter={e => { if (paymentMethod !== opt) e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                                onMouseLeave={e => { if (paymentMethod !== opt) e.currentTarget.style.backgroundColor = "transparent"; }}
                              >{opt}</button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Cart Items List */}
                <div style={{ flex: 1, overflowY: "visible", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem", minHeight: "200px" }} className="md:overflow-y-auto hide-scrollbar">
                  <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Keranjang</h3>
                  {cart.length === 0 ? (
                     <div style={{ textAlign: "center", color: "#94a3b8", marginTop: "1.5rem", padding: "2rem", backgroundColor: "white", borderRadius: "1rem", border: "1px dashed #cbd5e1" }}>
                       <ShoppingBag size={28} style={{ margin: "0 auto 0.75rem", opacity: 0.6 }} />
                       <p style={{ fontSize: "0.85rem", margin: 0 }}>Belum ada menu yang dipilih</p>
                     </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", backgroundColor: "white", borderRadius: "0.75rem", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--primary)", marginBottom: "0.25rem" }}>{item.product.name}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{item.quantity} x Rp {item.product.price.toLocaleString("id-ID")}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-end", flexDirection: "column", gap: "0.25rem" }}>
                          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--secondary)" }}>Rp {(item.product.price * item.quantity).toLocaleString("id-ID")}</span>
                          <button onClick={() => removeFromCart(item.id)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "0.25rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }} onMouseEnter={e => e.currentTarget.style.color = "#ef4444"} onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}>
                            <Trash2 size={12} /> Hapus
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer / Checkout */}
                <div style={{ padding: "1.5rem", backgroundColor: "white", borderTop: "1px solid #f1f5f9", flexShrink: 0, borderBottomRightRadius: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.25rem" }}>
                    <span style={{ fontSize: "0.95rem", color: "var(--text-muted)", fontWeight: 500 }}>Total Pembayaran</span>
                    <span style={{ fontSize: "1.5rem", color: "var(--primary)", fontWeight: 800 }}>Rp {subtotal.toLocaleString("id-ID")}</span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleKirimPesanan}
                    disabled={cart.length === 0 || submitting}
                    style={{ 
                      width: "100%", padding: "1rem", borderRadius: "999px", border: "none", 
                      backgroundColor: cart.length === 0 ? "#e2e8f0" : "var(--secondary)", 
                      color: cart.length === 0 ? "#94a3b8" : "white", 
                      fontWeight: 700, fontSize: "1rem", cursor: cart.length === 0 || submitting ? "not-allowed" : "pointer",
                      display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem",
                      boxShadow: cart.length > 0 && !submitting ? "0 8px 25px rgba(201,83,74,0.25)" : "none",
                      transition: "background 0.2s",
                      opacity: submitting ? 0.7 : 1
                    }}
                  >
                    {submitting ? "Memproses Nota..." : <><Send size={16} /> Kirim via WhatsApp</>}
                  </motion.button>
                  <p style={{ textAlign: "center", fontSize: "0.7rem", color: "#94a3b8", marginTop: "1rem", margin: "1rem 0 0 0" }}>
                    *Link nota akan otomatis dikirim ke WA Admin
                  </p>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Hidden Receipt Element for html2canvas */}
      <div 
        id="public-receipt-capture" 
        style={{ 
          display: "none", position: "absolute", left: "-9999px", top: "-9999px", 
          backgroundColor: "#fff", padding: "2rem", width: "400px", fontFamily: "'Courier New', Courier, monospace", border: "1px dashed #d1d5db", color: "#000" 
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#2C4A6E", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>🍪 ByTyaa Bakery</div>
          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Pesanan Online via Website</div>
          <div style={{ height: "1px", borderTop: "2px dashed #e5e7eb", margin: "0.75rem 0" }} />
          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{new Date().toLocaleString("id-ID")}</div>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2C4A6E", marginTop: "0.25rem" }}>#{orderId}</div>
        </div>
        <div style={{ marginBottom: "1rem", fontSize: "0.85rem" }}>
          <div><span style={{ color: "#6b7280" }}>Pemesan :</span> <strong>{customerName || "—"}</strong></div>
          <div><span style={{ color: "#6b7280" }}>No HP :</span> <strong>{customerPhone || "—"}</strong></div>
          <div><span style={{ color: "#6b7280" }}>Jenis Pesanan :</span> <strong>{orderType}</strong></div>
          <div><span style={{ color: "#6b7280" }}>Pembayaran :</span> <strong>{paymentMethod}</strong></div>
        </div>
        <div style={{ height: "1px", borderTop: "2px dashed #e5e7eb", margin: "1rem 0" }} />
        <div style={{ marginBottom: "1rem" }}>
          {cart.map(item => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
              <div>
                <div style={{ fontWeight: 700 }}>{item.product.name}</div>
                <div style={{ color: "#6b7280", fontSize: "0.75rem" }}>{item.quantity} × Rp {item.product.price.toLocaleString("id-ID")}</div>
              </div>
              <div style={{ fontWeight: 700 }}>Rp {(item.product.price * item.quantity).toLocaleString("id-ID")}</div>
            </div>
          ))}
        </div>
        <div style={{ height: "1px", borderTop: "2px dashed #e5e7eb", margin: "1rem 0" }} />
        <div style={{ fontSize: "0.85rem", display: "flex", justifyContent: "space-between", fontWeight: 900, color: "#2C4A6E", marginTop: "0.5rem" }}>
          <span>TOTAL BAYAR</span><span>Rp {subtotal.toLocaleString("id-ID")}</span>
        </div>
        <div style={{ height: "1px", borderTop: "2px dashed #e5e7eb", margin: "1rem 0" }} />
        <div style={{ textAlign: "center", fontSize: "0.75rem", color: "#6b7280" }}>
          <div>Terima kasih sudah memesan! 🤍</div>
          <div style={{ marginTop: "0.25rem" }}>ByTyaa · Homemade with love</div>
        </div>
      </div>
    </>
  );
}
