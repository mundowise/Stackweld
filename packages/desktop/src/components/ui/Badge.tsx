import { cn } from "@/lib/cn";

const variants = {
  runtime: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  frontend: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  backend: "bg-green-500/15 text-green-400 border-green-500/30",
  database: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  orm: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  auth: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  styling: "bg-pink-500/15 text-pink-400 border-pink-500/30",
  service: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  devops: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  success: "bg-green-500/15 text-green-400 border-green-500/30",
  warning: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  error: "bg-red-500/15 text-red-400 border-red-500/30",
  default: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
