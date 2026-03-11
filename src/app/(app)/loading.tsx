export default function Loading() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-pulse">
      <div className="h-8 bg-[var(--border)] rounded-lg w-48 mb-2" />
      <div className="h-4 bg-[var(--border)] rounded w-72 mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-5 h-24" />
        ))}
      </div>
      <div className="card h-64" />
    </div>
  );
}