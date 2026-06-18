export default function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border border-fcb-border bg-fcb-surface p-6 ${className}`}
    >
      {children}
    </div>
  );
}
