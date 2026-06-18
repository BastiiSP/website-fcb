type Variant = "neutral" | "blue" | "green" | "yellow" | "red" | "purple";

const STYLES: Record<Variant, string> = {
  neutral: "border-fcb-border bg-fcb-surface text-fcb-muted",
  blue:    "border-fcb-blue/40 bg-fcb-blue/10 text-fcb-blue",
  green:   "border-green-500/40 bg-green-500/10 text-green-500",
  yellow:  "border-yellow-500/40 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  red:     "border-fcb-red/40 bg-fcb-red/10 text-fcb-red",
  purple:  "border-purple-500/40 bg-purple-500/10 text-purple-500",
};

export default function Badge({
  variant = "neutral",
  children,
}: {
  variant?: Variant;
  children: React.ReactNode;
}) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-inter text-xs font-medium ${STYLES[variant]}`}>
      {children}
    </span>
  );
}
