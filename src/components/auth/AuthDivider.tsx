export default function AuthDivider() {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-fcb-border" />
      <span className="font-inter text-xs uppercase tracking-widest text-fcb-muted">oder</span>
      <span className="h-px flex-1 bg-fcb-border" />
    </div>
  );
}
