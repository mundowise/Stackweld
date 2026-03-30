import { cn } from "@/lib/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ children, className, onClick, hoverable }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-zinc-900 border border-zinc-800 rounded-xl p-4",
        hoverable && "cursor-pointer hover:border-zinc-700 hover:bg-zinc-900/80 transition-colors",
        onClick && "cursor-pointer",
        className,
      )}
    >
      {children}
    </div>
  );
}
