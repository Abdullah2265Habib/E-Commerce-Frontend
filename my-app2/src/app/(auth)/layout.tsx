import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 2rem",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Link href="/">MyApp</Link>

        <nav
          style={{
            display: "flex",
            gap: "1rem",
          }}
        >
          <Link href="/login">Login</Link>
          <Link href="/signup">Signup</Link>
        </nav>
      </header>

      <main style={{ flex: 1 }}>{children}</main>

      <footer
        style={{
          textAlign: "center",
          padding: "1rem",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <Link href="/terms">Terms of Service</Link>
        {" | "}
        <Link href="/privacy">Privacy Policy</Link>
      </footer>
    </div>
  );
} 