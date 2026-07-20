import Link  from "next/link";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <Link href="/dashboard" className="text-blue-500 underline">
        Customer Dashboard
      </Link>
      <div className="grid md:grid-cols-4 gap-5"></div>
    </div>
  );
}
