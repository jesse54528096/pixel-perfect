"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

// The webhook usually lands within a few seconds; re-render a few times so the
// new balance shows up without a manual reload.
export default function CreditsSuccessView({ balance }: { balance: number }) {
  const router = useRouter();
  const tries = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      tries.current += 1;
      if (tries.current > 5) return clearInterval(id);
      router.refresh();
    }, 2000);
    return () => clearInterval(id);
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <Logo />
        </div>
      </header>
      <main className="relative flex-1">
        <div className="pointer-events-none absolute inset-0 bg-glow" />
        <div className="relative mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-400" />
          <h1 className="mt-6 text-3xl font-bold tracking-tight">Payment received</h1>
          <p className="mt-4 text-muted-foreground">Your balance is now</p>
          <p className="mt-1 text-4xl font-bold">{balance} credits</p>
          <p className="mt-4 text-sm text-muted-foreground">
            Credits can take a few seconds to appear after payment.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild>
              <Link href="/upload">Transcribe a video</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/credits">Back to credits</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
