"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Home, TrendingUp, ShoppingBag, Users, Info } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { supabase } from "../lib/supabase";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

const pieData = [
  { name: "Penelusuran Organik", value: 45 },
  { name: "Trafik Langsung", value: 30 },
  { name: "Sosial Media", value: 25 },
];
const COLORS = ["#2c4a6e", "#c9534a", "#c0b8a8"];

type Order = {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("id, total_amount, status, created_at")
      .order("created_at", { ascending: true });
    if (!error && data) setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    // Realtime listener — update cards when orders change
    const channel = supabase
      .channel("public:orders:dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        fetchOrders();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const totalRevenue = orders
    .filter(o => o.status === "selesai")
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalOrders = orders.length;

  // Build bar chart data: group completed orders by day of week
  const daysMap: Record<string, number> = { Sen: 0, Sel: 0, Rab: 0, Kam: 0, Jum: 0, Sab: 0, Min: 0 };
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  orders.forEach(o => {
    const day = dayNames[new Date(o.created_at).getDay()];
    daysMap[day] = (daysMap[day] || 0) + 1;
  });
  const barData = Object.entries(daysMap).map(([name, Pesanan]) => ({ name, Pesanan }));

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
    >
      {/* Header */}
      <motion.div variants={itemVariants} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ padding: "0.5rem", backgroundColor: "var(--card)", borderRadius: "0.5rem", color: "var(--primary)", border: "1px solid var(--border)" }}>
            <Home size={24} />
          </div>
          <h1 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "1.8rem", color: "var(--primary)", fontWeight: 700 }}>Dashboard</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.9rem", cursor: "pointer" }}>
          Ringkasan <Info size={16} />
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
        {/* Card 1: Total Pendapatan */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -5, boxShadow: "0 12px 30px rgba(44,74,110,0.2)" }}
          transition={{ duration: 0.3 }}
          style={{
            backgroundColor: "var(--primary)", borderRadius: "1.25rem", padding: "1.5rem",
            color: "white", position: "relative", overflow: "hidden",
            boxShadow: "0 8px 24px rgba(44,74,110,0.15)",
          }}
        >
          <div style={{ fontSize: "0.95rem", fontWeight: 500, marginBottom: "0.5rem", opacity: 0.9 }}>Total Pendapatan</div>
          <div style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem", fontFamily: "var(--font-heading)" }}>
            {loading ? "..." : `Rp ${totalRevenue.toLocaleString("id-ID")}`}
          </div>
          <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>Dari pesanan berstatus Selesai</div>
          <TrendingUp size={64} style={{ position: "absolute", top: "1rem", right: "1rem", opacity: 0.15 }} />
        </motion.div>

        {/* Card 2: Total Pesanan */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -5, boxShadow: "0 12px 30px rgba(201,83,74,0.2)" }}
          transition={{ duration: 0.3 }}
          style={{
            backgroundColor: "var(--secondary)", borderRadius: "1.25rem", padding: "1.5rem",
            color: "white", position: "relative", overflow: "hidden",
            boxShadow: "0 8px 24px rgba(201,83,74,0.15)",
          }}
        >
          <div style={{ fontSize: "0.95rem", fontWeight: 500, marginBottom: "0.5rem", opacity: 0.9 }}>Total Pesanan</div>
          <div style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "0.5rem", fontFamily: "var(--font-heading)" }}>
            {loading ? "..." : totalOrders}
          </div>
          <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>Semua pesanan yang masuk</div>
          <ShoppingBag size={64} style={{ position: "absolute", top: "1rem", right: "1rem", opacity: 0.15 }} />
        </motion.div>

        {/* Card 3: Pengunjung Online */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -5, boxShadow: "0 12px 30px rgba(0,0,0,0.06)" }}
          transition={{ duration: 0.3 }}
          style={{
            backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "1.25rem",
            padding: "1.5rem", color: "var(--text)", position: "relative", overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ fontSize: "0.95rem", fontWeight: 500, marginBottom: "0.5rem", color: "var(--text-muted)" }}>Pengunjung Online</div>
          <div style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "0.5rem", fontFamily: "var(--font-heading)", color: "var(--primary)" }}>—</div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Tidak dilacak</div>
          <Users size={64} style={{ position: "absolute", top: "1rem", right: "1rem", opacity: 0.05, color: "var(--primary)" }} />
        </motion.div>
      </div>

      {/* Charts Section */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", marginTop: "0.5rem" }}>
        {/* Bar Chart */}
        <motion.div
          variants={itemVariants}
          style={{ backgroundColor: "var(--card)", borderRadius: "1.25rem", padding: "1.5rem", border: "1px solid var(--border)", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}
        >
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--primary)", margin: "0 0 1.5rem 0", fontFamily: "var(--font-heading)" }}>
            Pesanan per Hari
          </h3>
          <div style={{ height: "300px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={false} />
                <Tooltip
                  cursor={{ fill: "var(--background)" }}
                  contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                />
                <Bar dataKey="Pesanan" fill="var(--secondary)" radius={[4, 4, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Doughnut Chart */}
        <motion.div
          variants={itemVariants}
          style={{ backgroundColor: "var(--card)", borderRadius: "1.25rem", padding: "1.5rem", border: "1px solid var(--border)", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column" }}
        >
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--primary)", margin: "0 0 1rem 0", fontFamily: "var(--font-heading)" }}>
            Sumber Trafik
          </h3>
          <div style={{ height: "200px", width: "100%", position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80}
                  paddingAngle={5} dataKey="value" stroke="none" animationDuration={1500}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1.5rem" }}>
            {pieData.map((item, index) => (
              <div key={item.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: COLORS[index] }} />
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{item.name}</span>
                </div>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text)" }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
