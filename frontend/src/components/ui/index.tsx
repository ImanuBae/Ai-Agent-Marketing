import { LucideIcon, Loader2 } from "lucide-react";
import React from "react";

// ─────────────────────────────────────────────
// Button
// ─────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  children: React.ReactNode;
}

const buttonVariants = {
  primary:
    "bg-[#E8734A] hover:bg-[#D4623C] text-white shadow-sm hover:shadow-md",
  secondary:
    "bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white",
  outline:
    "border border-gray-200 dark:border-white/10 bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300",
  ghost:
    "bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400",
  destructive:
    "bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md",
};

const buttonSizes = {
  sm: "text-xs px-3 py-1.5 rounded-lg gap-1.5",
  md: "text-sm px-4 py-2.5 rounded-xl gap-2",
  lg: "text-base px-6 py-3 rounded-2xl gap-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === "sm" ? 14 : size === "lg" ? 18 : 16} className="animate-spin" />
      ) : LeftIcon ? (
        <LeftIcon size={size === "sm" ? 14 : size === "lg" ? 18 : 16} />
      ) : null}
      {children}
      {!loading && RightIcon && (
        <RightIcon size={size === "sm" ? 14 : size === "lg" ? 18 : 16} />
      )}
    </button>
  );
}

// ─────────────────────────────────────────────
// Badge
// ─────────────────────────────────────────────
interface BadgeProps {
  variant?: "default" | "success" | "warning" | "error" | "info" | "coral";
  children: React.ReactNode;
  className?: string;
}

const badgeVariants = {
  default:
    "bg-gray-100 text-gray-600 border-gray-200 dark:bg-white/10 dark:text-gray-300 dark:border-white/10",
  success:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  warning:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  error:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  info:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  coral:
    "bg-[#E8734A]/10 text-[#E8734A] border-[#E8734A]/20",
};

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeVariants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────
// Card
// ─────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = "", hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-3xl shadow-sm ${
        hover ? "hover:-translate-y-1 transition-transform cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// Spinner
// ─────────────────────────────────────────────
interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 20, className = "text-[#E8734A]" }: SpinnerProps) {
  return <Loader2 size={size} className={`animate-spin ${className}`} />;
}

// ─────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────
interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-12">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
          <Icon size={26} className="text-gray-400" />
        </div>
      )}
      <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{title}</p>
      {description && (
        <p className="text-xs text-gray-400 max-w-xs">{description}</p>
      )}
      {action}
    </div>
  );
}

// ─────────────────────────────────────────────
// Divider
// ─────────────────────────────────────────────
export function Divider({ className = "" }: { className?: string }) {
  return (
    <div className={`border-t border-gray-200 dark:border-white/5 ${className}`} />
  );
}

// ─────────────────────────────────────────────
// Avatar
// ─────────────────────────────────────────────
interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const avatarSizes = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

export function Avatar({ src, name, size = "md", className = "" }: AvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name ?? "avatar"}
        className={`rounded-full object-cover ${avatarSizes[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-[#E8734A]/10 text-[#E8734A] font-bold flex items-center justify-center ${avatarSizes[size]} ${className}`}
    >
      {initials}
    </div>
  );
}
