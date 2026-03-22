import { cn } from "@/lib/cn";

const variants = {
  primary: "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500",
  secondary: "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700",
  ghost: "bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-transparent",
  danger: "bg-red-600/10 hover:bg-red-600/20 text-red-400 border-red-500/30",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: "sm" | "md" | "lg";
}

export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition-colors disabled:opacity-50",
        variants[variant],
        size === "sm" && "px-2.5 py-1 text-xs",
        size === "md" && "px-4 py-2 text-sm",
        size === "lg" && "px-6 py-2.5 text-base",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
