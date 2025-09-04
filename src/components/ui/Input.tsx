"use client";

import { cn } from "../../lib/cn";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className, ...props }: Props) {
	return (
		<input
			className={cn(
				"w-full h-10 rounded-md border border-foreground/20 bg-background px-3 text-foreground placeholder:text-foreground/50 focus:ring-2 focus:ring-foreground/20 focus:outline-none",
				className
			)}
			{...props}
		/>
	);
}



