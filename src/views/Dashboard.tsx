"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export default function Dashboard({ email }: { email: string }) {
  const router = useRouter();

  async function signOut() {
    await createClient().auth.signOut();
    router.replace("/sign-in");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <Button variant="outline" onClick={signOut}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </header>
      <main className="relative flex-1">
        <div className="pointer-events-none absolute inset-0 bg-glow" />
        <div className="relative mx-auto max-w-3xl px-4 py-24 text-center animate-in fade-in slide-in-from-bottom-2 duration-500 sm:px-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Hi {email}</h1>
          <p className="mt-4 text-muted-foreground">
            Your dashboard is coming soon. Upload functionality will be added in the next milestone.
          </p>
        </div>
      </main>
    </div>
  );
}
