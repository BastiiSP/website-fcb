import { AlertCircle } from "lucide-react";

export default function AuthErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 rounded-lg border border-fcb-red/40 bg-fcb-red/10 px-3 py-2.5 font-inter text-sm text-fcb-text">
      <AlertCircle size={16} className="mt-0.5 shrink-0 text-fcb-red" />
      <span>{message}</span>
    </div>
  );
}
