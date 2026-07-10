import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1 w-full bg-slate-50/50">
      <main className="flex-1 flex flex-col w-full">
        {children}
      </main>

      <footer className="py-4 text-center border-t border-slate-100 bg-white/40 backdrop-blur-sm">
        <div className="flex justify-center gap-3 text-xs font-medium text-slate-400">
          <Link href="/terms" className="hover:text-slate-600 hover:underline transition-colors">Terms of Service</Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-slate-600 hover:underline transition-colors">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
} 