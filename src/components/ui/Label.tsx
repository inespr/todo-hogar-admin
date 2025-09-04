export default function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
	return <label htmlFor={htmlFor} className="block text-sm text-foreground/70 mb-1">{children}</label>;
}



