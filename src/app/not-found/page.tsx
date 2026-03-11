import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="text-center">
        <div className="text-8xl font-bold text-[var(--border)] mb-4">404</div>
        <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Page not found</h1>
        <p className="text-[var(--text-muted)] mb-6">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}