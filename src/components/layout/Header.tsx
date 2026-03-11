import { GlobalSearch } from "./GlobalSearch";

export function Header({ title }: { title?: string }) {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--border)] bg-[var(--bg-card)]">
      {title && (
        <h1 className="text-lg font-semibold text-[var(--text)] hidden lg:block">{title}</h1>
      )}
      <div className="flex-1 lg:flex-none flex justify-end lg:justify-start lg:ml-auto">
        <GlobalSearch />
      </div>
    </header>
  );
}