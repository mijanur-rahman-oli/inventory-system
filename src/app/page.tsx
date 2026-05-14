"use client";

import { useState, useEffect, useRef, createContext, useContext } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// IMPORT ICONS HERE
import { FaApple, FaGooglePlay, FaAmazon } from "react-icons/fa";
import {
  SiShopify, SiQuickbooks, SiStripe,
  SiFedex, SiUps, SiEtsy, SiWoocommerce,
  SiXero, SiSalesforce, SiSlack, SiZapier
} from "react-icons/si";

// ============================================================================
// THEME CONTEXT
// ============================================================================
const ThemeContext = createContext({ theme: "light", toggleTheme: () => { } });
export const useTheme = () => useContext(ThemeContext);

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

useEffect(() => {
  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initial = stored || (prefersDark ? "dark" : "light");
  setTheme(initial);
  document.documentElement.classList.toggle("dark", initial === "dark");

  setMounted(true);
}, []);

const toggleTheme = () => {
  const next = theme === "dark" ? "light" : "dark";
  setTheme(next);
  localStorage.setItem("theme", next);

  document.documentElement.classList.toggle("dark", next === "dark");
};
  if (!mounted) return null;
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return scrolled;
}

function useInView(ref, threshold = 0.1) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return inView;
}

function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: delay / 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const NAV = [
  { label: "Features", href: "#features" },
  { label: "Why Us", href: "#why" },
  { label: "Pricing", href: "#pricing" },
  { label: "Integrations", href: "#integrations" },
  { label: "Resources", href: "#" },
];

