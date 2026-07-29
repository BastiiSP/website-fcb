import { Info } from "lucide-react";

export default function AuthInfoBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 rounded-lg border border-fcb-accent/40 bg-fcb-accent/10 px-3 py-2.5 font-inter text-sm text-fcb-text">
      <Info size={16} className="mt-0.5 shrink-0 text-fcb-accent" />
      <span>{message}</span>
    </div>
  );
}
