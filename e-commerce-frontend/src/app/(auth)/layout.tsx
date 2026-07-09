import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1 w-full bg-slate-50/50">
      <header className="sticky top-0 z-50 flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-black to-neutral-500 bg-clip-text text-transparent tracking-tight hover:opacity-90 transition-opacity">
            MyApp
        </Link>


        <nav className="flex items-center gap-2">
          <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-50 px-3.5 py-2 rounded-xl transition-all duration-200">
            Login
          </Link>
          <Link href="/signup" className="text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-50 px-3.5 py-2 rounded-xl transition-all duration-200">
            Signup
          </Link>
        </nav>
      </header>

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