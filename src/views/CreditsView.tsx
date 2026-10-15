import Link from "next/link";
import { format } from "date-fns";
import { Logo } from "@/components/Logo";
import { BuyButton } from "@/components/BuyButton";
import type { Tables } from "@/integrations/supabase/types";

type Product = Pick<Tables<"credit_products">, "id" | "name" | "credits" | "price_usd">;
type Transaction = Pick<Tables<"credit_transactions">, "id" | "amount" | "type" | "description" | "created_at">;

const typeStyles: Record<Transaction["type"], string> = {
  purchase: "text-green-400",
  signup_bonus: "text-yellow-400",
  deduction: "text-muted-foreground",
  admin_grant: "text-blue-400",
};

const usd = (n: number) => `$${n.toFixed(2)}`;

export default function CreditsView({
  balance,
  products,
  transactions,
}: {
  balance: number;
  products: Product[];
  transactions: Transaction[];
}) {
  // Bonus is measured against the smallest pack's $/credit.
  const baseline = [...products].sort((a, b) => a.credits - b.credits)[0];
  const baselineRate = baseline ? baseline.price_usd / baseline.credits : 0;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-4 text-sm">
            <Link href="/upload" className="text-muted-foreground hover:text-foreground">
              Upload
            </Link>
            <Link href="/app" className="text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
          </div>
        </div>
      </header>
      <main className="relative flex-1">
        <div className="pointer-events-none absolute inset-0 bg-glow" />
        <div className="relative mx-auto max-w-4xl space-y-10 px-4 py-16 sm:px-6">
          <section className="rounded-2xl border bg-card p-7">
            <p className="text-sm text-muted-foreground">Your balance</p>
            <p className="mt-1 text-4xl font-bold tracking-tight">{balance} credits</p>
            <p className="mt-2 text-sm text-muted-foreground">1 credit = 1 minute of video</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Buy credits</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {products.map((p) => {
                const rate = p.price_usd / p.credits;
                const bonusPct = baselineRate ? Math.round((1 - rate / baselineRate) * 100) : 0;
                return (
                  <div key={p.id} className="flex flex-col rounded-2xl border bg-card p-6">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold">{p.name}</h3>
                      {bonusPct > 0 && (
                        <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-400">
                          +{bonusPct}%
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-3xl font-bold">{usd(p.price_usd)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{usd(rate)} per credit</p>
                    <div className="mt-6">
                      <BuyButton productId={p.id} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold">History</h2>
            {transactions.length === 0 ? (
              <p className="mt-6 rounded-2xl border bg-card p-7 text-muted-foreground">No transactions yet.</p>
            ) : (
              <div className="mt-6 overflow-x-auto rounded-2xl border bg-card">
                <table className="w-full text-left text-sm">
                  <thead className="border-b text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Description</th>
                      <th className="px-4 py-3 text-right font-medium">Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.id} className="border-b last:border-0">
                        <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                          {format(new Date(t.created_at), "yyyy-MM-dd HH:mm")}
                        </td>
                        <td className="px-4 py-3">{t.description ?? t.type}</td>
                        <td className={`px-4 py-3 text-right font-medium ${typeStyles[t.type]}`}>
                          {t.amount > 0 ? `+${t.amount}` : t.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
