import Link from "next/link";
import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import { Package, Zap, Shield, BarChart3 } from "lucide-react";

export default async function Home() {
  const user = await stackServerApp.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col">
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-[var(--accent)]" />
          <span className="font-semibold tracking-tight">Itranstion</span>
        </div>
        <Link
          href="/sign-in"
          className="px-4 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          Sign In
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs mb-8 text-gray-300">
            <Zap className="w-3 h-3" /> Real-time inventory management
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Inventory that
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              {" "}scales
            </span>
          </h1>
          <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">
            Custom fields, dynamic IDs, real-time collaboration and full-text
            search — all in one powerful system.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/sign-in"
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-sm font-semibold transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/sign-up"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-semibold transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-20 max-w-2xl w-full text-left">
          {[
            { icon: Package, title: "Custom Fields", desc: "15 dynamic fields per inventory" },
            { icon: Shield, title: "Optimistic Lock", desc: "Conflict-free concurrent edits" },
            { icon: BarChart3, title: "Real-time", desc: "Live discussions via WebSockets" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <Icon className="w-5 h-5 text-indigo-400 mb-3" />
              <div className="font-semibold text-sm mb-1">{title}</div>
              <div className="text-xs text-gray-500">{desc}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}