"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { Button } from "@chakra-ui/react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { signOutUser } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur border-b border-foreground/10 bg-background/80 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          {/* Logo / Nombre empresa */}
          <Link
            href="/dashboard"
            className="text-lg font-bold text-orange-600 hover:text-orange-500 transition-colors"
          >
            Todo Hogar Factory · Admin
          </Link>

          {/* Navegación */}
          <nav className="flex items-center gap-4">
            <Button variant="secondary" onClick={signOutUser}>
              Salir
            </Button>
          </nav>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-6xl mx-auto p-6">{children}</main>
    </div>
  );
}
