import { LayoutDashboard } from "lucide-react";
import Link  from "next/link";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
<Link
      href="/dashboard"
      className="
        flex items-center justify-start gap-3 w-full
        px-4 py-3 font-medium text-sm
        border border-slate-20 dark:border-slate-800 rounded-xl
        bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300
        hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300
        dark:hover:bg-slate-800 dark:hover:text-slate-50 dark:hover:border-slate-700
        hover:shadow-sm
        transition-all duration-200 ease-in-out
      "
    >
      <LayoutDashboard className="h-5 w-5" />
      <span>Customer Dashboard</span>
    </Link>

      <div className="grid md:grid-cols-4 gap-5"></div>
    </div>
  );
}
