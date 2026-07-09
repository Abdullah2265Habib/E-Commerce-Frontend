export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        minHeight: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {children}
    </section>
  );
}
