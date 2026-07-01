"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, RefreshCw, Eye, X, CheckCircle, Clock, XCircle, ShoppingBag, Phone, User, CreditCard, Package, Trash2, AlertTriangle } from "lucide-react";
import { supabase } from "../../lib/supabase";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type OrderItem = { name: string; qty: number; price: number };

type Order = {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  order_type: string;
  payment_method: string;
  total_amount: number;
  status: "pending" | "proses" | "selesai" | "dibatalkan";
  receipt_url: string | null;
  items: OrderItem[];
  created_at: string;
};

const STATUS_CONFIG = {
  pending:    { label: "Pending",    color: "#f59e0b", bg: "#fef3c7", icon: Clock },
  proses:     { label: "Diproses",  color: "#3b82f6", bg: "#dbeafe", icon: Package },
  selesai:    { label: "Selesai",   color: "#10b981", bg: "#d1fae5", icon: CheckCircle },
  dibatalkan: { label: "Dibatalkan", color: "#ef4444", bg: "#fee2e2", icon: XCircle },
};

function ReceiptModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: EASE }}
        style={{ position: "relative", zIndex: 1, backgroundColor: "white", borderRadius: "1.5rem", padding: "2rem", maxWidth: "500px", width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "var(--primary)" }}>Nota Pesanan</h3>
          <button onClick={onClose} style={{ background: "#f8fafc", border: "none", cursor: "pointer", padding: "0.5rem", borderRadius: "50%" }}>
            <X size={18} />
          </button>
        </div>
        {order.receipt_url ? (
          <img
            src={order.receipt_url}
            alt={`Nota ${order.order_number}`}
            style={{ width: "100%", borderRadius: "1rem", border: "1px solid #f1f5f9", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
          />
        ) : (
          <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8", backgroundColor: "#f8fafc", borderRadius: "1rem", border: "1px dashed #cbd5e1" }}>
            <FileText size={32} style={{ margin: "0 auto 0.75rem", opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: "0.9rem" }}>Gambar nota tidak tersedia</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function LaporanPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("semua");

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data as Order[]);
    } else {
      console.error("Error fetching orders:", error);
    }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: number, status: Order["status"]) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    await supabase.from("orders").delete().eq("id", id);
    setOrders(prev => prev.filter(o => o.id !== id));
    setDeleteConfirmId(null);
  };

  const filteredOrders = filterStatus === "semua"
    ? orders
    : orders.filter(o => o.status === filterStatus);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    proses: orders.filter(o => o.status === "proses").length,
    selesai: orders.filter(o => o.status === "selesai").length,
    revenue: orders.filter(o => o.status === "selesai").reduce((sum, o) => sum + o.total_amount, 0),
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } } };

  return (
    <>
      {/* Receipt Modal */}
      <AnimatePresence>
        {selectedOrder && <ReceiptModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
      </AnimatePresence>

      {/* Delete Confirm Dialog */}
      <AnimatePresence>
        {deleteConfirmId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          >
            <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)" }} onClick={() => setDeleteConfirmId(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.25, ease: EASE }}
              style={{ position: "relative", backgroundColor: "white", borderRadius: "1.5rem", padding: "2rem", maxWidth: "400px", width: "100%", boxShadow: "0 32px 64px rgba(0,0,0,0.18)", textAlign: "center" }}
            >
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                <AlertTriangle size={28} color="#ef4444" />
              </div>
              <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem", fontWeight: 700, color: "var(--primary)" }}>Hapus Pesanan?</h3>
              <p style={{ margin: "0 0 1.5rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>Pesanan ini akan dihapus permanen dari laporan dan tidak bisa dipulihkan.</p>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setDeleteConfirmId(null)}
                  style={{ flex: 1, padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid var(--border)", backgroundColor: "white", fontWeight: 600, fontSize: "0.9rem", color: "var(--text)", cursor: "pointer" }}
                >
                  Batal
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => handleDelete(deleteConfirmId)}
                  style={{ flex: 1, padding: "0.75rem", borderRadius: "0.75rem", border: "none", backgroundColor: "#ef4444", fontWeight: 700, fontSize: "0.9rem", color: "white", cursor: "pointer" }}
                >
                  Ya, Hapus
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 style={{ margin: "0 0 0.5rem 0", fontFamily: "var(--font-heading)", fontSize: "2rem", color: "var(--primary)", fontWeight: 700 }}>
              Laporan Pesanan
            </h1>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "1rem" }}>
              Semua pesanan yang masuk dari pelanggan online.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={fetchOrders}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.25rem", backgroundColor: "white", border: "1px solid var(--border)", borderRadius: "0.75rem", fontWeight: 600, fontSize: "0.9rem", color: "var(--text)", cursor: "pointer" }}
          >
            <RefreshCw size={16} /> Refresh
          </motion.button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Pesanan", value: stats.total, color: "#6366f1", bg: "#eef2ff", icon: FileText },
            { label: "Pending", value: stats.pending, color: "#f59e0b", bg: "#fef3c7", icon: Clock },
            { label: "Diproses", value: stats.proses, color: "#3b82f6", bg: "#dbeafe", icon: Package },
            { label: "Revenue", value: `Rp ${stats.revenue.toLocaleString("id-ID")}`, color: "#10b981", bg: "#d1fae5", icon: CheckCircle },
          ].map(stat => (
            <div key={stat.label} style={{ backgroundColor: "var(--card)", borderRadius: "1rem", padding: "1.25rem", border: "1px solid var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>{stat.label}</span>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: stat.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <stat.icon size={16} color={stat.color} />
                </div>
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--primary)" }}>{stat.value}</div>
            </div>
          ))}
        </motion.div>

        {/* Filter Tabs */}
        <motion.div variants={itemVariants} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {["semua", "pending", "proses", "selesai", "dibatalkan"].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: "0.5rem 1rem", borderRadius: "999px", border: "none", cursor: "pointer",
                backgroundColor: filterStatus === status ? "var(--primary)" : "var(--card)",
                color: filterStatus === status ? "white" : "var(--text-muted)",
                fontWeight: 600, fontSize: "0.85rem",
                border: `1px solid ${filterStatus === status ? "var(--primary)" : "var(--border)"}`,
                transition: "all 0.2s", textTransform: "capitalize"
              } as React.CSSProperties}
            >
              {status === "semua" ? "Semua" : STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label}
              {" "}({status === "semua" ? orders.length : orders.filter(o => o.status === status).length})
            </button>
          ))}
        </motion.div>

        {/* Orders List */}
        <motion.div variants={itemVariants} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {loading ? (
            <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)", backgroundColor: "var(--card)", borderRadius: "1rem" }}>
              <RefreshCw size={24} className="animate-spin mx-auto mb-2" />
              <p>Memuat pesanan...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)", backgroundColor: "var(--card)", borderRadius: "1rem", border: "1px solid var(--border)" }}>
              <ShoppingBag size={40} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
              <p style={{ fontWeight: 600 }}>Belum ada pesanan {filterStatus !== "semua" ? `dengan status "${STATUS_CONFIG[filterStatus as keyof typeof STATUS_CONFIG]?.label}"` : ""}</p>
            </div>
          ) : (
            filteredOrders.map((order, index) => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const StatusIcon = cfg.icon;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.3, ease: EASE }}
                  style={{ backgroundColor: "var(--card)", borderRadius: "1.25rem", border: "1px solid var(--border)", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "1rem" }}
                >
                  {/* Top Row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                        <span style={{ fontWeight: 800, fontSize: "1rem", color: "var(--primary)" }}>{order.order_number}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.25rem 0.75rem", borderRadius: "999px", backgroundColor: cfg.bg, color: cfg.color, fontSize: "0.75rem", fontWeight: 700 }}>
                          <StatusIcon size={12} /> {cfg.label}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        {new Date(order.created_at).toLocaleString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--secondary)" }}>
                      Rp {order.total_amount?.toLocaleString("id-ID")}
                    </div>
                  </div>

                  {/* Info Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { icon: User, label: "Pemesan", value: order.customer_name },
                      { icon: Phone, label: "No. HP", value: order.customer_phone },
                      { icon: Package, label: "Jenis", value: order.order_type },
                      { icon: CreditCard, label: "Pembayaran", value: order.payment_method },
                    ].map(info => (
                      <div key={info.label} style={{ backgroundColor: "var(--background)", borderRadius: "0.75rem", padding: "0.75rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.25rem" }}>
                          <info.icon size={12} color="var(--text-muted)" />
                          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.03em" }}>{info.label}</span>
                        </div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text)" }}>{info.value || "-"}</div>
                      </div>
                    ))}
                  </div>

                  {/* Items */}
                  {Array.isArray(order.items) && order.items.length > 0 && (
                    <div style={{ backgroundColor: "var(--background)", borderRadius: "0.75rem", padding: "0.75rem 1rem" }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Rincian Item</div>
                      {order.items.map((item, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", paddingBottom: i < order.items.length - 1 ? "0.4rem" : 0, marginBottom: i < order.items.length - 1 ? "0.4rem" : 0, borderBottom: i < order.items.length - 1 ? "1px solid var(--border)" : "none" }}>
                          <span style={{ color: "var(--text)" }}>{item.name} <span style={{ color: "var(--text-muted)" }}>×{item.qty}</span></span>
                          <span style={{ fontWeight: 700, color: "var(--primary)" }}>Rp {(item.price * item.qty).toLocaleString("id-ID")}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions Row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                    {/* Status Update */}
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      {(["pending", "proses", "selesai", "dibatalkan"] as const).map(s => {
                        const sc = STATUS_CONFIG[s];
                        const isActive = order.status === s;
                        return (
                          <button
                            key={s}
                            onClick={() => updateStatus(order.id, s)}
                            style={{
                              padding: "0.4rem 0.85rem", borderRadius: "999px", border: `1px solid ${isActive ? sc.color : "var(--border)"}`,
                              backgroundColor: isActive ? sc.bg : "transparent",
                              color: isActive ? sc.color : "var(--text-muted)",
                              fontWeight: 600, fontSize: "0.78rem", cursor: "pointer", transition: "all 0.2s"
                            }}
                          >
                            {sc.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* View Receipt + Delete */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <motion.button
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedOrder(order)}
                        style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", backgroundColor: "var(--primary)", color: "white", border: "none", borderRadius: "0.75rem", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
                      >
                        <Eye size={15} /> Lihat Nota
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: "#fef2f2" }} whileTap={{ scale: 0.95 }}
                        onClick={() => setDeleteConfirmId(order.id)}
                        title="Hapus Pesanan"
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0.5rem 0.75rem", backgroundColor: "transparent", color: "#ef4444", border: "1px solid #fecaca", borderRadius: "0.75rem", cursor: "pointer", transition: "background 0.2s" }}
                      >
                        <Trash2 size={15} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </motion.div>
    </>
  );
}
