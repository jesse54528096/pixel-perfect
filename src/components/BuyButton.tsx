"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

// Shared across the tier cards so only one checkout session can be in flight.
let inFlight = false;

export function BuyButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);

  async function buy() {
    if (inFlight) return;
    inFlight = true;
    setLoading(true);
    try {
      const res = await fetch("/api/credits/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.url) {
        alert(body.error ?? "Checkout failed");
        return;
      }
      window.location.href = body.url;
    } finally {
      inFlight = false;
      setLoading(false);
    }
  }

  return (
    <Button className="w-full" onClick={buy} disabled={loading}>
      {loading ? "Opening checkout…" : "Buy"}
    </Button>
  );
}
