export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
	return <div className={`rounded-xl border border-foreground/15 bg-background ${className ?? ""}`}>{children}</div>;
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
	return <div className={`p-5 ${className ?? ""}`}>{children}</div>;
}

export function CardHeader({ title, actions }: { title: string; actions?: React.ReactNode }) {
	return (
		<div className="p-5 border-b border-foreground/10 flex items-center justify-between">
			<h2 className="text-lg font-semibold">{title}</h2>
			{actions}
		</div>
	);
}



