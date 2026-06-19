import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";

type Variant = "error" | "info" | "success" | "warning";

const STYLES: Record<Variant, { box: string; icon: string; Icon: typeof Info }> = {
  error:   { box: "border-fcb-red/40 bg-fcb-red/10",   icon: "text-fcb-red",   Icon: AlertCircle },
  info:    { box: "border-fcb-blue/40 bg-fcb-blue/10",  icon: "text-fcb-blue",  Icon: Info },
  // dark:-Split für die Status-Icons: das 500er-Icon ist auf dem hellen /10-Tint
  // im Light-Theme zu kontrastarm → Light = dunkleres 600er, Dark = helleres 500er.
  success: { box: "border-green-500/40 bg-green-500/10", icon: "text-green-600 dark:text-green-500", Icon: CheckCircle2 },
  warning: { box: "border-yellow-500/40 bg-yellow-500/10", icon: "text-yellow-600 dark:text-yellow-500", Icon: TriangleAlert },
};

export default function Banner({ variant, message }: { variant: Variant; message: string }) {
  if (!message) return null;
  const { box, icon, Icon } = STYLES[variant];
  return (
    <div className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 font-inter text-sm text-fcb-text ${box}`}>
      <Icon size={16} className={`mt-0.5 shrink-0 ${icon}`} />
      <span>{message}</span>
    </div>
  );
}
