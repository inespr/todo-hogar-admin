"use client";

import { cn } from "../../lib/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: "primary" | "secondary" | "danger" | "ghost";
	size?: "sm" | "md" | "lg";
};

export default function Button({ className, variant = "primary", size = "md", ...props }: Props) {
	const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed";
	const variants: Record<string, string> = {
		primary: "bg-foreground text-background hover:opacity-90",
		secondary: "border border-foreground/20 hover:bg-foreground/5",
		danger: "bg-red-600 text-white hover:bg-red-700",
		ghost: "hover:bg-foreground/5",
	};
	const sizes: Record<string, string> = {
		sm: "h-8 px-3 text-sm",
		md: "h-10 px-4 text-sm",
		lg: "h-12 px-5 text-base",
	};
	return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}