function Header() {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ${scrolled ? "bg-white dark:bg-gray-950 shadow-sm" : "bg-white dark:bg-gray-950"} border-b border-gray-200 dark:border-gray-800`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded bg-[#E8442A] flex items-center justify-center">
            <svg width="14" height="14" fill="none" viewBox="0 0 16 16">
              <rect x="1" y="1" width="6" height="6" rx="1" fill="white" />
              <rect x="9" y="1" width="6" height="6" rx="1" fill="white" opacity=".7" />
              <rect x="1" y="9" width="6" height="6" rx="1" fill="white" opacity=".7" />
              <rect x="9" y="9" width="6" height="6" rx="1" fill="white" opacity=".4" />
            </svg>
          </div>
          <span className="font-bold text-base text-gray-900 dark:text-white tracking-tight">InventoryOS</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV.map((n) => (
            <Link key={n.label} href={n.href} className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* <button onClick={toggleTheme} className="hidden sm:flex p-2 rounded-lg text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Toggle theme">
            {theme === "dark"
              ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
              : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>}
          </button> */}
          <Link href="/sign-in" className="hidden sm:inline-flex text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Sign in</Link>
          <Link href="/sign-up" className="inline-flex text-sm font-semibold bg-[#E8442A] hover:bg-[#d03820] text-white px-4 py-1.5 rounded-md transition-colors shadow-sm">
            Get Started
          </Link>
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-md text-gray-500" aria-label="Menu">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {open ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
            <div className="px-4 py-3 flex flex-col gap-1">
              {NAV.map((n) => (
                <Link key={n.label} href={n.href} onClick={() => setOpen(false)} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">{n.label}</Link>
              ))}
              <div className="pt-2 mt-1 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                <Link href="/sign-in" className="flex-1 text-center py-2 text-sm text-gray-600 border border-gray-200 rounded-md">Sign in</Link>
                <Link href="/sign-up" className="flex-1 text-center py-2 text-sm font-semibold bg-[#E8442A] text-white rounded-md">Get Started</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ============================================================================
// HERO
// ============================================================================
const TRUSTED_BY = ["Zoho", "Shopify", "QuickBooks", "WooCommerce", "Amazon", "FedEx"];

const AppBadge = ({ store }) => {
  const isGoogle = store === "google";

  return (
    <div className="flex items-center gap-3 bg-black text-white px-4 py-2 rounded-xl border border-gray-800 hover:bg-gray-900 transition-colors w-[180px]">
      {/* This uses the icon we imported earlier */}
      {isGoogle ? <FaGooglePlay size={24} /> : <FaApple size={24} />}

      <div className="flex flex-col items-start leading-tight">
        <span className="text-[10px] uppercase font-medium text-gray-400">
          {isGoogle ? "Get it on" : "Download on the"}
        </span>
        <span className="text-sm font-semibold">
          {isGoogle ? "Google Play" : "App Store"}
        </span>
      </div>
    </div>
  );
};
// Mini dashboard preview card
function DashboardPreview() {
  const items = [
    { name: "Wireless Headphones", sku: "WH-001", qty: 842, status: "In Stock", color: "text-green-600 bg-green-50 dark:bg-green-900/20" },
    { name: "USB-C Hub 7-Port", sku: "UC-072", qty: 156, status: "Low Stock", color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
    { name: "Mechanical Keyboard", sku: "MK-304", qty: 38, status: "Critical", color: "text-red-600 bg-red-50 dark:bg-red-900/20" },
    { name: "Standing Desk Mat", sku: "DM-115", qty: 601, status: "In Stock", color: "text-green-600 bg-green-50 dark:bg-green-900/20" },
  ];
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
      {/* Top bar */}
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
          <div className="w-3 h-3 rounded-full bg-green-400/80" />
        </div>
        <div className="mx-auto bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 px-3 py-0.5 text-xs text-gray-400 font-mono">
          app.itransition.io/inventory
        </div>
        <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
          Live
        </div>
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-px bg-gray-200 dark:bg-gray-700">
        {[{ label: "Total SKUs", val: "12,847" }, { label: "Orders Today", val: "284" }, { label: "Fulfillment", val: "99.1%" }].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-900 px-4 py-3">
            <div className="text-lg font-bold text-gray-900 dark:text-white">{s.val}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>
      {/* Table */}
      <div className="p-4">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Inventory Items</div>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.sku} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                <div className="text-xs text-gray-400 font-mono">{item.sku}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 tabular-nums">{item.qty}</div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.color}`}>{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="pt-24 pb-16 bg-white dark:bg-gray-950 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Trusted by 2,400+ businesses worldwide</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-[1.15] tracking-tight"
            >
              Manage inventory and{" "}
              <span className="text-[#E8442A]">fulfill orders</span>
              {" "}— the right way
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-4 text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg"
            >
              Itransition helps you track every SKU across every channel, automate reorders, and ship faster all from one dashboard.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.22 }}
              className="mt-7 flex flex-col sm:flex-row gap-3"
            >
              <Link href="/sign-up" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#E8442A] hover:bg-[#d03820] text-white font-semibold rounded-lg transition-colors shadow-sm text-sm">
                Get Our Services
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            </motion.div>


            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="mt-4 text-xs text-gray-400"
            >
              14-day free trial · No credit card required · Cancel anytime
            </motion.p>
          </div>

          {/* Right - Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <DashboardPreview />
          </motion.div>
        </div>

        {/* Trusted By */}
        <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center mb-6">Trusted by industry leaders</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {TRUSTED_BY.map((name) => (
              <div key={name} className="text-base font-bold text-gray-300 dark:text-gray-600 tracking-tight select-none">
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FEATURE STRIPS (like Zoho's alternating sections)
// ============================================================================
const FEATURE_SECTIONS = [
  {
    eyebrow: "Sell More",
    title: "Sell more with multi-channel sync",
    desc: "Connect Shopify, Amazon, WooCommerce, Etsy, and more. Inventory updates propagate across every storefront in milliseconds — no more overselling or disappointed customers.",
    bullets: ["Real-time inventory sync across 15+ channels", "Prevent overselling with automatic holds", "Single source of truth for all your stock"],
    accent: "#2563EB",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
      </svg>
    ),
    visual: (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-lg">
        <div className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Channel Performance</div>
        {[
          { ch: "Shopify", orders: 142, pct: 85, color: "#96bf48" },
          { ch: "Amazon", orders: 89, pct: 53, color: "#FF9900" },
          { ch: "WooCommerce", orders: 34, pct: 20, color: "#7f54b3" },
          { ch: "Etsy", orders: 19, pct: 11, color: "#F56400" },
        ].map((c) => (
          <div key={c.ch} className="mb-3 last:mb-0">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600 dark:text-gray-400 font-medium">{c.ch}</span>
              <span className="text-gray-700 dark:text-gray-300 tabular-nums font-semibold">{c.orders} orders</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ backgroundColor: c.color }} initial={{ width: 0 }} whileInView={{ width: `${c.pct}%` }} viewport={{ once: true }} transition={{ duration: 0.8, ease: "easeOut" }} />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    eyebrow: "Handle Spikes",
    title: "Handle sales spikes with smart auto-reorder",
    desc: "Set reorder thresholds once. Our engine monitors stock 24/7 and triggers supplier purchase orders automatically — even during your busiest sales days.",
    bullets: ["AI-driven demand forecasting", "Automated PO generation to suppliers", "Multi-supplier fallback routing"],
    accent: "#059669",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    visual: (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-lg">
        <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Auto-Reorder Triggered</div>
        <p className="text-xs text-gray-500 mb-4">Mechanical Keyboard dropped below threshold</p>
        <div className="space-y-3">
          {[
            { label: "Current Stock", val: "38 units", highlight: false, sub: "" },
            { label: "Reorder Point", val: "50 units", highlight: true, sub: "Triggered!" },
            { label: "Reorder Qty", val: "200 units", highlight: false, sub: "" },
            { label: "Supplier", val: "KeyTech Ltd.", highlight: false, sub: "" },
          ].map((r) => (
            <div key={r.label} className={`flex items-center justify-between px-3 py-2 rounded-lg ${r.highlight ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800" : "bg-gray-50 dark:bg-gray-800"}`}>
              <span className="text-xs text-gray-600 dark:text-gray-400">{r.label}</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${r.highlight ? "text-amber-700 dark:text-amber-400" : "text-gray-800 dark:text-gray-200"}`}>{r.val}</span>
                {r.sub && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 font-medium">{r.sub}</span>}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-medium">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          PO #4421 sent to KeyTech Ltd. automatically
        </div>
      </div>
    ),
  },
  {
    eyebrow: "Control Warehouses",
    title: "Control warehouses down to the bin level",
    desc: "Track exact bin, aisle, and shelf locations across unlimited warehouses. Slash pick-and-pack time by 60% with precision location mapping and barcode scanning.",
    bullets: ["Bin-level location tracking", "60% faster pick-and-pack operations", "Multi-warehouse inventory visibility"],
    accent: "#7C3AED",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
    visual: (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">Warehouse A — Floor Plan</div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { bin: "A1", item: "WH-001", status: "full" },
              { bin: "A2", item: "UC-072", status: "low" },
              { bin: "A3", item: "", status: "empty" },
              { bin: "A4", item: "MK-304", status: "critical" },
              { bin: "B1", item: "DM-115", status: "full" },
              { bin: "B2", item: "WC-882", status: "full" },
              { bin: "B3", item: "KB-221", status: "low" },
              { bin: "B4", item: "", status: "empty" },
            ].map((b) => (
              <div key={b.bin} className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] font-bold border-2 ${b.status === "full" ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400"
                : b.status === "low" ? "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400"
                  : b.status === "critical" ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400"
                    : "bg-gray-50 dark:bg-gray-800 border-dashed border-gray-200 dark:border-gray-700 text-gray-300"
                }`}>
                <span>{b.bin}</span>
                {b.item && <span className="font-mono text-[8px] opacity-70">{b.item}</span>}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4">
            {[["full", "Full", "green"], ["low", "Low", "amber"], ["critical", "Critical", "red"], ["empty", "Empty", "gray"]].map(([k, l, c]) => (
              <div key={k} className="flex items-center gap-1">
                <div className={`w-2.5 h-2.5 rounded-sm bg-${c}-400`} style={{ backgroundColor: c === "gray" ? "#d1d5db" : undefined }} />
                <span className="text-[10px] text-gray-500">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
];

function FeatureSections() {
  return (
    <section id="features" className="py-16 bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-14">
          <p className="text-xs font-bold text-[#E8442A] uppercase tracking-widest mb-2">Core Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Transform the way you manage your inventory</h2>
        </Reveal>

        <div className="space-y-20">
          {FEATURE_SECTIONS.map((section, i) => (
            <Reveal key={section.title} delay={i * 80}>
              <div className={`grid lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "lg:grid-flow-dense" : ""}`}>
                <div className={i % 2 === 1 ? "lg:col-start-2" : ""}>
                  <div className="inline-flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: section.accent + "15", color: section.accent }}>
                      {section.icon}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: section.accent }}>{section.eyebrow}</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-snug">{section.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{section.desc}</p>
                  <ul className="space-y-2.5 mb-7">
                    {section.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                        <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: section.accent }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Link href="#" className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: section.accent }}>
                    Learn more
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </Link>
                </div>
                <div className={i % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""}>
                  {section.visual}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CTA BANNER (Zoho-style orange band)
// ============================================================================
function CTABanner() {
  return (
    <section className="bg-[#1A3C6B] py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <Reveal>
            <p className="text-sm font-bold text-blue-300 uppercase tracking-widest mb-3">Know Your Numbers</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-snug mb-4">
              Know your inventory and grow your business
            </h2>
            <p className="text-blue-200 leading-relaxed mb-6">
              Real-time dashboards with drill-down reports. Monitor KPIs, spot trends, and make data-driven decisions — without waiting for end-of-day reports.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/sign-up" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-[#1A3C6B] font-semibold rounded-lg text-sm hover:bg-blue-50 transition-colors">
                Start Free Trial
              </Link>
              <Link href="/demo" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-blue-400/50 text-white font-semibold rounded-lg text-sm hover:bg-white/10 transition-colors">
                View Live Demo
              </Link>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: "50K+", label: "SKUs managed daily" },
                { val: "99.9%", label: "Uptime SLA" },
                { val: "<50ms", label: "Sync latency" },
                { val: "2,400+", label: "Companies" },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                  <div className="text-3xl font-bold text-white mb-1">{s.val}</div>
                  <div className="text-sm text-blue-200">{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// EVERYTHING YOU NEED (feature grid)
// ============================================================================
const EVERYTHING = [
  { icon: "↻", title: "Multi-Channel Sync", desc: "Sell on 15+ platforms simultaneously with real-time inventory updates." },
  { icon: "◈", title: "Auto Reorder", desc: "AI-driven reorder triggers so you never run out of stock." },
  { icon: "▦", title: "Bin Location Tracking", desc: "Precise bin, aisle, shelf locations across unlimited warehouses." },
  { icon: "◉", title: "Live Analytics", desc: "Real-time KPI dashboards with drill-down reporting." },
  { icon: "⚡", title: "Barcode Scanning", desc: "Scan any barcode format to receive, pick, and ship orders fast." },
  { icon: "🔗", title: "REST API", desc: "Integrate with anything via our full-featured REST API." },

];

function EverythingYouNeed() {
  return (
    <section id="why" className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-12">
          <p className="text-xs font-bold text-[#E8442A] uppercase tracking-widest mb-2">Complete Platform</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Everything you need from sales to shipping</h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">One platform to replace five different tools. Built for teams that can't afford mistakes at scale.</p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {EVERYTHING.map((f, i) => (
            <Reveal key={f.title} delay={i * 60}>
              <div className="bg-white dark:bg-gray-950 rounded-xl p-5 border border-gray-200 dark:border-gray-800 hover:border-[#E8442A]/30 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-lg bg-[#E8442A]/10 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5 text-sm">{f.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}


// ============================================================================
// INTEGRATIONS
// ============================================================================
const INTEGRATIONS = [
  { name: "Shopify", color: "#96bf48", icon: SiShopify },
  { name: "Amazon", color: "#FF9900", icon: FaAmazon }, // Updated this line
  { name: "QuickBooks", color: "#2CA01C", icon: SiQuickbooks },
  { name: "Stripe", color: "#635BFF", icon: SiStripe },
  { name: "FedEx", color: "#4D148C", icon: SiFedex },
  { name: "UPS", color: "#351C15", icon: SiUps },
  { name: "Etsy", color: "#F56400", icon: SiEtsy },
  { name: "WooCommerce", color: "#7f54b3", icon: SiWoocommerce },
  { name: "Xero", color: "#13B5EA", icon: SiXero },
  { name: "Salesforce", color: "#00A1E0", icon: SiSalesforce },
  { name: "Slack", color: "#4A154B", icon: SiSlack },
  { name: "Zapier", color: "#FF4A00", icon: SiZapier },
];

function Integrations() {
  return (
    <section id="integrations" className="py-16 bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-10">
          <p className="text-xs font-bold text-[#E8442A] uppercase tracking-widest mb-2">Integrations</p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Tightly integrated with apps to manage every part of your business</h2>
        </Reveal>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {INTEGRATIONS.map((int, i) => (
            <Reveal key={int.name} delay={i * 40}>
              <div className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all group bg-gray-50/50 dark:bg-gray-900/50">
                {/* Logo Container */}
                <div
                  className="text-2xl transition-transform group-hover:scale-110 duration-300"
                  style={{ color: int.color }}
                >
                  <int.icon size={32} />
                </div>

                <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold text-center leading-tight">
                  {int.name}
                </span>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="text-center mt-10">
          <Link href="#" className="text-sm font-bold text-[#E8442A] inline-flex items-center gap-1 hover:gap-2 transition-all">
            View all integrations
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================================
// PRICING
// ============================================================================
const PLANS = [
  { name: "Free", monthly: 0, yearly: 0, desc: "For solo sellers", features: ["100 SKUs", "1 warehouse", "Basic reports", "Email support", "2 integrations"], cta: "Get Started Free", popular: false },
  { name: "Standard", monthly: 49, yearly: 39, desc: "For growing teams", features: ["2,000 SKUs", "3 warehouses", "Advanced analytics", "Priority support", "10 integrations", "Barcode scanning"], cta: "Start Free Trial", popular: false },
  { name: "Professional", monthly: 129, yearly: 99, desc: "For scaling operations", features: ["20,000 SKUs", "Unlimited warehouses", "Custom fields (15+)", "Dedicated support", "Unlimited integrations", "Real-time WebSocket sync", "Optimistic locking"], cta: "Start Free Trial", popular: true },
  { name: "Enterprise", monthly: 299, yearly: 229, desc: "Enterprise control", features: ["Unlimited SKUs", "Global warehouses", "White-label option", "SLA guarantee", "Custom integrations", "Dedicated CSM", "SSO & SAML"], cta: "Contact Sales", popular: false },
];

function Pricing() {
  const [yearly, setYearly] = useState(true);
  return (
    <section id="pricing" className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-10">
          <p className="text-xs font-bold text-[#E8442A] uppercase tracking-widest mb-2">Simple Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">No surprises.</h2>
          <p className="text-gray-600 dark:text-gray-400">All plans include a 14-day free trial. No credit card required.</p>
          {/* Toggle */}
          <div className="mt-6 inline-flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1">
            <button onClick={() => setYearly(false)} className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${!yearly ? "bg-[#E8442A] text-white" : "text-gray-600 dark:text-gray-400"}`}>Monthly</button>
            <button onClick={() => setYearly(true)} className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${yearly ? "bg-[#E8442A] text-white" : "text-gray-600 dark:text-gray-400"}`}>Yearly</button>
          </div>
          {yearly && <div className="mt-2 text-xs text-green-600 dark:text-green-400 font-medium">Save up to 23% with yearly billing</div>}
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 70}>
              <div className={`relative bg-white dark:bg-gray-950 rounded-2xl border ${plan.popular ? "border-[#E8442A] shadow-lg shadow-[#E8442A]/10" : "border-gray-200 dark:border-gray-800"} p-5 h-full flex flex-col`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#E8442A] text-white text-xs font-bold rounded-full whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">{plan.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 mb-4">{plan.desc}</p>
                  <div className="flex items-baseline gap-1 mb-5 pb-5 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {plan[yearly ? "yearly" : "monthly"] === 0 ? "Free" : `$${plan[yearly ? "yearly" : "monthly"]}`}
                    </span>
                    {plan[yearly ? "yearly" : "monthly"] > 0 && <span className="text-sm text-gray-400">/mo</span>}
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <svg className="w-3.5 h-3.5 text-[#E8442A] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto">
                  <Link href={plan.cta === "Contact Sales" ? "/contact" : "/sign-up"} className={`block w-full text-center py-2.5 rounded-lg text-sm font-semibold transition-colors ${plan.popular ? "bg-[#E8442A] hover:bg-[#d03820] text-white" : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"}`}>
                    {plan.cta}
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// TESTIMONIALS
// ============================================================================
const TESTIMONIALS = [
  { quote: "Itransition cut our stockout rate by 94% in the first month. The real-time sync across all our channels is flawless.", name: "Sarah Chen", title: "Head of Operations, Luminary Goods", avatar: "SC", color: "#818cf8" },
  { quote: "We replaced five different tools with Itransition. The API and custom fields are exactly what enterprise needs.", name: "Marcus Webb", title: "CTO, DistributeCo", avatar: "MW", color: "#34d399" },
  { quote: "Optimistic locking was the feature we didn't know we needed. No more conflicts between our warehouse teams.", name: "Priya Sharma", title: "VP Supply Chain, NovaTrade", avatar: "PS", color: "#fb923c" },
];

function Testimonials() {
  return (
    <section className="py-16 bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal className="text-center mb-10">
          <p className="text-xs font-bold text-[#E8442A] uppercase tracking-widest mb-2">Customer Stories</p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Trusted by operations teams worldwide</h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 80}>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-5 italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: t.color }}>{t.avatar}</div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.title}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FINAL CTA
// ============================================================================
function FinalCTA() {
  return (
    <section className="py-16 bg-[#E8442A]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <Reveal>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to take control of your inventory?</h2>
          <p className="text-red-100 mb-8 text-lg">Join 2,400+ businesses that replaced spreadsheet chaos with Itransition.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/sign-up" className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-white text-[#E8442A] font-bold rounded-lg text-sm hover:bg-red-50 transition-colors shadow-lg">
              Get Started Free
            </Link>
            <Link href="/" className="inline-flex items-center justify-center gap-2 px-7 py-3 border-2 border-white/60 text-white font-semibold rounded-lg text-sm hover:bg-white/10 transition-colors">
              Talk to Sales
            </Link>
          </div>
          <p className="text-red-200 text-xs mt-5">14-day free trial · No credit card required · Cancel anytime</p>
          <div className="flex justify-center gap-4 mt-6">

            {/* Google Play Link */}
            <Link href="https://play.google.com" target="_blank" rel="noopener noreferrer">
              <AppBadge store="google" />
            </Link>

            {/* Apple App Store Link */}
            <Link href="https://apps.apple.com" target="_blank" rel="noopener noreferrer">
              <AppBadge store="apple" />
            </Link>

          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================================
// FOOTER
// ============================================================================
const FOOTER_LINKS = {
  Product: ["Features", "Pricing", "Changelog", "Integrations", "API Docs"],
  Company: ["About", "Blog", "Careers", "Press", "Partners"],
  Support: ["Documentation", "API Reference", "Status Page", "Contact", "Community"],
  Legal: ["Privacy Policy", "Terms of Service", "Security", "Cookies"],
};

function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 pt-12 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded bg-[#E8442A] flex items-center justify-center">
                <svg width="14" height="14" fill="none" viewBox="0 0 16 16">
                  <rect x="1" y="1" width="6" height="6" rx="1" fill="white" />
                  <rect x="9" y="1" width="6" height="6" rx="1" fill="white" opacity=".7" />
                  <rect x="1" y="9" width="6" height="6" rx="1" fill="white" opacity=".7" />
                  <rect x="9" y="9" width="6" height="6" rx="1" fill="white" opacity=".4" />
                </svg>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">InventoryOS</span>
            </div>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">Modern inventory management built for teams that move fast and can't afford mistakes.</p>
            <div className="flex gap-2 mt-5">
              {["𝕏", "in", "fb"].map((icon) => (
                <button key={icon} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center text-xs hover:bg-[#E8442A]/10 hover:text-[#E8442A] transition-colors">{icon}</button>
              ))}
            </div>
          </div>
          {Object.entries(FOOTER_LINKS).map(([cat, links]) => (
            <div key={cat}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{cat}</h4>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l}>
                    <Link href="#" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">{l}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between gap-3 text-xs text-gray-400">
          <span>© 2026 InventoryOS. All rights reserved.</span>
          <span>Made for operations teams worldwide</span>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// FLOATING CHAT
// ============================================================================
function FloatingChat() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.85, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: 16 }} className="absolute bottom-14 right-0 w-72 mb-3 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-[#E8442A] px-4 py-3 text-white">
              <div className="font-semibold text-sm">Chat with us</div>
              <div className="text-xs text-red-200">Typically replies in &lt;1 min</div>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Hi there! 👋 Have questions about Itransition? We're here to help.</p>
              <button className="w-full py-2 bg-[#E8442A]/10 dark:bg-[#E8442A]/20 text-[#E8442A] rounded-lg text-sm font-medium hover:bg-[#E8442A]/20 transition-colors">Start a conversation</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => setOpen(!open)} className="w-12 h-12 rounded-full bg-[#E8442A] hover:bg-[#d03820] text-white shadow-lg flex items-center justify-center transition-colors" aria-label="Chat">
        {open
          ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
      </button>
    </div>
  );
}

// ============================================================================
// ROOT PAGE
// ============================================================================
export default function InventoryHomePage() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      html { scroll-behavior: smooth; }
      html[data-theme="dark"] { color-scheme: dark; }
      html[data-theme="light"] { color-scheme: light; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-200">
        <Header />
        <main>
          <Hero />
          <FeatureSections />
          <CTABanner />
          <EverythingYouNeed />
          <Integrations />
          <Testimonials />
          <Pricing />
          <FinalCTA />
        </main>
        <Footer />
        <FloatingChat />
      </div>
    </ThemeProvider>
  );
}