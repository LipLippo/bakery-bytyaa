"use client";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        padding: "2rem 1.5rem",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.3rem",
          color: "var(--primary)",
          marginBottom: "0.3rem",
        }}
      >
        ByTyaa
      </p>
      <p
        style={{
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "1rem",
        }}
      >
        Homemade Cookies · Semarang
      </p>
      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
        © {new Date().getFullYear()} Bakery ByTyaa. All rights reserved.
      </p>
    </footer>
  );
}
